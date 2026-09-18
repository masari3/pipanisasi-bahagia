import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const kegiatanSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  tanggalMulai: z.string().min(1, 'Tanggal mulai harus diisi'),
  tanggalSelesai: z.string().min(1, 'Tanggal selesai harus diisi'),
  lokasi: z.string().min(1, 'Lokasi harus diisi'),
  jenisKegiatan: z.string().min(1, 'Jenis kegiatan harus diisi'),
  targetDana: z.number().min(0, 'Target dana harus positif'),
  status: z.string().optional(),
})

export const proposalSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  kegiatanId: z.string().min(1, 'Kegiatan harus dipilih'),
  jumlahDana: z.number().min(0, 'Jumlah dana harus positif'),
  status: z.string().optional(),
})

export const rabItemSchema = z.object({
  nama: z.string().min(1, 'Nama item harus diisi'),
  kategori: z.string().min(1, 'Kategori harus diisi'),
  satuan: z.string().min(1, 'Satuan harus diisi'),
  hargaSatuan: z.number().min(0, 'Harga satuan harus positif'),
  jumlah: z.number().min(1, 'Jumlah minimal 1'),
  subtotal: z.number().min(0, 'Subtotal harus positif'),
})

export const rabSchema = z.object({
  kegiatanId: z.string().min(1, 'Kegiatan harus dipilih'),
  items: z.array(rabItemSchema).min(1, 'Minimal 1 item RAB'),
})

export const donasiSchema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  telepon: z.string().min(1, 'Telepon harus diisi'),
  jumlah: z.number().min(1, 'Jumlah donasi minimal Rp 1'),
  metodePembayaran: z.string().min(1, 'Metode pembayaran harus dipilih'),
  kegiatanId: z.string().min(1, 'Kegiatan harus dipilih'),
  catatan: z.string().optional(),
})

export const pengeluaranSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  jumlah: z.number().min(1, 'Jumlah harus positif'),
  kategori: z.string().min(1, 'Kategori harus diisi'),
  kegiatanId: z.string().min(1, 'Kegiatan harus dipilih'),
  bukti: z.string().optional(),
  status: z.string().optional(),
})

export const agendaSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  tanggal: z.string().min(1, 'Tanggal harus diisi'),
  waktuMulai: z.string().min(1, 'Waktu mulai harus diisi'),
  waktuSelesai: z.string().min(1, 'Waktu selesai harus diisi'),
  lokasi: z.string().min(1, 'Lokasi harus diisi'),
  kegiatanId: z.string().min(1, 'Kegiatan harus dipilih'),
})

export const dokumentasiSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  deskripsi: z.string().optional(),
  kategori: z.string().min(1, 'Kategori harus diisi'),
  fileUrl: z.string().url('URL tidak valid').min(1, 'File harus diunggah'),
  kegiatanId: z.string().min(1, 'Kegiatan harus dipilih'),
})

export const userSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role: z.string().min(1, 'Role harus dipilih'),
  status: z.string().optional(),
})
