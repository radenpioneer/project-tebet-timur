import { useState } from "react";
import { UserRound } from "lucide-react";
import type { Candidate } from "../../data/candidates";

export function CandidateImage({ candidate, className = "" }: { candidate: Candidate; className?: string }) {
	const [failed, setFailed] = useState(false);
	return (
		<div className={`candidate-image ${className}`}>
			{candidate.photo && !failed ? (
				<img src={candidate.photo} alt={`Foto ${candidate.name}`} onError={() => setFailed(true)} />
			) : (
				<div className="candidate-image-placeholder" role="img" aria-label={`Foto ${candidate.name} belum tersedia`}>
					<UserRound aria-hidden="true" />
					<span>Foto belum tersedia</span>
				</div>
			)}
		</div>
	);
}
