import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";
import { candidates } from "../data/candidates";

type Organization = {
	id: string;
	nama: string;
	slug: string;
	jenis: string;
};
type CachedDirectory = { items: Organization[]; savedAt: number };
type RuntimeEnv = Env & { KAMMI_API_TOKEN?: string };

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const ORGANIZATION_API = "https://www.kammi.id/api/v1/struktur";
const VOTE_CLOSES_AT = Date.parse("2026-10-29T16:59:59.999Z");
const EDIT_COOKIE = "poll_edit";
const CADRE_LEVELS = ["AB1", "AB2", "AB3"] as const;
const LEADERSHIP_POSITIONS = [
	"Ketua", "Sekretaris", "Bendahara", "Kaderisasi", "Ketua Bidang", "Ketua Departemen", "Staf Bidang", "Non Pengurus",
] as const;

type VoteInput = {
	candidateId: string;
	pwId: string;
	pdId: string;
	cadreLevel: (typeof CADRE_LEVELS)[number];
	leadershipPosition: (typeof LEADERSHIP_POSITIONS)[number];
};
type VoteRow = VoteInput & { pwName: string; pdName: string };

export class OrganizationDirectoryCache extends DurableObject<RuntimeEnv> {
	async fetch(request: Request): Promise<Response> {
		const requestUrl = new URL(request.url);
		const kind = requestUrl.searchParams.get("jenis");
		const ancestor = requestUrl.searchParams.get("ancestor");

		if (kind !== "pw" && kind !== "pd") {
			return Response.json({ error: "Jenis organisasi tidak valid." }, { status: 400 });
		}
		if (kind === "pd" && !ancestor) {
			return Response.json({ error: "Asal PW wajib dipilih." }, { status: 400 });
		}

		const cacheKey = kind === "pw" ? "pw" : `pd:${ancestor}`;
		const cached = await this.ctx.storage.get<CachedDirectory>(cacheKey);
		if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
			return Response.json(cached.items);
		}

		if (!this.env.KAMMI_API_TOKEN) {
			return cached
				? Response.json(cached.items, { headers: { "X-Directory-Cache": "stale" } })
				: Response.json({ error: "Daftar organisasi belum tersedia." }, { status: 503 });
		}

		const upstreamUrl = new URL(ORGANIZATION_API);
		upstreamUrl.searchParams.set("jenis", kind);
		if (kind === "pd") upstreamUrl.searchParams.set("ancestor", ancestor!);

		try {
			const response = await fetch(upstreamUrl, {
				headers: { Authorization: `Bearer ${this.env.KAMMI_API_TOKEN}` },
			});
			if (!response.ok) throw new Error("Upstream request failed");

			const payload: unknown = await response.json();
			if (!Array.isArray(payload)) throw new Error("Invalid upstream response");
			const items = payload.filter(isOrganization);
			if (items.length !== payload.length) throw new Error("Invalid upstream organization");

			const updated = { items, savedAt: Date.now() } satisfies CachedDirectory;
			await this.ctx.storage.put(cacheKey, updated);
			return Response.json(items);
		} catch {
			return cached
				? Response.json(cached.items, { headers: { "X-Directory-Cache": "stale" } })
				: Response.json({ error: "Daftar organisasi belum tersedia." }, { status: 503 });
		}
	}
}

function isOrganization(value: unknown): value is Organization {
	if (typeof value !== "object" || value === null) return false;
	const organization = value as Record<string, unknown>;
	return (
		typeof organization.id === "string" &&
		typeof organization.nama === "string" &&
		typeof organization.slug === "string" &&
		typeof organization.jenis === "string"
	);
}

const app = new Hono<{ Bindings: RuntimeEnv }>();

app.get("/api/struktur", async (c) => {
	const kind = c.req.query("jenis");
	const ancestor = c.req.query("ancestor");
	if (kind !== "pw" && kind !== "pd") {
		return c.json({ error: "Jenis organisasi tidak valid." }, 400);
	}
	if (kind === "pd" && !ancestor) {
		return c.json({ error: "Asal PW wajib dipilih." }, 400);
	}

	const url = new URL("https://directory-cache.internal/");
	url.searchParams.set("jenis", kind);
	if (kind === "pd") url.searchParams.set("ancestor", ancestor!);
	const id = c.env.ORGANIZATION_DIRECTORY.idFromName("polling-organizations");
	return c.env.ORGANIZATION_DIRECTORY.get(id).fetch(url);
});

app.get("/api/suara", async (c) => {
	const currentToken = getCookie(c.req.header("Cookie"), EDIT_COOKIE);
	const token = currentToken ?? createToken();
	if (!currentToken) {
		const response = c.json({ vote: null }, 200, { "Cache-Control": "no-store" });
		setEditCookie(response, token, c.req.url);
		return response;
	}
	const tokenHash = await hashToken(token);
	const vote = await c.env.POLLING_DB.prepare(
		"SELECT candidate_id AS candidateId, pw_id AS pwId, pw_name AS pwName, pd_id AS pdId, pd_name AS pdName, cadre_level AS cadreLevel, leadership_position AS leadershipPosition FROM votes WHERE token_hash = ?",
	).bind(tokenHash).first<VoteRow>();
	return c.json({ vote }, 200, { "Cache-Control": "no-store" });
});

app.post("/api/suara", async (c) => {
	if (Date.now() > VOTE_CLOSES_AT) {
		return c.json({ error: "Polling telah ditutup." }, 410, { "Cache-Control": "no-store" });
	}
	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Format suara tidak valid." }, 400, { "Cache-Control": "no-store" });
	}
	if (!isVoteInput(body)) {
		return c.json({ error: "Lengkapi seluruh pilihan dengan benar." }, 400, { "Cache-Control": "no-store" });
	}
	const candidate = candidates.find(({ id }) => id === body.candidateId);
	if (!candidate) {
		return c.json({ error: "Daftar calon belum tersedia." }, 503, { "Cache-Control": "no-store" });
	}

	const [pwResponse, pdResponse] = await Promise.all([
		loadDirectory(c.env, "pw"),
		loadDirectory(c.env, "pd", body.pwId),
	]);
	if (!pwResponse || !pdResponse) {
		return c.json({ error: "Daftar organisasi belum tersedia. Suara belum disimpan." }, 503, { "Cache-Control": "no-store" });
	}
	const pw = pwResponse.find((item) => item.id === body.pwId && item.jenis === "pw");
	const pd = pdResponse.find((item) => item.id === body.pdId && item.jenis === "pd");
	if (!pw || !pd) {
		return c.json({ error: "Pilihan asal PW atau PD tidak valid." }, 400, { "Cache-Control": "no-store" });
	}

	const existingToken = getCookie(c.req.header("Cookie"), EDIT_COOKIE);
	const token = existingToken ?? createToken();
	const tokenHash = await hashToken(token);
	await c.env.POLLING_DB.prepare(
		`INSERT INTO votes (token_hash, candidate_id, pw_id, pw_name, pd_id, pd_name, cadre_level, leadership_position)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		 ON CONFLICT(token_hash) DO UPDATE SET candidate_id = excluded.candidate_id, pw_id = excluded.pw_id,
		 pw_name = excluded.pw_name, pd_id = excluded.pd_id, pd_name = excluded.pd_name,
		 cadre_level = excluded.cadre_level, leadership_position = excluded.leadership_position,
		 updated_at = CURRENT_TIMESTAMP`,
	).bind(tokenHash, candidate.id, pw.id, pw.nama, pd.id, pd.nama, body.cadreLevel, body.leadershipPosition).run();

	const response = c.json({ ok: true, updated: Boolean(existingToken) }, 200, { "Cache-Control": "no-store" });
	if (!existingToken) {
		setEditCookie(response, token, c.req.url);
	}
	return response;
});

function isVoteInput(value: unknown): value is VoteInput {
	if (typeof value !== "object" || value === null) return false;
	const input = value as Record<string, unknown>;
	return typeof input.candidateId === "string" && typeof input.pwId === "string" &&
		typeof input.pdId === "string" &&
		CADRE_LEVELS.includes(input.cadreLevel as (typeof CADRE_LEVELS)[number]) &&
		LEADERSHIP_POSITIONS.includes(input.leadershipPosition as (typeof LEADERSHIP_POSITIONS)[number]);
}

async function loadDirectory(env: RuntimeEnv, kind: "pw" | "pd", ancestor?: string) {
	const url = new URL("https://directory-cache.internal/");
	url.searchParams.set("jenis", kind);
	if (ancestor) url.searchParams.set("ancestor", ancestor);
	const id = env.ORGANIZATION_DIRECTORY.idFromName("polling-organizations");
	try {
		const response = await env.ORGANIZATION_DIRECTORY.get(id).fetch(url);
		if (!response.ok) return null;
		const items: unknown = await response.json();
		return Array.isArray(items) ? items.filter(isOrganization) : null;
	} catch {
		return null;
	}
}

function createToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function hashToken(token: string) {
	const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
	return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getCookie(header: string | undefined, name: string) {
	const prefix = `${name}=`;
	const value = header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
	return value ? value.slice(prefix.length) : undefined;
}

function setEditCookie(response: Response, token: string, requestUrl: string) {
	response.headers.append(
		"Set-Cookie",
		`${EDIT_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(requestUrl).protocol === "https:" ? "; Secure" : ""}`,
	);
}

export default app;
