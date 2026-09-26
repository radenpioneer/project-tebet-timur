# 02: Kirim dan ubah suara polling

**What to build:** Peserta dapat memilih calon, jenjang, posisi kepengurusan, serta asal PW/PD, lalu mengirim dan mengubah satu suara melalui browser yang sama sampai polling ditutup. Polling tidak meminta identitas langsung dan menjelaskan batas token per browser. Jika daftar calon belum disediakan, aplikasi menampilkan keadaan kosong tanpa mengarang calon.

**Blocked by:** 01 — Sediakan pilihan asal PW dan asal PD

**Status:** ready-for-agent

- [ ] Peserta dapat mengirim satu suara dengan satu calon, asal PW, asal PD, jenjang AB1/AB2/AB3, dan posisi kepengurusan yang wajib diisi.
- [ ] Browser menerima token edit acak melalui cookie HttpOnly; database hanya menyimpan hash token dan pemilik browser dapat mengubah suaranya sampai polling ditutup.
- [ ] Antarmuka menjelaskan bahwa polling nonresmi terbuka bagi pemilik tautan dan tidak menjamin satu suara per orang.
- [ ] Aplikasi tidak meminta identitas langsung, nomor identitas, nomor kontak, atau data pribadi lain; log aplikasi tidak mencatat isi suara, token, atau cookie.
- [ ] Daftar calon berasal dari data statis yang urutannya ditetapkan panitia; calon yang belum disediakan tidak dikarang dan keadaan kosong ditangani dengan jelas.
