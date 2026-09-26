# 04: Tutup polling dan kunci perubahan suara

**What to build:** Pada 29 Oktober 2026 pukul 23.59 WIB, peserta tidak dapat lagi mengubah suara, token edit dihapus, dan hasil polling tetap tersedia untuk publik.

**Blocked by:** 02 — Kirim dan ubah suara polling

**Status:** done

- [x] Polling ditutup pada 29 Oktober 2026 pukul 23.59 WIB (WIB/Asia Jakarta).
- [x] Setelah penutupan, pengiriman atau perubahan suara ditolak dan antarmuka menunjukkan polling telah ditutup.
- [x] Hash token edit dihapus saat penutupan.
- [x] Hasil polling tetap tersedia untuk publik setelah penutupan.

## Comments

- Implemented the UTC cutoff guard, scheduled finalization, edit-hash removal, and closed-poll UI. Final aggregate results are stored before token hashes are cleared.
