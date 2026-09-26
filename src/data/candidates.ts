export type Candidate = {
	id: string;
	name: string;
	originPw: string;
	originPd: string;
	photo: string;
	profile: Record<ProfileSection, string>;
};

export const profileSections = ["Sinopsis", "Visi", "Misi", "Program unggulan"] as const;
export type ProfileSection = (typeof profileSections)[number];

const candidateFiles = import.meta.glob<string>("./candidates/*.md", {
	eager: true,
	query: "?raw",
	import: "default",
});

// Filename prefixes preserve the supplied candidate order.
export const candidates: readonly Candidate[] = Object.entries(candidateFiles)
	.sort(([left], [right]) => left.localeCompare(right))
	.map(([path, markdown]) => parseCandidate(path, markdown));

function parseCandidate(path: string, markdown: string): Candidate {
	const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(markdown);
	if (!match) throw new Error(`Frontmatter calon tidak valid: ${path}`);
	const frontmatter = Object.fromEntries(
		match[1].split(/\r?\n/).map((line) => {
			const separator = line.indexOf(":");
			if (separator < 1) throw new Error(`Frontmatter calon tidak valid: ${path}`);
			return [line.slice(0, separator).trim(), unquote(line.slice(separator + 1).trim())];
		}),
	);
	const name = frontmatter.nama;
	const originPw = frontmatter.asal_pw;
	const originPd = frontmatter.asal_pd;
	if (!name || !originPw || !originPd) throw new Error(`Data calon belum lengkap: ${path}`);
	const filename = path.split("/").pop()?.replace(/\.md$/, "");
	if (!filename) throw new Error(`Nama berkas calon tidak valid: ${path}`);
	return {
		id: filename,
		name,
		originPw,
		originPd,
		photo: frontmatter.foto ?? "",
		profile: parseProfile(match[2]),
	};
}

function parseProfile(markdown: string): Record<ProfileSection, string> {
	const profile = Object.fromEntries(profileSections.map((section) => [section, ""])) as Record<ProfileSection, string>;
	let current: ProfileSection = "Sinopsis";
	for (const line of markdown.trim().split(/\r?\n/)) {
		const heading = /^##\s+(.+?)\s*$/.exec(line);
		const section = profileSections.find((item) => item.toLowerCase() === heading?.[1].toLowerCase());
		if (section) {
			current = section;
			continue;
		}
		profile[current] += `${line}\n`;
	}
	for (const section of profileSections) profile[section] = profile[section].trim();
	return profile;
}

function unquote(value: string) {
	if (value.startsWith('"') && value.endsWith('"')) {
		try { return JSON.parse(value) as string; } catch { return ""; }
	}
	if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
	return value;
}
