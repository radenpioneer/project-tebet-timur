CREATE TABLE votes_new (
	token_hash TEXT UNIQUE,
	candidate_id TEXT NOT NULL,
	pw_id TEXT NOT NULL,
	pw_name TEXT NOT NULL,
	pd_id TEXT NOT NULL,
	pd_name TEXT NOT NULL,
	cadre_level TEXT NOT NULL CHECK (cadre_level IN ('AB1', 'AB2', 'AB3')),
	leadership_position TEXT NOT NULL CHECK (
		leadership_position IN (
			'Ketua', 'Sekretaris', 'Bendahara', 'Kaderisasi',
			'Ketua Bidang', 'Ketua Departemen', 'Staf Bidang', 'Non Pengurus'
		)
	),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

INSERT INTO votes_new (
	token_hash, candidate_id, pw_id, pw_name, pd_id, pd_name,
	cadre_level, leadership_position, created_at, updated_at
)
SELECT token_hash, candidate_id, pw_id, pw_name, pd_id, pd_name,
	cadre_level, leadership_position, created_at, updated_at
FROM votes;

DROP TABLE votes;
ALTER TABLE votes_new RENAME TO votes;

CREATE TABLE poll_results (
	candidate_id TEXT NOT NULL,
	pw_id TEXT NOT NULL,
	pw_name TEXT NOT NULL,
	pd_id TEXT NOT NULL,
	pd_name TEXT NOT NULL,
	cadre_level TEXT NOT NULL,
	leadership_position TEXT NOT NULL,
	vote_count INTEGER NOT NULL,
	PRIMARY KEY (candidate_id, pw_id, pd_id, cadre_level, leadership_position)
) STRICT;

CREATE TABLE poll_state (
	id INTEGER PRIMARY KEY CHECK (id = 1),
	closed_at TEXT NOT NULL
) STRICT;
