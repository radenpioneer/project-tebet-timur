import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { candidates } from "../../data/candidates";
import { cadreLevels, leadershipPositions, type PollResult, type Vote } from "../polling";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "~/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

type Filters = { candidateId: string; pwId: string; pdId: string; cadreLevel: string; leadershipPosition: string };
const emptyFilters: Filters = { candidateId: "", pwId: "", pdId: "", cadreLevel: "", leadershipPosition: "" };
const chartConfig = { votes: { label: "Suara", color: "var(--primary)" } } satisfies ChartConfig;

function uniqueOrganizations(results: PollResult[], type: "pw" | "pd", pwId = "") {
	const map = new Map<string, string>();
	for (const result of results) {
		if (type === "pw") map.set(result.pwId, result.pwName);
		if (type === "pd" && (!pwId || result.pwId === pwId)) map.set(result.pdId, result.pdName);
	}
	return [...map].sort((a, b) => a[1].localeCompare(b[1], "id"));
}

export function ResultsPage({ vote, sessionReady, pollClosed, onClosedChange, onChoose, onEdit }: {
	vote: Vote | null;
	sessionReady: boolean;
	pollClosed: boolean;
	onClosedChange: (closed: boolean) => void;
	onChoose: () => void;
	onEdit: () => void;
}) {
	const [results, setResults] = useState<PollResult[]>([]);
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState("");
	const [filters, setFilters] = useState<Filters>(emptyFilters);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		const refresh = async () => {
			try {
				const response = await fetch("/api/hasil", { signal: controller.signal });
				if (!response.ok) throw new Error("Hasil belum dapat dimuat.");
				const data = await response.json() as { closed: boolean; results: PollResult[] };
				setResults(data.results);
				onClosedChange(data.closed);
				setError("");
				setLoaded(true);
			} catch {
				if (!controller.signal.aborted) setError("Hasil belum dapat dimuat. Coba lagi.");
			}
		};
		void refresh();
		const interval = window.setInterval(() => { void refresh(); }, 30_000);
		return () => { controller.abort(); window.clearInterval(interval); };
	}, [onClosedChange, refreshKey]);

	const demographicResults = useMemo(() => results.filter((result) =>
		(!filters.pwId || result.pwId === filters.pwId) &&
		(!filters.pdId || result.pdId === filters.pdId) &&
		(!filters.cadreLevel || result.cadreLevel === filters.cadreLevel) &&
		(!filters.leadershipPosition || result.leadershipPosition === filters.leadershipPosition)
	), [results, filters]);
	const denominator = demographicResults.reduce((sum, result) => sum + result.voteCount, 0);
	const filteredResults = demographicResults.filter((result) => !filters.candidateId || result.candidateId === filters.candidateId);
	const chartRows = candidates
		.filter((candidate) => !filters.candidateId || candidate.id === filters.candidateId)
		.map((candidate) => {
			const votes = demographicResults.filter((result) => result.candidateId === candidate.id).reduce((sum, result) => sum + result.voteCount, 0);
			return { id: candidate.id, name: candidate.name, votes, percentage: denominator ? Math.round(votes / denominator * 100) : 0 };
		});
	const pwOptions = uniqueOrganizations(results, "pw");
	const pdOptions = uniqueOrganizations(results, "pd", filters.pwId);
	const filterControls = [
		{ key: "candidateId", label: "Calon", options: candidates.map((candidate) => [candidate.id, candidate.name]) },
		{ key: "pwId", label: "PW", options: pwOptions },
		{ key: "pdId", label: "PD", options: pdOptions },
		{ key: "cadreLevel", label: "Jenjang", options: cadreLevels.map((value) => [value, value]) },
		{ key: "leadershipPosition", label: "Posisi", options: leadershipPositions.map((value) => [value, value]) },
	] satisfies { key: keyof Filters; label: string; options: string[][] }[];

	return (
		<main className="poll-page results-page">
			<header className="page-header">
				<div><h1>Hasil polling</h1><p>Jumlah dan sebaran suara untuk setiap calon Ketua Umum PP KAMMI.</p></div>
				{sessionReady && !pollClosed && (vote ? <Button variant="outline" onClick={onEdit}><RotateCcw data-icon="inline-start" /> Ubah pilihan</Button> : <Button variant="outline" onClick={onChoose}><ArrowLeft data-icon="inline-start" /> Kembali ke pilih</Button>)}
			</header>
			<p className="context-note">Hasil aspirasi nonresmi ini terbuka untuk publik. Polling tidak memverifikasi identitas maupun kelayakan peserta.</p>
			{pollClosed && <p className="closed-note" role="status">Polling telah ditutup. Suara tidak dapat dikirim atau diubah.</p>}
			{error && <p className="form-error" role="alert">{error} <Button variant="link" size="sm" onClick={() => setRefreshKey((n) => n + 1)}>Coba lagi</Button></p>}
			{!loaded ? (!error && <p role="status">Memuat hasil…</p>) : (
				<>
					<section aria-labelledby="filter-title" className="results-filters">
						<div className="section-heading"><h2 id="filter-title">Saring hasil</h2><Button variant="ghost" size="sm" onClick={() => setFilters(emptyFilters)}>Reset filter</Button></div>
						<div className="filter-grid">
							{filterControls.map(({ key, label, options }) => (
								<div className="filter-field" key={key}>
									<label htmlFor={`filter-${key}`}>{label}</label>
									<Select items={[{ value: "__all__", label: `Semua ${label.toLowerCase()}` }, ...options.map(([value, name]) => ({ value, label: name }))]} value={filters[key] || "__all__"} onValueChange={(value) => setFilters((current) => ({ ...current, [key]: value === "__all__" ? "" : value ?? "", ...(key === "pwId" ? { pdId: "" } : {}) }))}>
										<SelectTrigger id={`filter-${key}`} disabled={key === "pdId" && !filters.pwId} className="w-full"><SelectValue placeholder={`Semua ${label}`} /></SelectTrigger>
										<SelectContent><SelectGroup><SelectItem value="__all__">Semua {label.toLowerCase()}</SelectItem>{options.map(([value, name]) => <SelectItem key={value} value={value}>{name}</SelectItem>)}</SelectGroup></SelectContent>
									</Select>
								</div>
							))}
						</div>
					</section>
					<Card className="results-chart-card">
						<CardHeader><CardTitle><h2>Suara per calon</h2></CardTitle><CardDescription>{denominator} suara cocok dengan filter wilayah, jenjang, dan posisi. Persentase memakai jumlah ini sebagai pembagi.</CardDescription></CardHeader>
						<CardContent>
							{denominator === 0 ? <p className="empty-state" role="status">Belum ada suara untuk kombinasi filter ini.</p> : <>
								<ChartContainer config={chartConfig} className="results-chart" style={{ height: Math.max(210, chartRows.length * 78) }}>
									<BarChart accessibilityLayer layout="vertical" data={chartRows} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
										<CartesianGrid horizontal={false} />
										<XAxis type="number" allowDecimals={false} />
										<YAxis type="category" dataKey="name" width={135} tickLine={false} axisLine={false} tickFormatter={(name: string) => name.length > 17 ? `${name.slice(0, 16)}…` : name} />
										<ChartTooltip content={<ChartTooltipContent />} />
										<Bar dataKey="votes" fill="var(--color-votes)" radius={[0, 8, 8, 0]} maxBarSize={32} />
									</BarChart>
								</ChartContainer>
								<ul className="chart-values">{chartRows.map((row) => <li key={row.id}><span>{row.name}</span><strong>{row.votes} suara · {row.percentage}%</strong></li>)}</ul>
							</>}
						</CardContent>
					</Card>
					<section className="results-detail" aria-labelledby="detail-title">
						<div className="section-heading"><h2 id="detail-title">Tabulasi rinci</h2><p>{filteredResults.length} kombinasi ditampilkan</p></div>
						{filteredResults.length === 0 ? <p className="empty-state" role="status">{denominator === 0 ? "Belum ada suara untuk kombinasi filter ini." : "Tidak ada suara untuk calon pada kombinasi filter ini."}</p> : (
							<div className="results-table-wrap"><Table>
								<TableHeader><TableRow><TableHead>Calon</TableHead><TableHead>PW</TableHead><TableHead>PD</TableHead><TableHead>Jenjang</TableHead><TableHead>Posisi kepengurusan</TableHead><TableHead className="text-right">Suara</TableHead></TableRow></TableHeader>
								<TableBody>{filteredResults.map((result) => <TableRow key={`${result.candidateId}-${result.pwId}-${result.pdId}-${result.cadreLevel}-${result.leadershipPosition}`}><TableCell>{candidates.find((candidate) => candidate.id === result.candidateId)?.name ?? result.candidateId}</TableCell><TableCell>{result.pwName}</TableCell><TableCell>{result.pdName}</TableCell><TableCell>{result.cadreLevel}</TableCell><TableCell>{result.leadershipPosition}</TableCell><TableCell className="text-right">{result.voteCount}</TableCell></TableRow>)}</TableBody>
							</Table></div>
						)}
					</section>
				</>
			)}
		</main>
	);
}
