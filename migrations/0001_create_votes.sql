CREATE TABLE votes (
	token_hash TEXT PRIMARY KEY,
	candidate_id TEXT NOT NULL,
	pw_id TEXT NOT NULL,
	pw_name TEXT NOT NULL,
	pd_id TEXT NOT NULL,
	pd_name TEXT NOT NULL,
	cadre_level TEXT NOT NULL CHECK (cadre_level IN ('AB1', 'AB2', 'AB3')),
	leadership_position TEXT NOT NULL CHECK (
		leadership_position IN (
			'Ketua', 'Sekretaris', 'Bendahara', 'Kaderisasi',
			'Ketua Bidang', 'Ketua Departemen', 'Staf Bidang'
		)
	),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;
