import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";

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

export default app;
