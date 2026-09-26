# 03: Tampilkan hasil polling kepada publik

**What to build:** Publik dapat melihat jumlah suara per calon dan tabulasi silang menurut calon, PW, PD, jenjang, serta posisi kepengurusan, termasuk hitungan satu suara dan pesan untuk kombinasi tanpa suara.

**Blocked by:** 02 — Kirim dan ubah suara polling

**Status:** done

- [x] Hasil jumlah suara per calon dan tabulasi silang tersedia selama polling dan setelah polling ditutup.
- [x] Tabulasi mencakup seluruh kombinasi calon, PW, PD, jenjang, dan posisi kepengurusan.
- [x] Kombinasi dengan satu suara tetap menampilkan hitungannya; kombinasi tanpa suara menampilkan pesan data kosong.
- [x] Hasil publik tidak mengungkap token edit.

## Comments

- Implemented `GET /api/hasil`, live candidate totals and cross-tab filters, zero-result feedback, and persistent final aggregates. Public results include counts only and never edit tokens.
