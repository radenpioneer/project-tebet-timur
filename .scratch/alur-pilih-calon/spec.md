# Alur pilih calon dan halaman hasil

Status: disetujui; diimplementasikan pada antarmuka lokal

Spesifikasi ini memperbarui alur antarmuka polling pada [spesifikasi polling](../polling-ketumum-pp-kammi/spec.md). Aturan suara anonim, perubahan suara dari browser yang sama, kategori jawaban, hasil publik, waktu penutupan, dan retensi tetap mengikuti spesifikasi tersebut.

## Halaman pilih (`/`)

- Selama polling terbuka, pengunjung yang belum memiliki suara langsung melihat ajakan memilih dan kartu besar untuk setiap calon. Kartu menampilkan foto, nama, asal PW, dan asal PD. Pada layar desktop maupun mobile, kartu berjajar dalam satu baris dan dapat digeser ke samping.
- Halaman menyediakan tombol **Lihat hasil** yang membuka `/hasil` tanpa harus mengirim suara.
- Foto calon yang belum disuplai menampilkan placeholder yang jelas, tanpa membuat potret rekaan.
- Browser dengan suara tersimpan langsung diarahkan ke `/hasil`. Pemeriksaan suara diselesaikan sebelum halaman pilih ditampilkan agar kartu tidak berkedip sebelum pengalihan.
- Saat polling ditutup, semua kunjungan ke `/` diarahkan ke `/hasil`, tanpa menampilkan aksi untuk memilih atau mengubah suara.

## Sheet profil calon

- Menekan kartu membuka sheet dari bawah pada layar mobile dan dari sisi kanan pada layar besar. Pada layar besar sheet memakai sekitar 90–95% lebar dan tinggi viewport.
- Pada layar besar, foto dan kartu identitas calon berada di kiri; profil berada di kanan. Pada layar mobile, konten mengikuti urutan baca yang wajar dan dapat digulir.
- Profil berasal dari berkas Markdown masing-masing calon, dengan bagian tetap **Sinopsis**, **Visi**, **Misi**, dan **Program unggulan**. Setiap bagian kosong menampilkan placeholder; data calon tidak dikarang.
- Footer sheet selalu terlihat dan berisi tombol **Pilih** serta **Batal**. Pilih menutup sheet profil lalu membuka sheet formulir. Batal menutup sheet profil dan kembali ke kartu calon.

## Sheet formulir suara

- Sheet formulir terbuka dari bawah pada mobile dan dari sisi kanan pada layar besar. Lebarnya lebih ramping daripada sheet profil di layar besar agar isian mudah dipindai.
- Bagian awal menampilkan kartu pilihan dengan foto atau placeholder, nama, asal PW, dan asal PD calon yang dipilih.
- Formulir memuat combobox **Asal PW**, combobox **Asal PD** yang bergantung pada PW, select **Jenjang kaderisasi**, dan select **Posisi kepengurusan**. Pilihan organisasi dan validasinya mengikuti spesifikasi polling.
- Tombol **Submit** dan **Batal** selalu terlihat di bagian bawah sheet. Batal menutup semua sheet dan kembali ke kartu calon tanpa menyimpan suara. Submit yang berhasil mengarahkan ke `/hasil`; kesalahan pengiriman tetap terlihat di formulir agar dapat diperbaiki.

## Halaman hasil (`/hasil`)

- Hasil tetap publik sebelum dan sesudah seseorang mengirim suara. Halaman menampilkan grafik batang jumlah dan persentase suara per calon, kontrol filter calon/PW/PD/jenjang/posisi, serta tabel tabulasi rinci di bawah grafik.
- Grafik dan tabel mengikuti filter. Persentase setiap calon memakai jumlah seluruh suara yang cocok dengan filter demografi sebagai pembagi; filter **Calon** hanya menentukan batang mana yang ditampilkan, sehingga satu batang tidak otomatis menjadi 100%.
- Selama polling terbuka, browser dengan suara tersimpan melihat tombol **Ubah pilihan**; browser tanpa suara melihat tombol **Kembali ke pilih**. Kedua tombol menuju `/`, tetapi Ubah pilihan memasuki alur edit tanpa pengalihan otomatis kembali ke `/hasil`.
- Dalam alur edit, kartu calon yang sebelumnya dipilih ditandai. Pengunjung dapat membuka calon mana pun; isian PW, PD, jenjang, dan posisi lama tersedia untuk diperiksa atau diubah sebelum submit ulang.
- Saat polling ditutup, kedua tombol untuk memilih atau mengubah suara disembunyikan. Hasil dan tabel tetap tersedia sesuai aturan retensi yang sudah disepakati.

## Materi dan batasan

- Lima berkas calon yang ada saat ini belum memiliki foto maupun isi profil. Struktur profil dan placeholder sudah tersedia; foto dan naskah asli akan disuplai kemudian.
- Antarmuka tetap menyebut polling ini nonresmi dan tidak mengklaim verifikasi identitas maupun satu suara per orang.
- Gunakan komponen shadcn dari konfigurasi proyek untuk sheet, combobox, select, tombol, kartu, dan grafik ketika tersedia.
- Ikuti sistem visual proyek yang ada dan gunakan Impeccable untuk rancangan, implementasi, serta pemeriksaan tampilan.
