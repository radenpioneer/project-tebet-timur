import { useEffect, useState } from "react";

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
	const handlePwChange = (id: string) => {
		setSelectedPwId(id);
		setPds([]);
		setSelectedPdId("");
		setPdError("");
		setPdState("loading");
	};

	return (
		<main className="poll-page">
			<section className="poll-card" aria-labelledby="poll-title">
				<p className="poll-eyebrow">Polling aspirasi</p>
				<h1 id="poll-title">Asal PW dan PD</h1>
				<p className="poll-intro">
					Pilih wilayah dan daerah tempat Anda berasal. Pilihan ini akan disimpan bersama suara Anda.
				</p>

				<div className="poll-fields">
					<div className="poll-field">
						<label htmlFor="asal-pw">Asal Pengurus Wilayah (PW)</label>
						<select
							id="asal-pw"
							value={selectedPwId}
							disabled={pwState !== "ready"}
							required
							onChange={(event) => handlePwChange(event.target.value)}
						>
							<option value="">
								{pwState === "loading" ? "Memuat daftar PW…" : "Pilih PW"}
							</option>
							{pws.map((pw) => (
								<option key={pw.id} value={pw.id}>
									{pw.nama}
								</option>
							))}
						</select>
						{pwState === "error" && (
							<p className="field-message" role="alert">
								{pwError}{" "}
								<button
									className="text-button"
									type="button"
									onClick={() => {
										setPwState("loading");
										setPwError("");
										setReloadPws((n) => n + 1);
									}}
								>
									Coba lagi
								</button>
							</p>
						)}
					</div>

					<div className="poll-field">
						<label htmlFor="asal-pd">Asal Pengurus Daerah (PD)</label>
						<select
							id="asal-pd"
							value={selectedPdId}
							disabled={!selectedPwId || pdState !== "ready"}
							required
							onChange={(event) => setSelectedPdId(event.target.value)}
						>
							<option value="">
								{!selectedPwId
									? "Pilih PW terlebih dahulu"
									: pdState === "loading"
										? "Memuat daftar PD…"
										: "Pilih PD"}
							</option>
							{pds.map((pd) => (
								<option key={pd.id} value={pd.id}>
									{pd.nama}
								</option>
							))}
						</select>
						{pdState === "error" && selectedPwId && (
							<p className="field-message" role="alert">
								{pdError}{" "}
								<button
									className="text-button"
									type="button"
									onClick={() => {
										setPdState("loading");
										setPdError("");
										setReloadPds((n) => n + 1);
									}}
								>
									Coba lagi
								</button>
							</p>
						)}
					</div>
				</div>

				<p className="poll-status" aria-live="polite">
					{canContinue && selectedPw && selectedPd
						? `Pilihan tersimpan: ${selectedPw.nama} / ${selectedPd.nama}`
						: "Pilih PW dan PD untuk melanjutkan."}
				</p>
			</section>
		</main>
	);
}

export default App;
