import { useEffect, useState } from "react";
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

type Organization = {
	id: string;
	nama: string;
	slug: string;
	jenis: string;
};

type DirectoryState = "loading" | "ready" | "error";

async function loadOrganizations(query: URLSearchParams, signal: AbortSignal) {
	const response = await fetch(`/api/struktur?${query}`, { signal });
	const result: unknown = await response.json();
	if (!response.ok) {
		const message =
			typeof result === "object" && result !== null && "error" in result &&
			typeof result.error === "string"
				? result.error
				: "Daftar organisasi belum dapat dimuat.";
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
	const [pwState, setPwState] = useState<DirectoryState>("loading");
	const [pdState, setPdState] = useState<DirectoryState>("loading");
	const [pwError, setPwError] = useState("");
	const [pdError, setPdError] = useState("");
	const [reloadPws, setReloadPws] = useState(0);
	const [reloadPds, setReloadPds] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		void loadOrganizations(new URLSearchParams({ jenis: "pw" }), controller.signal)
			.then((items) => {
				setPws(items);
				setPwState("ready");
			})
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
		void loadOrganizations(
			new URLSearchParams({ jenis: "pd", ancestor: selectedPwId }),
			controller.signal,
		)
			.then((items) => {
				setPds(items);
				setPdState("ready");
			})
			.catch((error: unknown) => {
				if (controller.signal.aborted) return;
				setPds([]);
				setPdError(error instanceof Error ? error.message : "Daftar PD gagal dimuat.");
				setPdState("error");
			});
		return () => controller.abort();
	}, [selectedPwId, reloadPds]);

	const selectedPw = pws.find((pw) => pw.id === selectedPwId);
	const selectedPd = pds.find((pd) => pd.id === selectedPdId);
	const canContinue = Boolean(selectedPw && selectedPd && pwState === "ready" && pdState === "ready");
	const handlePwChange = (id: string | null) => {
		setSelectedPwId(id ?? "");
		setPds([]);
		setSelectedPdId("");
		setPdError("");
		setPdState("loading");
	};

	return (
		<main className="poll-page">
			<Card className="poll-card w-full max-w-2xl" role="region" aria-labelledby="poll-title">
				<CardHeader>
					<p className="poll-eyebrow">Polling aspirasi</p>
					<CardTitle id="poll-title" className="poll-title">
						Asal PW dan PD
					</CardTitle>
					<CardDescription>
						Pilih wilayah dan daerah tempat Anda berasal. Pilihan ini akan disimpan bersama suara Anda.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<FieldGroup>
						<Field data-disabled={pwState !== "ready"}>
							<FieldLabel htmlFor="asal-pw">Asal Pengurus Wilayah (PW)</FieldLabel>
							<Select
								value={selectedPwId || null}
								disabled={pwState !== "ready"}
								onValueChange={handlePwChange}
							>
								<SelectTrigger id="asal-pw" className="w-full" aria-required="true">
									<SelectValue placeholder={pwState === "loading" ? "Memuat daftar PW…" : "Pilih PW"} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{pws.map((pw) => (
											<SelectItem key={pw.id} value={pw.id}>
												{pw.nama}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
							{pwState === "error" && (
								<FieldError>
									{pwError}{" "}
									<Button
										variant="link"
										size="sm"
										onClick={() => {
											setPwState("loading");
											setPwError("");
											setReloadPws((n) => n + 1);
										}}
									>
										Coba lagi
									</Button>
								</FieldError>
							)}
						</Field>

						<Field data-disabled={!selectedPwId || pdState !== "ready"}>
							<FieldLabel htmlFor="asal-pd">Asal Pengurus Daerah (PD)</FieldLabel>
							<Select
								value={selectedPdId || null}
								disabled={!selectedPwId || pdState !== "ready"}
								onValueChange={(id) => setSelectedPdId(id ?? "")}
							>
								<SelectTrigger id="asal-pd" className="w-full" aria-required="true">
									<SelectValue
									placeholder={
										!selectedPwId
											? "Pilih PW terlebih dahulu"
											: pdState === "loading"
												? "Memuat daftar PD…"
												: "Pilih PD"
									}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{pds.map((pd) => (
											<SelectItem key={pd.id} value={pd.id}>
												{pd.nama}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
							{pdState === "error" && selectedPwId && (
								<FieldError>
									{pdError}{" "}
									<Button
										variant="link"
										size="sm"
										onClick={() => {
											setPdState("loading");
											setPdError("");
											setReloadPds((n) => n + 1);
										}}
									>
										Coba lagi
									</Button>
								</FieldError>
							)}
						</Field>
					</FieldGroup>

					<p className="poll-status" aria-live="polite">
						{canContinue && selectedPw && selectedPd
							? `Pilihan tersimpan: ${selectedPw.nama} / ${selectedPd.nama}`
							: "Pilih PW dan PD untuk melanjutkan."}
					</p>
				</CardContent>
			</Card>
		</main>
	);
}

export default App;
