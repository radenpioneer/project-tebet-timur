import { useEffect, useState, type FormEvent } from "react";
import Markdown from "react-markdown";
import { ArrowRight, Check } from "lucide-react";
import { candidates, profileSections, type Candidate } from "../../data/candidates";
import { cadreLevels, leadershipPositions, loadOrganizations, type Organization, type Vote } from "../polling";
import { CandidateImage } from "./CandidateImage";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "~/components/ui/combobox";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet";

type Stage = "profile" | "form" | null;

function useWideScreen() {
	const [wide, setWide] = useState(() => window.matchMedia("(min-width: 768px)").matches);
	useEffect(() => {
		const query = window.matchMedia("(min-width: 768px)");
		const update = () => setWide(query.matches);
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	return wide;
}

export function CandidateFlow({ priorVote, onSaved, onResults, onClosed }: {
	priorVote: Vote | null;
	onSaved: (vote: Vote) => void;
	onResults: () => void;
	onClosed: () => void;
}) {
	const wide = useWideScreen();
	const [stage, setStage] = useState<Stage>(null);
	const [candidateId, setCandidateId] = useState(priorVote?.candidateId ?? "");
	const [selectedPwId, setSelectedPwId] = useState(priorVote?.pwId ?? "");
	const [selectedPdId, setSelectedPdId] = useState(priorVote?.pdId ?? "");
	const [cadreLevel, setCadreLevel] = useState(priorVote?.cadreLevel ?? "");
	const [leadershipPosition, setLeadershipPosition] = useState(priorVote?.leadershipPosition ?? "");
	const [pws, setPws] = useState<Organization[]>([]);
	const [pds, setPds] = useState<Organization[]>([]);
	const [pwState, setPwState] = useState<"loading" | "ready" | "error">("loading");
	const [pdState, setPdState] = useState<"loading" | "ready" | "error">("loading");
	const [pwError, setPwError] = useState("");
	const [pdError, setPdError] = useState("");
	const [voteError, setVoteError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [reloadPws, setReloadPws] = useState(0);
	const [reloadPds, setReloadPds] = useState(0);
	const selectedCandidate = candidates.find((candidate) => candidate.id === candidateId);
	const selectedPw = pws.find((pw) => pw.id === selectedPwId);
	const selectedPd = pds.find((pd) => pd.id === selectedPdId);

	useEffect(() => {
		const controller = new AbortController();
		void loadOrganizations(new URLSearchParams({ jenis: "pw" }), controller.signal)
			.then((items) => { setPws(items); setPwState("ready"); })
			.catch((error: unknown) => {
				if (controller.signal.aborted) return;
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
				setPdError(error instanceof Error ? error.message : "Daftar PD gagal dimuat.");
				setPdState("error");
			});
		return () => controller.abort();
	}, [selectedPwId, reloadPds]);

	function chooseCandidate(candidate: Candidate) {
		setCandidateId(candidate.id);
		setVoteError("");
		setStage("profile");
	}

	function changePw(id: string) {
		setSelectedPwId(id);
		setSelectedPdId("");
		setPds([]);
		setPdState("loading");
		setPdError("");
	}

	async function submitVote(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!selectedCandidate || !selectedPw || !selectedPd || !cadreLevel || !leadershipPosition) {
			setVoteError("Lengkapi asal PW, asal PD, jenjang kaderisasi, dan posisi kepengurusan.");
			return;
		}
		const vote: Vote = { candidateId: selectedCandidate.id, pwId: selectedPw.id, pdId: selectedPd.id, cadreLevel, leadershipPosition };
		setVoteError("");
		setSubmitting(true);
		try {
			const response = await fetch("/api/suara", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(vote),
			});
			const result: unknown = await response.json();
			if (!response.ok) {
				if (response.status === 410) { onClosed(); return; }
				const message = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
					? result.error : "Suara belum dapat disimpan.";
				throw new Error(message);
			}
			setStage(null);
			onSaved(vote);
		} catch (error) {
			setVoteError(error instanceof Error ? error.message : "Suara belum dapat disimpan. Coba lagi.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="poll-page candidate-page">
			<header className="page-header">
				<div>
					<h1>Siapa calon pilihan Anda?</h1>
					<p>Kenali setiap calon ketua umum PP KAMMI, lalu sampaikan aspirasi Anda.</p>
				</div>
				<Button variant="outline" onClick={onResults}>Lihat hasil <ArrowRight data-icon="inline-end" /></Button>
			</header>
			<p className="context-note">Polling aspirasi nonresmi. Terbuka bagi siapa pun yang memiliki tautan; identitas dan kelayakan tidak diverifikasi.</p>
			{!candidates.length ? (
				<p className="empty-state" role="status">Daftar calon belum tersedia. Silakan kembali nanti.</p>
			) : (
				<section className="candidate-grid" aria-label="Daftar calon ketua umum" tabIndex={0}>
					{candidates.map((candidate) => (
						<button className="candidate-card-button" key={candidate.id} type="button" onClick={() => chooseCandidate(candidate)} aria-label={`${priorVote?.candidateId === candidate.id ? "Pilihan Anda saat ini. " : ""}Lihat profil ${candidate.name}`}>
							<Card className="candidate-card">
								<CandidateImage candidate={candidate} />
								<CardHeader>
									{priorVote?.candidateId === candidate.id && <Badge variant="secondary"><Check aria-hidden="true" /> Pilihan Anda saat ini</Badge>}
									<CardTitle>{candidate.name}</CardTitle>
									<CardDescription>Calon Ketua Umum PP KAMMI</CardDescription>
								</CardHeader>
								<CardContent><p>PW {candidate.originPw} · PD {candidate.originPd}</p></CardContent>
								<CardFooter><span>Lihat profil <ArrowRight aria-hidden="true" /></span></CardFooter>
							</Card>
						</button>
					))}
				</section>
			)}
			<p className="privacy-note">Satu browser dapat mengubah suaranya sampai polling ditutup. Menghapus data browser atau menggunakan perangkat lain dapat membuat suara tambahan.</p>

			<Sheet open={stage === "profile"} onOpenChange={(open) => { if (!open) setStage(null); }}>
				<SheetContent side={wide ? "right" : "bottom"} showCloseButton={false} className="profile-sheet">
					<SheetHeader className="sheet-heading">
						<SheetTitle>Kenali calon</SheetTitle>
						<SheetDescription>Profil calon Ketua Umum PP KAMMI</SheetDescription>
					</SheetHeader>
					{selectedCandidate && (
						<div className="sheet-scroll profile-layout">
							<div className="profile-identity">
								<CandidateImage key={selectedCandidate.id} candidate={selectedCandidate} />
								<Card>
									<CardHeader><CardTitle>{selectedCandidate.name}</CardTitle><CardDescription>Calon Ketua Umum PP KAMMI</CardDescription></CardHeader>
									<CardContent><p>PW {selectedCandidate.originPw}</p><p>PD {selectedCandidate.originPd}</p></CardContent>
								</Card>
							</div>
							<div className="profile-sections">
								{profileSections.map((section) => (
									<section key={section} aria-labelledby={`section-${section.replace(/ /g, "-")}`}>
										<h3 id={`section-${section.replace(/ /g, "-")}`}>{section}</h3>
										{selectedCandidate.profile[section] ? <div className="markdown-content"><Markdown>{selectedCandidate.profile[section]}</Markdown></div> : <p className="profile-placeholder">{section} belum disediakan.</p>}
									</section>
								))}
							</div>
						</div>
					)}
					<SheetFooter className="sheet-actions">
						<Button variant="outline" onClick={() => setStage(null)}>Batal</Button>
						<Button onClick={() => setStage("form")}>Pilih <ArrowRight data-icon="inline-end" /></Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>

			<Sheet open={stage === "form"} onOpenChange={(open) => { if (!open) setStage(null); }}>
				<SheetContent side={wide ? "right" : "bottom"} showCloseButton={false} className="form-sheet">
					<SheetHeader className="sheet-heading">
						<SheetTitle>Lengkapi suara Anda</SheetTitle>
						<SheetDescription>Periksa calon pilihan, lalu isi asal organisasi dan peran Anda.</SheetDescription>
					</SheetHeader>
					<form className="sheet-form" onSubmit={submitVote}>
						<div className="sheet-scroll form-scroll">
							{selectedCandidate && <Card className="selected-candidate-card">
								<CandidateImage key={selectedCandidate.id} candidate={selectedCandidate} />
								<div><CardHeader><CardTitle>{selectedCandidate.name}</CardTitle><CardDescription>Calon pilihan Anda</CardDescription></CardHeader><CardContent>PW {selectedCandidate.originPw} · PD {selectedCandidate.originPd}</CardContent></div>
							</Card>}
							<FieldGroup>
								<Field data-disabled={pwState !== "ready"}>
									<FieldLabel htmlFor="asal-pw">Asal PW</FieldLabel>
									<Combobox items={pws} itemToStringLabel={(pw: Organization) => pw.nama} itemToStringValue={(pw: Organization) => pw.id} value={selectedPw ?? null} onValueChange={(pw: Organization | null) => changePw(pw?.id ?? "")} disabled={pwState !== "ready"}>
										<ComboboxInput id="asal-pw" name="pwId" aria-required="true" placeholder={pwState === "loading" ? "Memuat PW…" : "Cari dan pilih PW"} className="w-full" />
										<ComboboxContent><ComboboxEmpty>PW tidak ditemukan.</ComboboxEmpty><ComboboxList>{(pw: Organization) => <ComboboxItem key={pw.id} value={pw}>{pw.nama}</ComboboxItem>}</ComboboxList></ComboboxContent>
									</Combobox>
									{pwState === "error" && <FieldError>{pwError} <Button type="button" variant="link" size="sm" onClick={() => { setPwState("loading"); setReloadPws((n) => n + 1); }}>Coba lagi</Button></FieldError>}
								</Field>
								<Field data-disabled={!selectedPwId || pdState !== "ready"}>
									<FieldLabel htmlFor="asal-pd">Asal PD</FieldLabel>
									<Combobox items={pds} itemToStringLabel={(pd: Organization) => pd.nama} itemToStringValue={(pd: Organization) => pd.id} value={selectedPd ?? null} onValueChange={(pd: Organization | null) => setSelectedPdId(pd?.id ?? "")} disabled={!selectedPwId || pdState !== "ready"}>
										<ComboboxInput id="asal-pd" name="pdId" aria-required="true" placeholder={!selectedPwId ? "Pilih PW terlebih dahulu" : pdState === "loading" ? "Memuat PD…" : "Cari dan pilih PD"} className="w-full" />
										<ComboboxContent><ComboboxEmpty>PD tidak ditemukan.</ComboboxEmpty><ComboboxList>{(pd: Organization) => <ComboboxItem key={pd.id} value={pd}>{pd.nama}</ComboboxItem>}</ComboboxList></ComboboxContent>
									</Combobox>
									{pdState === "error" && <FieldError>{pdError} <Button type="button" variant="link" size="sm" onClick={() => { setPdState("loading"); setReloadPds((n) => n + 1); }}>Coba lagi</Button></FieldError>}
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
							</FieldGroup>
						</div>
						<SheetFooter className="sheet-actions form-actions">
							{voteError && <p className="form-error" role="alert">{voteError}</p>}
							<div className="form-action-buttons">
								<Button type="button" variant="outline" onClick={() => setStage(null)}>Batal</Button>
								<Button type="submit" disabled={submitting}>{submitting ? "Mengirim…" : priorVote ? "Simpan perubahan" : "Kirim suara"} {!submitting && <ArrowRight data-icon="inline-end" />}</Button>
							</div>
						</SheetFooter>
					</form>
				</SheetContent>
			</Sheet>
		</main>
	);
}
