# Polling Calon Ketua Umum PP KAMMI

Status: agreed; implementation deferred

## Tujuan

Menyediakan polling aspirasi nonresmi tentang calon ketua umum PP KAMMI. Siapa pun yang memiliki tautan boleh berpartisipasi. Pihak berwenang mengendalikan persebaran tautan.

## Perilaku peserta

- Polling terbuka saat aplikasi tersedia online dan berakhir pada 29 Oktober 2026 pukul 23.59 WIB.
- Setiap respons memilih satu calon dan wajib mengisi asal PW, asal PD, jenjang, serta posisi kepengurusan.
- Daftar jenjang: AB1, AB2, AB3.
- Daftar posisi: Ketua, Sekretaris, Bendahara, Kaderisasi, Ketua Bidang, Ketua Departemen, Staf Bidang.
- Pemilik browser dapat mengubah suaranya sampai polling ditutup.
- Satu token membatasi satu suara per browser. Menghapus data browser atau menggunakan browser/perangkat berbeda dapat menghasilkan suara tambahan; sistem tidak memverifikasi satu suara per orang.
- Polling tidak meminta identitas langsung, nomor identitas, nomor kontak, atau data pribadi lain.

## Calon

- Daftar calon merupakan data statis di source aplikasi, satu berkas Markdown per calon.
- Frontmatter tiap berkas memuat nama, asal PW, dan asal PD. Body berkas disediakan untuk deskripsi.
- Nama berkas yang stabil menjadi ID calon.
- Urutan pilihan calon ditetapkan panitia.

## Asal PW dan PD

- Worker mengambil daftar melalui upstream `https://www.kammi.id/api/v1/struktur`.
- Frontend memakai route same-origin `GET /api/struktur?jenis=pw` untuk PW dan `GET /api/struktur?jenis=pd&ancestor=<id-pw>` untuk PD.
- Worker meneruskan parameter `jenis` dan `ancestor` (untuk PD) serta menambahkan token autentikasi upstream dari secret server.
- Respons yang diharapkan berupa array objek dengan `id`, `nama`, `slug`, dan `jenis`.
- Daftar PW/PD di-cache enam jam. Ketika upstream gagal, gunakan respons terakhir yang berhasil. Jika belum ada respons yang berhasil, blokir pengiriman suara sampai daftar tersedia.
- Jawaban menyimpan ID dan nama PW/PD yang dipilih.

Catatan implementasi: cache Workers bersifat lokal per data center. Cache API `cache.match`/`cache.put` tidak mendukung `stale-if-error`, jadi penggunaan cache bawaan hanya dapat memberi fallback best-effort. Jika fallback lintas lokasi dan setelah masa cache habis harus dijamin, implementasi perlu memilih penyimpanan cache terpisah; jangan menyimpan cache organisasi ke tabel jawaban polling.

## Hasil dan retensi

- Jumlah suara per calon dan tabulasi silang untuk seluruh kombinasi calon, PW, PD, jenjang, dan posisi tersedia untuk publik selama polling berlangsung dan setelah polling ditutup.
- Kombinasi yang hanya memiliki satu suara tetap ditampilkan. Kombinasi tanpa suara menampilkan pesan data kosong.
- Token edit berupa nilai acak disimpan di cookie `HttpOnly`; database menyimpan hash token, bukan nilai mentahnya.
- Ketika polling ditutup, hash token edit dihapus dan suara tidak lagi dapat diubah.
- Jawaban terperinci disimpan selama 90 hari setelah penutupan, lalu dihapus.
- Hasil agregat final untuk seluruh kombinasi dipertahankan agar hasil publik tetap tersedia setelah jawaban terperinci dihapus.

## Batasan privasi

Polling tidak mengumpulkan identitas langsung. Token browser hanya mencegah perubahan suara lintas-token, bukan membuktikan identitas atau kelayakan peserta. Tabulasi silang satu-suara dapat memudahkan inferensi pilihan seseorang. Worker tidak boleh mencatat isi suara, token, atau cookie dalam log aplikasi; metadata operasional platform dapat tetap tersedia.

## Di luar cakupan

- Verifikasi identitas atau kelayakan kader.
- Jaminan satu suara per orang.
- Antarmuka admin untuk mengubah calon, jadwal, atau daftar kategori.
- Hasil polling sebagai hasil pemilihan resmi.
