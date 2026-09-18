export const ITEMS_PER_PAGE = 10

export const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'BENDAHARA', label: 'Bendahara' },
  { value: 'OPERATOR', label: 'Operator' },
  { value: 'DONATUR', label: 'Donatur' },
] as const

export const STATUS_KEGIATAN = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'PENGGALANGAN_DANA', label: 'Penggalangan Dana' },
  { value: 'PELAKSANAAN', label: 'Pelaksanaan' },
  { value: 'SELESAI', label: 'Selesai' },
  { value: 'LAPORAN', label: 'Laporan' },
  { value: 'ARSIP', label: 'Arsip' },
] as const

export const STATUS_DONASI = [
  { value: 'MENUNGGU', label: 'Menunggu' },
  { value: 'Dikonfirmasi', label: 'Dikonfirmasi' },
  { value: 'DITOLAK', label: 'Ditolak' },
] as const

export const STATUS_PENGELUARAN = [
  { value: 'MENUNGGU', label: 'Menunggu' },
  { value: 'DISETUJUI', label: 'Disetujui' },
  { value: 'DITOLAK', label: 'Ditolak' },
] as const

export const KATEGORI_PENGELUARAN = [
  { value: 'OPERASIONAL', label: 'Operasional' },
  { value: 'PEMBELANJAAN', label: 'Pembelanjaan' },
  { value: 'GAJI', label: 'Gaji' },
  { value: 'SUMBANGAN', label: 'Sumbangan' },
  { value: 'LAINNYA', label: 'Lainnya' },
] as const

export const KATEGORI_RAB = [
  { value: 'UPAH_KERJA', label: 'Upah Kerja' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'PERALATAN', label: 'Peralatan' },
  { value: 'AKOMODASI', label: 'Akomodasi' },
  { value: 'KONSUMSI', label: 'Konsumsi' },
  { value: 'LAINNYA', label: 'Lainnya' },
] as const

export const KATEGORI_DOKUMENTASI = [
  { value: 'FOTO', label: 'Foto' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'DOKUMEN', label: 'Dokumen' },
] as const

export const METODE_PEMBAYARAN = [
  { value: 'TRANSFER_BANK', label: 'Transfer Bank' },
  { value: 'TUNAI', label: 'Tunai' },
  { value: 'E_WALLET', label: 'E-Wallet' },
  { value: 'QRIS', label: 'QRIS' },
  { value: 'LAINNYA', label: 'Lainnya' },
] as const

export const JENIS_KEGIATAN = [
  { value: 'SOSIAL', label: 'Sosial' },
  { value: 'KEAGAMAAN', label: 'Keagamaan' },
  { value: 'PENDIDIKAN', label: 'Pendidikan' },
  { value: 'KESEHATAN', label: 'Kesehatan' },
  { value: 'LINGKUNGAN', label: 'Lingkungan' },
  { value: 'BUDAYA', label: 'Budaya' },
  { value: 'OLAHraga', label: 'Olahraga' },
  { value: 'LAINNYA', label: 'Lainnya' },
] as const
