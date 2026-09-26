import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { CandidateFlow } from "./components/CandidateFlow";
import type { Vote } from "./polling";

const ResultsPage = lazy(() => import("./components/ResultsPage").then((module) => ({ default: module.ResultsPage })));

type Route = { path: "/" | "/hasil"; edit: boolean };

function currentRoute(): Route {
	return {
		path: window.location.pathname === "/hasil" ? "/hasil" : "/",
		edit: Boolean(window.history.state?.edit),
	};
}

function App() {
	const [route, setRoute] = useState<Route>(currentRoute);
	const [vote, setVote] = useState<Vote | null>(null);
	const [pollClosed, setPollClosed] = useState(false);
	const [sessionState, setSessionState] = useState<"loading" | "ready" | "error">("loading");
	const [sessionReload, setSessionReload] = useState(0);

	const navigate = useCallback((path: Route["path"], edit = false, replace = false) => {
		const method = replace ? "replaceState" : "pushState";
		window.history[method]({ edit }, "", path);
		setRoute({ path, edit });
		window.scrollTo({ top: 0 });
	}, []);

	useEffect(() => {
		const onPopState = () => {
			const next = currentRoute();
			if (next.path === "/" && (pollClosed || (vote && !next.edit))) navigate("/hasil", false, true);
			else setRoute(next);
		};
		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, [pollClosed, vote, navigate]);

	useEffect(() => {
		const controller = new AbortController();
		void fetch("/api/suara", { signal: controller.signal })
			.then(async (response) => {
				if (!response.ok) throw new Error("Status suara belum dapat dimuat.");
				return response.json() as Promise<{ vote: Vote | null; closed: boolean }>;
			})
			.then((result) => {
				if (controller.signal.aborted) return;
				setVote(result.vote);
				setPollClosed(result.closed);
				setSessionState("ready");
				const current = currentRoute();
				if (current.path === "/" && (result.closed || (result.vote && !current.edit))) navigate("/hasil", false, true);
			})
			.catch(() => { if (!controller.signal.aborted) setSessionState("error"); });
		return () => controller.abort();
	}, [sessionReload, navigate]);

	if (route.path === "/hasil") {
		return <Suspense fallback={<main className="poll-page route-state" role="status">Memuat hasil…</main>}><ResultsPage
			vote={sessionState === "ready" ? vote : null}
			sessionReady={sessionState === "ready"}
			pollClosed={pollClosed}
			onClosedChange={setPollClosed}
			onChoose={() => navigate("/")}
			onEdit={() => navigate("/", true)}
		/></Suspense>;
	}

	if (sessionState === "loading" || (sessionState === "ready" && (pollClosed || (vote && !route.edit)))) {
		return <main className="poll-page route-state" role="status"><Skeleton className="h-14 w-2/3" /><Skeleton className="h-64 w-full" /><span className="sr-only">Memuat halaman polling…</span></main>;
	}
	if (sessionState === "error") {
		return <main className="poll-page route-state"><h1>Status suara belum dapat dimuat</h1><p>Coba lagi agar suara yang mungkin tersimpan tidak tertimpa.</p><Button onClick={() => { setSessionState("loading"); setSessionReload((count) => count + 1); }}>Coba lagi</Button></main>;
	}
	return <CandidateFlow
		priorVote={vote}
		onSaved={(savedVote) => { setVote(savedVote); navigate("/hasil"); }}
		onResults={() => navigate("/hasil")}
		onClosed={() => { setPollClosed(true); navigate("/hasil"); }}
	/>;
}

export default App;
