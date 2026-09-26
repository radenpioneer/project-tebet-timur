import { useEffect, useState } from "react";
import { candidates } from "../data/candidates";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

type Organization = { id: string; nama: string; slug: string; jenis: string };
type DirectoryState = "loading" | "ready" | "error";
type Vote = {
	candidateId: string;
	pwId: string;
	pdId: string;
	cadreLevel: string;
	leadershipPosition: string;
};
type PollResult = Vote & { pwName: string; pdName: string; voteCount: number };

const cadreLevels = ["AB1", "AB2", "AB3"];
const leadershipPositions = [
	"Ketua", "Sekretaris", "Bendahara", "Kaderisasi", "Ketua Bidang", "Ketua Departemen", "Staf Bidang", "Non Pengurus",
];

async function loadOrganizations(query: URLSearchParams, signal: AbortSignal) {
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

function App() {
	const [pws, setPws] = useState<Organization[]>([]);
	const [pds, setPds] = useState<Organization[]>([]);
	const [selectedPwId, setSelectedPwId] = useState("");
	const [selectedPdId, setSelectedPdId] = useState("");
	const [candidateId, setCandidateId] = useState("");
	const [cadreLevel, setCadreLevel] = useState("");
	const [leadershipPosition, setLeadershipPosition] = useState("");
	const [pwState, setPwState] = useState<DirectoryState>("loading");
	const [pdState, setPdState] = useState<DirectoryState>("loading");
	const [pwError, setPwError] = useState("");
	const [pdError, setPdError] = useState("");
	const [voteError, setVoteError] = useState("");
	const [notice, setNotice] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [editTokenReady, setEditTokenReady] = useState(false);
	const [pollClosed, setPollClosed] = useState(false);
	const [results, setResults] = useState<PollResult[]>([]);
	const [resultPds, setResultPds] = useState<Organization[]>([]);
	const [resultsLoaded, setResultsLoaded] = useState(false);
	const [resultFilters, setResultFilters] = useState<Record<string, string>>({});
	const [reloadResults, setReloadResults] = useState(0);
	const [reloadPws, setReloadPws] = useState(0);
	const [reloadPds, setReloadPds] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		void loadOrganizations(new URLSearchParams({ jenis: "pw" }), controller.signal)
			.then((items) => { setPws(items); setPwState("ready"); })
			.catch((error: unknown) => {
				if (controller.signal.aborted) return;
				setPws([]);
				setPwError(error instanceof Error ? error.message : "Daftar PW gagal dimuat.");
				setPwState("error");
			});
		return () => controller.abort();
	}, [reloadPws]);

	useEffect(() => {
		if (!selectedPwId) return;
		const controller = new AbortController();
		void loadOrganizations(new URLSearchParams({ jenis: "pd", ancestor: selectedPwId }), controller.signal)
			.then((items) => { setPds(items); setPdState("ready"); })
			.catch((error: unknown) => {
				if (controller.signal.aborted) return;
				setPds([]);
				setPdError(error instanceof Error ? error.message : "Daftar PD gagal dimuat.");
				setPdState("error");
			});
		return () => controller.abort();
	}, [selectedPwId, reloadPds]);

	useEffect(() => {
		const controller = new AbortController();
	void fetch("/api/suara", { signal: controller.signal })
			.then((response) => response.json() as Promise<{ vote: Vote | null; closed: boolean }>)
			.then((result) => {
				setPollClosed(result.closed);
				if (!result?.vote) return;
				setCandidateId(result.vote.candidateId);
				setSelectedPwId(result.vote.pwId);
				setSelectedPdId(result.vote.pdId);
				setCadreLevel(result.vote.cadreLevel);
				setLeadershipPosition(result.vote.leadershipPosition);
				setNotice("Suara Anda dimuat. Anda dapat mengubahnya sampai polling ditutup.");
			})
			.finally(() => { if (!controller.signal.aborted) setEditTokenReady(true); })
			.catch(() => { if (!controller.signal.aborted) setVoteError("Suara tersimpan belum dapat dimuat."); });
		return () => controller.abort();
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		const refresh = () => fetch("/api/hasil", { signal: controller.signal })
			.then((response) => response.json() as Promise<{ closed: boolean; results: PollResult[] }>)
			.then((result) => {
				setResults(result.results);
				setPollClosed(result.closed);
				setResultsLoaded(true);
			})
			.catch(() => { if (!controller.signal.aborted) setResultsLoaded(true); });
		void refresh();
		const interval = window.setInterval(() => { void refresh(); }, 30_000);
		return () => { controller.abort(); window.clearInterval(interval); };
	}, [reloadResults]);

	useEffect(() => {
		const pwId = resultFilters.pwId;
		if (!pwId) { setResultPds([]); return; }
		const controller = new AbortController();
		void loadOrganizations(new URLSearchParams({ jenis: "pd", ancestor: pwId }), controller.signal)
			.then(setResultPds)
			.catch(() => { if (!controller.signal.aborted) setResultPds([]); });
		return () => controller.abort();
	}, [resultFilters.pwId]);

	const selectedPw = pws.find((pw) => pw.id === selectedPwId);
	const selectedPd = pds.find((pd) => pd.id === selectedPdId);
	const filteredResults = results.filter((result) => Object.entries(resultFilters).every(([key, value]) => !value || String(result[key as keyof PollResult]) === value));
	const canSubmit = Boolean(!pollClosed && editTokenReady && candidateId && selectedPw && selectedPd && cadreLevel && leadershipPosition && !submitting);

	function handlePwChange(id: string | null) {
		setSelectedPwId(id ?? "");
		setPds([]);
		setSelectedPdId("");
		setPdError("");
		setPdState("loading");
	}

	async function submitVote(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitting(true);
		setVoteError("");
		setNotice("");
		try {
			const response = await fetch("/api/suara", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ candidateId, pwId: selectedPwId, pdId: selectedPdId, cadreLevel, leadershipPosition }),
			});
			const result: unknown = await response.json();
			if (!response.ok) {
				const message = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
					? result.error : "Suara belum dapat disimpan.";
				throw new Error(message);
			}
			setReloadResults((count) => count + 1);
			setNotice("Suara tersimpan. Anda dapat mengubahnya dari browser ini sampai polling ditutup.");
		} catch (error) {
			setVoteError(error instanceof Error ? error.message : "Suara belum dapat disimpan.");
			if (error instanceof Error && error.message === "Polling telah ditutup.") setPollClosed(true);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="poll-page">
			{pollClosed && <p className="poll-status" role="status">Polling telah ditutup. Suara tidak dapat dikirim atau diubah.</p>}
			<Card className="poll-card w-full max-w-2xl" role="region" aria-labelledby="poll-title">
				<CardHeader>
					<p className="poll-eyebrow">Polling aspirasi nonresmi</p>
					<CardTitle className="poll-title"><h1 id="poll-title">Polling Calon Ketua Umum PP KAMMI</h1></CardTitle>
					<CardDescription>
						Polling ini terbuka bagi siapa pun yang memiliki tautan dan bukan pemilihan resmi. Sistem tidak memverifikasi identitas atau membatasi satu suara per orang; menghapus data browser atau memakai perangkat lain dapat membuat suara tambahan.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!candidates.length ? (
						<div className="poll-status" role="status">
							Daftar calon belum disediakan panitia. Pengiriman suara akan tersedia setelah daftar resmi polling ditambahkan.
						</div>
					) : (
					<form onSubmit={submitVote}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="calon">Calon ketua umum</FieldLabel>
								<Select value={candidateId || null} onValueChange={(value) => setCandidateId(value ?? "")}>
									<SelectTrigger id="calon" className="w-full" aria-required="true"><SelectValue placeholder="Pilih calon" /></SelectTrigger>
									<SelectContent><SelectGroup>{candidates.map((candidate) => <SelectItem key={candidate.id} value={candidate.id}>{candidate.name}</SelectItem>)}</SelectGroup></SelectContent>
								</Select>
							</Field>
							<Field data-disabled={pwState !== "ready"}>
								<FieldLabel htmlFor="asal-pw">Asal Pengurus Wilayah (PW)</FieldLabel>
								<Select value={selectedPwId || null} disabled={pwState !== "ready"} onValueChange={handlePwChange}>
									<SelectTrigger id="asal-pw" className="w-full" aria-required="true"><SelectValue placeholder={pwState === "loading" ? "Memuat daftar PW…" : "Pilih PW"} /></SelectTrigger>
									<SelectContent><SelectGroup>{pws.map((pw) => <SelectItem key={pw.id} value={pw.id}>{pw.nama}</SelectItem>)}</SelectGroup></SelectContent>
								</Select>
								{pwState === "error" && <FieldError>{pwError} <Button type="button" variant="link" size="sm" onClick={() => { setPwState("loading"); setPwError(""); setReloadPws((n) => n + 1); }}>Coba lagi</Button></FieldError>}
							</Field>
							<Field data-disabled={!selectedPwId || pdState !== "ready"}>
								<FieldLabel htmlFor="asal-pd">Asal Pengurus Daerah (PD)</FieldLabel>
								<Select value={selectedPdId || null} disabled={!selectedPwId || pdState !== "ready"} onValueChange={(value) => setSelectedPdId(value ?? "")}>
									<SelectTrigger id="asal-pd" className="w-full" aria-required="true"><SelectValue placeholder={!selectedPwId ? "Pilih PW terlebih dahulu" : pdState === "loading" ? "Memuat daftar PD…" : "Pilih PD"} /></SelectTrigger>
									<SelectContent><SelectGroup>{pds.map((pd) => <SelectItem key={pd.id} value={pd.id}>{pd.nama}</SelectItem>)}</SelectGroup></SelectContent>
								</Select>
								{pdState === "error" && selectedPwId && <FieldError>{pdError} <Button type="button" variant="link" size="sm" onClick={() => { setPdState("loading"); setPdError(""); setReloadPds((n) => n + 1); }}>Coba lagi</Button></FieldError>}
							</Field>
							<Field>
								<FieldLabel htmlFor="jenjang">Jenjang kaderisasi</FieldLabel>
								<Select value={cadreLevel || null} onValueChange={(value) => setCadreLevel(value ?? "")}>
									<SelectTrigger id="jenjang" className="w-full" aria-required="true"><SelectValue placeholder="Pilih jenjang" /></SelectTrigger>
									<SelectContent><SelectGroup>{cadreLevels.map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectGroup></SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel htmlFor="posisi">Posisi kepengurusan</FieldLabel>
								<Select value={leadershipPosition || null} onValueChange={(value) => setLeadershipPosition(value ?? "")}>
									<SelectTrigger id="posisi" className="w-full" aria-required="true"><SelectValue placeholder="Pilih posisi" /></SelectTrigger>
									<SelectContent><SelectGroup>{leadershipPositions.map((position) => <SelectItem key={position} value={position}>{position}</SelectItem>)}</SelectGroup></SelectContent>
								</Select>
							</Field>
							{voteError && <FieldError role="alert">{voteError}</FieldError>}
							{notice && <p className="poll-status" role="status">{notice}</p>}
							<Button type="submit" disabled={!canSubmit}>{pollClosed ? "Polling ditutup" : submitting ? "Menyimpan…" : "Kirim / ubah suara"}</Button>
						</FieldGroup>
					</form>
					)}
				</CardContent>
			</Card>
			<section className="poll-results" aria-labelledby="results-title">
				<h2 id="results-title">Hasil polling</h2>
				{!resultsLoaded ? <p role="status">Memuat hasil…</p> : (
					<>
						<h3>Jumlah suara per calon</h3>
						<ul>{candidates.map((candidate) => <li key={candidate.id}>{candidate.name}: {results.filter((result) => result.candidateId === candidate.id).reduce((sum, result) => sum + result.voteCount, 0)} suara</li>)}</ul>
						<h3>Tabulasi silang</h3>
						<div className="poll-result-filters" aria-label="Filter tabulasi hasil">
							{([
								["candidateId", "Calon", candidates.map((candidate) => [candidate.id, candidate.name] as const)],
								["pwId", "PW", pws.map((pw) => [pw.id, pw.nama] as const)],
								["pdId", "PD", resultPds.map((pd) => [pd.id, pd.nama] as const)],
								["cadreLevel", "Jenjang", cadreLevels.map((value) => [value, value] as const)],
								["leadershipPosition", "Posisi kepengurusan", leadershipPositions.map((value) => [value, value] as const)],
							] as const).map(([key, label, options]) => (
								<Select key={key} value={resultFilters[key] || "__all__"} onValueChange={(value) => setResultFilters((filters) => ({ ...filters, [key]: value === "__all__" ? "" : value ?? "", ...(key === "pwId" ? { pdId: "" } : {}) }))}>
									<SelectTrigger aria-label={`Filter ${label}`} disabled={key === "pdId" && !resultFilters.pwId}><SelectValue placeholder={label} /></SelectTrigger>
									<SelectContent><SelectGroup><SelectItem value="__all__">Semua {label.toLowerCase()}</SelectItem>{options.map(([value, name]) => <SelectItem key={value} value={value}>{name}</SelectItem>)}</SelectGroup></SelectContent>
								</Select>
							))}
						</div>
						{results.length === 0 && <p role="status">Belum ada suara untuk ditampilkan.</p>}
						{results.length > 0 && filteredResults.length === 0 && <p role="status">Tidak ada data suara untuk kombinasi ini.</p>}
						{filteredResults.length > 0 && <>
						<div className="poll-results-table-wrap">
							<table>
								<thead><tr><th>Calon</th><th>PW</th><th>PD</th><th>Jenjang</th><th>Posisi kepengurusan</th><th>Suara</th></tr></thead>
								<tbody>{filteredResults.map((result) => <tr key={`${result.candidateId}-${result.pwId}-${result.pdId}-${result.cadreLevel}-${result.leadershipPosition}`}>
									<td>{candidates.find((candidate) => candidate.id === result.candidateId)?.name ?? result.candidateId}</td><td>{result.pwName}</td><td>{result.pdName}</td><td>{result.cadreLevel}</td><td>{result.leadershipPosition}</td><td>{result.voteCount}</td>
								</tr>)}</tbody>
							</table>
						</div>
						</>}
					</>
				)}
			</section>
		</main>
	);
}

export default App;
