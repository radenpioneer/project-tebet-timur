# 01: Sediakan pilihan asal PW dan asal PD

**What to build:** Peserta dapat memilih asal PW dan PD yang sesuai sebelum mengisi suara. Daftar berasal dari upstream, memakai cache enam jam dan respons sukses terakhir saat upstream gagal; pengiriman suara diblokir jika daftar belum pernah tersedia.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Peserta dapat memuat daftar PW dan daftar PD yang sesuai dengan PW terpilih.
- [ ] Daftar di-cache selama enam jam; ketika upstream gagal, respons sukses terakhir digunakan, dan jika belum ada respons sukses pengiriman suara tidak dapat dilakukan.
- [ ] Pilihan menyimpan ID dan nama organisasi serta tidak menampilkan atau mencatat token autentikasi upstream.
