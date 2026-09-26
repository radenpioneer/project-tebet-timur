# 02: Kirim dan ubah suara polling

**What to build:** Peserta dapat memilih calon, jenjang, posisi kepengurusan, serta asal PW/PD, lalu mengirim dan mengubah satu suara melalui browser yang sama sampai polling ditutup. Polling tidak meminta identitas langsung dan menjelaskan batas token per browser. Jika daftar calon belum disediakan, aplikasi menampilkan keadaan kosong tanpa mengarang calon.

**Blocked by:** 01 — Sediakan pilihan asal PW dan asal PD

**Status:** implemented (local; candidate roster and remote D1 provisioning pending)

- [x] Peserta dapat mengirim satu suara dengan satu calon, asal PW, asal PD, jenjang AB1/AB2/AB3, dan posisi kepengurusan yang wajib diisi.
- [x] Browser menerima token edit acak melalui cookie HttpOnly; database hanya menyimpan hash token dan pemilik browser dapat mengubah suaranya sampai polling ditutup.
- [x] Antarmuka menjelaskan bahwa polling nonresmi terbuka bagi pemilik tautan dan tidak menjamin satu suara per orang.
- [x] Aplikasi tidak meminta identitas langsung, nomor identitas, nomor kontak, atau data pribadi lain; log aplikasi tidak mencatat isi suara, token, atau cookie.
- [x] Daftar calon berasal dari data statis yang urutannya ditetapkan panitia; calon yang belum disediakan tidak dikarang dan keadaan kosong ditangani dengan jelas.

## Comments

- Roster belum diberikan. Aplikasi menampilkan keadaan kosong dan menolak pengiriman sampai berkas calon Markdown ditambahkan sesuai urutan panitia.
- Migrasi D1 sudah diterapkan dan diuji pada basis data lokal. `database_id` Wrangler masih placeholder; buat/bind database Cloudflare melalui proses deployment yang disetujui sebelum deploy.
