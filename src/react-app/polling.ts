export type Organization = { id: string; nama: string; slug: string; jenis: string };
export type Vote = {
	candidateId: string;
	pwId: string;
	pdId: string;
	cadreLevel: string;
	leadershipPosition: string;
};
export type PollResult = Vote & { pwName: string; pdName: string; voteCount: number };

export const cadreLevels = ["AB1", "AB2", "AB3"];
export const leadershipPositions = [
	"Ketua", "Sekretaris", "Bendahara", "Kaderisasi", "Ketua Bidang",
	"Ketua Departemen", "Staf Bidang", "Non Pengurus",
];

export async function loadOrganizations(query: URLSearchParams, signal: AbortSignal): Promise<Organization[]> {
	const response = await fetch(`/api/struktur?${query}`, { signal });
	const result: unknown = await response.json();
	if (!response.ok) {
		const message = typeof result === "object" && result !== null && "error" in result &&
			typeof result.error === "string" ? result.error : "Daftar organisasi belum dapat dimuat.";
		throw new Error(message);
	}
	if (!Array.isArray(result)) throw new Error("Format daftar organisasi tidak valid.");
	return result as Organization[];
}
