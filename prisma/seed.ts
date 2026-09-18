import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.$executeRaw`TRUNCATE TABLE "activity_logs" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "notifications" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "laporans" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "dokumentasis" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "agendas" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "pengeluarans" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "donasis" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "donaturs" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "rab_items" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "rabs" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "proposals" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "kegiatans" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "user_roles" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "role_permissions" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "roles" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "permissions" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "media" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "settings" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "verification_tokens" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "accounts" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "sessions" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE`;

  // Create Roles
  const roles = await Promise.all([
    prisma.role.create({ data: { name: 'SUPER_ADMIN', description: 'Akses seluruh sistem' } }),
    prisma.role.create({ data: { name: 'ADMIN', description: 'Mengelola kegiatan dan operasional' } }),
    prisma.role.create({ data: { name: 'BENDAHARA', description: 'Mengelola keuangan' } }),
    prisma.role.create({ data: { name: 'OPERATOR', description: 'Input kegiatan dan dokumentasi' } }),
    prisma.role.create({ data: { name: 'DONATUR', description: 'Melihat kegiatan dan riwayat donasi' } }),
  ]);

  // Create Permissions
  const permissions = await Promise.all([
    prisma.permission.create({ data: { name: 'manage_users', description: 'Mengelola pengguna', module: 'users' } }),
    prisma.permission.create({ data: { name: 'manage_roles', description: 'Mengelola role', module: 'roles' } }),
    prisma.permission.create({ data: { name: 'manage_kegiatan', description: 'Mengelola kegiatan', module: 'kegiatan' } }),
    prisma.permission.create({ data: { name: 'manage_proposal', description: 'Mengelola proposal', module: 'proposal' } }),
    prisma.permission.create({ data: { name: 'manage_rab', description: 'Mengelola RAB', module: 'rab' } }),
    prisma.permission.create({ data: { name: 'manage_donasi', description: 'Mengelola donasi', module: 'donasi' } }),
    prisma.permission.create({ data: { name: 'verify_donasi', description: 'Verifikasi donasi', module: 'donasi' } }),
    prisma.permission.create({ data: { name: 'manage_pengeluaran', description: 'Mengelola pengeluaran', module: 'pengeluaran' } }),
    prisma.permission.create({ data: { name: 'verify_pengeluaran', description: 'Verifikasi pengeluaran', module: 'pengeluaran' } }),
    prisma.permission.create({ data: { name: 'manage_agenda', description: 'Mengelola agenda', module: 'agenda' } }),
    prisma.permission.create({ data: { name: 'manage_dokumentasi', description: 'Mengelola dokumentasi', module: 'dokumentasi' } }),
    prisma.permission.create({ data: { name: 'manage_laporan', description: 'Mengelola laporan', module: 'laporan' } }),
    prisma.permission.create({ data: { name: 'view_reports', description: 'Melihat laporan', module: 'reports' } }),
    prisma.permission.create({ data: { name: 'manage_settings', description: 'Mengelola pengaturan', module: 'settings' } }),
    prisma.permission.create({ data: { name: 'allow_negative_balance', description: 'Izinkan saldo negatif', module: 'finance' } }),
  ]);

  // Assign permissions to roles
  const superAdminPerms = permissions.map(p => p.id);
  const adminPerms = permissions.filter(p => !['manage_users', 'manage_roles', 'manage_settings'].includes(p.name)).map(p => p.id);
  const bendaharaPerms = permissions.filter(p => ['manage_donasi', 'verify_donasi', 'manage_pengeluaran', 'verify_pengeluaran', 'view_reports', 'allow_negative_balance'].includes(p.name)).map(p => p.id);
  const operatorPerms = permissions.filter(p => ['manage_kegiatan', 'manage_agenda', 'manage_dokumentasi', 'view_reports'].includes(p.name)).map(p => p.id);
  const donaturPerms = permissions.filter(p => ['view_reports'].includes(p.name)).map(p => p.id);

  // Assign role permissions
  for (const permId of superAdminPerms) {
    await prisma.rolePermission.create({ data: { roleId: roles[0].id, permissionId: permId } });
  }
  for (const permId of adminPerms) {
    await prisma.rolePermission.create({ data: { roleId: roles[1].id, permissionId: permId } });
  }
  for (const permId of bendaharaPerms) {
    await prisma.rolePermission.create({ data: { roleId: roles[2].id, permissionId: permId } });
  }
  for (const permId of operatorPerms) {
    await prisma.rolePermission.create({ data: { roleId: roles[3].id, permissionId: permId } });
  }
  for (const permId of donaturPerms) {
    await prisma.rolePermission.create({ data: { roleId: roles[4].id, permissionId: permId } });
  }

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '081234567890',
      isActive: true,
    }
  });

  const bendahara = await prisma.user.create({
    data: {
      name: 'Bendahara Utama',
      email: 'bendahara@example.com',
      password: hashedPassword,
      phone: '081234567891',
      isActive: true,
    }
  });

  const operator = await prisma.user.create({
    data: {
      name: 'Operator Lapangan',
      email: 'operator@example.com',
      password: hashedPassword,
      phone: '081234567892',
      isActive: true,
    }
  });

  // Assign roles to users
  await prisma.userRole.create({ data: { userId: superAdmin.id, roleId: roles[0].id } });
  await prisma.userRole.create({ data: { userId: bendahara.id, roleId: roles[2].id } });
  await prisma.userRole.create({ data: { userId: operator.id, roleId: roles[3].id } });

  // Create Kegiatan
  const kegiatan1 = await prisma.kegiatan.create({
    data: {
      kodeKegiatan: 'PB-0031',
      namaKegiatan: 'Pipanisasi Bahagia #31',
      slug: 'pipanisasi-bahagia-31',
      jenisKegiatan: 'PIPANISASI' as any,
      deskripsi: 'Pembangunan jaringan pipa air bersih untuk warga Dukuh Candi Krikil, Penggung, Boyolali. Kegiatan ini bertujuan untuk menyediakan akses air bersih yang layak bagi masyarakat setempat.',
      latarBelakang: 'Masyarakat Dukuh Candi Krikil masih mengalami kesulitan dalam mendapatkan akses air bersih yang layak. Sumber air utama berupa sumur dangkas yang kualitasnya kurang memadai.',
      tujuan: 'Menyediakan akses air bersih yang layak dan berkelanjutan bagi seluruh warga Dukuh Candi Krikil.',
      lokasi: 'Dukuh Candi Krikil',
      alamat: 'Dukuh Candi Krikil, Penggung, Boyolali',
      desa: 'Penggung',
      kecamatan: 'Boyolali',
      kabupaten: 'Boyolali',
      provinsi: 'Jawa Tengah',
      latitude: -7.5333,
      longitude: 110.6,
      tanggalMulai: new Date('2026-08-01'),
      tanggalSelesai: new Date('2026-09-30'),
      status: 'PELAKSANAAN' as any,
      targetDana: 50000000,
      danaTerkumpul: 44650000,
      totalPengeluaran: 38612000,
      saldo: 6038000,
      jumlahPenerimaManfaat: 150,
      jumlahMasjid: 2,
      jumlahKk: 45,
      panjangPipa: 1200,
      sumberAir: 'Sumur Bor',
      createdBy: superAdmin.id,
    }
  });

  const kegiatan2 = await prisma.kegiatan.create({
    data: {
      kodeKegiatan: 'PB-0032',
      namaKegiatan: 'Pipanisasi Bahagia #32',
      slug: 'pipanisasi-bahagia-32',
      jenisKegiatan: 'PIPANISASI' as any,
      deskripsi: 'Pembangunan jaringan pipa air bersih untuk warga Dukuh Krajan, Penggung, Boyolali.',
      latarBelakang: 'Masyarakat Dukuh Krajan membutuhkan akses air bersih yang lebih baik.',
      tujuan: 'Menyediakan akses air bersih bagi warga Dukuh Krajan.',
      lokasi: 'Dukuh Krajan',
      alamat: 'Dukuh Krajan, Penggung, Boyolali',
      desa: 'Penggung',
      kecamatan: 'Boyolali',
      kabupaten: 'Boyolali',
      provinsi: 'Jawa Tengah',
      latitude: -7.5340,
      longitude: 110.6010,
      tanggalMulai: new Date('2026-09-01'),
      tanggalSelesai: new Date('2026-11-30'),
      status: 'PENGGALANGAN_DANA' as any,
      targetDana: 60000000,
      danaTerkumpul: 25000000,
      totalPengeluaran: 0,
      saldo: 25000000,
      jumlahPenerimaManfaat: 200,
      jumlahMasjid: 1,
      jumlahKk: 55,
      panjangPipa: 1500,
      sumberAir: 'Sumur Bor',
      createdBy: superAdmin.id,
    }
  });

  const kegiatan3 = await prisma.kegiatan.create({
    data: {
      kodeKegiatan: 'PB-0033',
      namaKegiatan: 'Pipanisasi Bahagia #33',
      slug: 'pipanisasi-bahagia-33',
      jenisKegiatan: 'SUMUR' as any,
      deskripsi: 'Pembangunan sumur bor untuk Masjid Al Iman.',
      latarBelakang: 'Masjid Al Iman membutuhkan suplai air yang memadai untuk kebutuhan jamaah.',
      tujuan: 'Membangun sumur bor di Masjid Al Iman.',
      lokasi: 'Masjid Al Iman',
      alamat: 'Masjid Al Iman, Sragen',
      desa: 'Sragen',
      kecamatan: 'Sragen',
      kabupaten: 'Sragen',
      provinsi: 'Jawa Tengah',
      latitude: -7.4281,
      longitude: 111.0253,
      tanggalMulai: new Date('2026-10-01'),
      tanggalSelesai: new Date('2026-12-31'),
      status: 'PROPOSAL' as any,
      targetDana: 35000000,
      danaTerkumpul: 0,
      totalPengeluaran: 0,
      saldo: 0,
      jumlahPenerimaManfaat: 300,
      jumlahMasjid: 1,
      jumlahKk: 0,
      panjangPipa: 0,
      sumberAir: 'Sumur Bor',
      createdBy: superAdmin.id,
    }
  });

  // Create Proposals
  await prisma.proposal.create({
    data: {
      kegiatanId: kegiatan1.id,
      judul: 'Proposal Pipanisasi Bahagia #31 - Dukuh Candi Krikil',
      isi: 'Proposal kegiatan pipanisasi untuk Dukuh Candi Krikil, Penggung, Boyolali. Kegiatan ini meliputi pembangunan jaringan pipa air bersih sepanjang 1.2 km dengan sumber air dari sumur bor.',
      status: 'APPROVED' as any,
      submittedAt: new Date('2026-07-15'),
      reviewedAt: new Date('2026-07-20'),
      reviewedBy: superAdmin.id,
    }
  });

  await prisma.proposal.create({
    data: {
      kegiatanId: kegiatan2.id,
      judul: 'Proposal Pipanisasi Bahagia #32 - Dukuh Krajan',
      isi: 'Proposal kegiatan pipanisasi untuk Dukuh Krajan, Penggung, Boyolali.',
      status: 'APPROVED' as any,
      submittedAt: new Date('2026-08-15'),
      reviewedAt: new Date('2026-08-20'),
      reviewedBy: superAdmin.id,
    }
  });

  await prisma.proposal.create({
    data: {
      kegiatanId: kegiatan3.id,
      judul: 'Proposal Pembangunan Sumur Bor Masjid Al Iman',
      isi: 'Proposal pembangunan sumur bor untuk Masjid Al Iman, Sragen.',
      status: 'SUBMITTED' as any,
      submittedAt: new Date('2026-09-10'),
    }
  });

  // Create RAB for kegiatan1
  const rab1 = await prisma.rab.create({
    data: {
      kegiatanId: kegiatan1.id,
      kodeRab: 'RAB-0031',
      judul: 'RAB Pipanisasi Bahagia #31',
      total: 45000000,
      status: 'APPROVED' as any,
    }
  });

  await prisma.rabItem.createMany({
      data: [
      { rabId: rab1.id, namaItem: 'Pipa PVC 4"', kategori: 'MATERIAL' as any, volume: 17, satuan: 'roll', hargaSatuan: 450000, jumlah: 7650000, keterangan: '17 roll pipa PVC diameter 4 inci' },
      { rabId: rab1.id, namaItem: 'Coupler Reducer', kategori: 'MATERIAL' as any, volume: 50, satuan: 'pcs', hargaSatuan: 15000, jumlah: 750000, keterangan: 'Sambungan pipa' },
      { rabId: rab1.id, namaItem: 'Klep dan Fitting', kategori: 'MATERIAL' as any, volume: 30, satuan: 'pcs', hargaSatuan: 25000, jumlah: 750000, keterangan: 'Klep dan aksesoris pipa' },
      { rabId: rab1.id, namaItem: 'Biaya Bor Sumur', kategori: 'MATERIAL' as any, volume: 1, satuan: 'unit', hargaSatuan: 12000000, jumlah: 12000000, keterangan: 'Biaya pembuatan sumur bor' },
      { rabId: rab1.id, namaItem: 'Biaya Instalasi', kategori: 'TENAGA' as any, volume: 1, satuan: 'paket', hargaSatuan: 8000000, jumlah: 8000000, keterangan: 'Biaya tenaga kerja instalasi' },
      { rabId: rab1.id, namaItem: 'Transportasi', kategori: 'TRANSPORTASI' as any, volume: 5, satuan: 'trip', hargaSatuan: 500000, jumlah: 2500000, keterangan: 'Biaya transportasi material' },
      { rabId: rab1.id, namaItem: 'Konsumsi Relawan', kategori: 'KONSUMSI' as any, volume: 20, satuan: 'orang', hargaSatuan: 25000, jumlah: 500000, keterangan: 'Konsumsi relawan lapangan' },
      { rabId: rab1.id, namaItem: 'Lain-lain', kategori: 'LAINNYA' as any, volume: 1, satuan: 'paket', hargaSatuan: 12100000, jumlah: 12100000, keterangan: 'Biaya tak terduga dan lain-lain' },
    ]
  });

  // Create RAB for kegiatan2
  const rab2 = await prisma.rab.create({
    data: {
      kegiatanId: kegiatan2.id,
      kodeRab: 'RAB-0032',
      judul: 'RAB Pipanisasi Bahagia #32',
      total: 55000000,
      status: 'DRAFT' as any,
    }
  });

  // Create Donatur
  const donaturs = await Promise.all([
    prisma.donatur.create({ data: { nama: 'MT Al Iman', email: 'mtalimain@example.com', phone: '081234567801' } }),
    prisma.donatur.create({ data: { nama: 'Dekap', email: 'dekap@example.com', phone: '081234567802' } }),
    prisma.donatur.create({ data: { nama: 'iRoom', email: 'iroom@example.com', phone: '081234567803' } }),
    prisma.donatur.create({ data: { nama: 'SMB', email: 'smb@example.com', phone: '081234567804' } }),
    prisma.donatur.create({ data: { nama: 'Jamillah SAHL', email: 'jamillah@example.com', phone: '081234567805' } }),
    prisma.donatur.create({ data: { nama: 'Al Furqon', email: 'alfurqon@example.com', phone: '081234567806' } }),
    prisma.donatur.create({ data: { nama: 'GSM Repair Group', email: 'gsm@example.com', phone: '081234567807' } }),
    prisma.donatur.create({ data: { nama: 'Al Hidayah Sragen', email: 'alhidayah@example.com', phone: '081234567808' } }),
  ]);

  // Create Donasi for kegiatan1
  const donasis = [
    { kegiatanId: kegiatan1.id, donaturId: donaturs[0].id, namaDonatur: 'MT Al Iman', tanggal: new Date('2026-08-05'), nominal: 10000000, metode: 'TRANSFER' as any, bank: 'BCA', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-06'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, donaturId: donaturs[1].id, namaDonatur: 'Dekap', tanggal: new Date('2026-08-10'), nominal: 5000000, metode: 'TRANSFER' as any, bank: 'Mandiri', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-11'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, donaturId: donaturs[2].id, namaDonatur: 'iRoom', tanggal: new Date('2026-08-12'), nominal: 5000000, metode: 'TRANSFER' as any, bank: 'BRI', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-13'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, donaturId: donaturs[3].id, namaDonatur: 'SMB', tanggal: new Date('2026-08-15'), nominal: 5000000, metode: 'TRANSFER' as any, bank: 'BCA', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-16'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, donaturId: donaturs[4].id, namaDonatur: 'Jamillah SAHL', tanggal: new Date('2026-08-18'), nominal: 5000000, metode: 'QRIS' as any, status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-19'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, donaturId: donaturs[5].id, namaDonatur: 'Al Furqon', tanggal: new Date('2026-08-20'), nominal: 5000000, metode: 'TRANSFER' as any, bank: 'BNI', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-21'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, donaturId: donaturs[6].id, namaDonatur: 'GSM Repair Group', tanggal: new Date('2026-08-25'), nominal: 7150000, metode: 'TRANSFER' as any, bank: 'BCA', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-26'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, donaturId: donaturs[7].id, namaDonatur: 'Al Hidayah Sragen', tanggal: new Date('2026-09-01'), nominal: 7500000, metode: 'TRANSFER' as any, bank: 'Mandiri', status: 'VERIFIED' as any, verifiedAt: new Date('2026-09-02'), verifiedBy: bendahara.id },
  ];

  for (const d of donasis) {
    await prisma.donasi.create({ data: d });
  }

  // Create some donasi for kegiatan2
  await prisma.donasi.create({ data: { kegiatanId: kegiatan2.id, donaturId: donaturs[0].id, namaDonatur: 'MT Al Iman', tanggal: new Date('2026-09-05'), nominal: 15000000, metode: 'TRANSFER' as any, bank: 'BCA', status: 'VERIFIED' as any, verifiedAt: new Date('2026-09-06'), verifiedBy: bendahara.id } });
  await prisma.donasi.create({ data: { kegiatanId: kegiatan2.id, donaturId: donaturs[5].id, namaDonatur: 'Al Furqon', tanggal: new Date('2026-09-10'), nominal: 10000000, metode: 'TRANSFER' as any, bank: 'BNI', status: 'VERIFIED' as any, verifiedAt: new Date('2026-09-11'), verifiedBy: bendahara.id } });

  // Create Pengeluaran for kegiatan1
  const pengeluarans = [
    { kegiatanId: kegiatan1.id, tanggal: new Date('2026-08-20'), nomorTransaksi: 'TRX-00001', kategori: 'MATERIAL' as any, deskripsi: 'Pembelian 17 roll pipa PVC 4"', nominal: 7650000, vendor: 'Toko Pipa Jaya', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-21'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, tanggal: new Date('2026-08-20'), nomorTransaksi: 'TRX-00002', kategori: 'MATERIAL' as any, deskripsi: 'Pembelian coupler reducer 50 pcs', nominal: 750000, vendor: 'Toko Pipa Jaya', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-21'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, tanggal: new Date('2026-08-21'), nomorTransaksi: 'TRX-00003', kategori: 'MATERIAL' as any, deskripsi: 'Pembelian klep dan fitting', nominal: 750000, vendor: 'Toko Pipa Jaya', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-22'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, tanggal: new Date('2026-08-22'), nomorTransaksi: 'TRX-00004', kategori: 'MATERIAL' as any, deskripsi: 'Biaya bor sumur', nominal: 12000000, vendor: 'Bor Sumur Abadi', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-23'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, tanggal: new Date('2026-08-25'), nomorTransaksi: 'TRX-00005', kategori: 'TENAGA' as any, deskripsi: 'Biaya tenaga kerja instalasi pipa', nominal: 8000000, vendor: 'Tim Instalasi', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-26'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, tanggal: new Date('2026-08-26'), nomorTransaksi: 'TRX-00006', kategori: 'TRANSPORTASI' as any, deskripsi: 'Biaya transportasi material 5 trip', nominal: 2500000, vendor: 'Rental Pick Up', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-27'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, tanggal: new Date('2026-08-28'), nomorTransaksi: 'TRX-00007', kategori: 'KONSUMSI' as any, deskripsi: 'Konsumsi relawan lapangan', nominal: 500000, vendor: 'Warung Bu Sari', status: 'VERIFIED' as any, verifiedAt: new Date('2026-08-29'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, tanggal: new Date('2026-09-01'), nomorTransaksi: 'TRX-00008', kategori: 'OPERASIONAL' as any, deskripsi: 'Santunan sembako untuk warga', nominal: 3500000, vendor: 'Toko Kelontong', status: 'VERIFIED' as any, verifiedAt: new Date('2026-09-02'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, tanggal: new Date('2026-09-02'), nomorTransaksi: 'TRX-00009', kategori: 'KONSUMSI' as any, deskripsi: 'Masakan kambing acara syukuran', nominal: 2500000, vendor: 'Catering Berkah', status: 'VERIFIED' as any, verifiedAt: new Date('2026-09-03'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, tanggal: new Date('2026-09-03'), nomorTransaksi: 'TRX-00010', kategori: 'KONSUMSI' as any, deskripsi: 'Air mineral untuk relawan', nominal: 200000, vendor: 'Toko Minuman', status: 'VERIFIED' as any, verifiedAt: new Date('2026-09-04'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, tanggal: new Date('2026-09-05'), nomorTransaksi: 'TRX-00011', kategori: 'OPERASIONAL' as any, deskripsi: 'MMT dan spanduk', nominal: 1500000, vendor: 'Percetakan Jaya', status: 'VERIFIED' as any, verifiedAt: new Date('2026-09-06'), verifiedBy: bendahara.id },
    { kegiatanId: kegiatan1.id, tanggal: new Date('2026-09-06'), nomorTransaksi: 'TRX-00012', kategori: 'LAINNYA' as any, deskripsi: 'Biaya administrasi dan lain-lain', nominal: 8562000, vendor: 'Lain-lain', status: 'VERIFIED' as any, verifiedAt: new Date('2026-09-07'), verifiedBy: bendahara.id },
  ];

  for (const p of pengeluarans) {
    await prisma.pengeluaran.create({ data: p });
  }

  // Create Agenda for kegiatan1
  const agendas = [
    { kegiatanId: kegiatan1.id, judul: 'Survey Lokasi', tanggal: new Date('2026-08-01'), waktuMulai: new Date('2026-08-01T08:00:00'), waktuSelesai: new Date('2026-08-01T12:00:00'), lokasi: 'Dukuh Candi Krikil', deskripsi: 'Survey lokasi dan perencanaan jalur pipa', status: 'COMPLETED' as any, penanggungJawab: 'Operator Lapangan' },
    { kegiatanId: kegiatan1.id, judul: 'Pembukaan Proyek', tanggal: new Date('2026-08-15'), waktuMulai: new Date('2026-08-15T08:00:00'), waktuSelesai: new Date('2026-08-15T11:00:00'), lokasi: 'Masjid Dukuh Candi Krikil', deskripsi: 'Pembukaan dan doa bersama', status: 'COMPLETED' as any, penanggungJawab: 'Super Admin' },
    { kegiatanId: kegiatan1.id, judul: 'Penggalian dan Instalasi Pipa', tanggal: new Date('2026-08-22'), waktuMulai: new Date('2026-08-22T07:00:00'), waktuSelesai: new Date('2026-09-05T17:00:00'), lokasi: 'Dukuh Candi Krikil', deskripsi: 'Penggalian tanah dan pemasangan pipa', status: 'COMPLETED' as any, penanggungJawab: 'Operator Lapangan' },
    { kegiatanId: kegiatan1.id, judul: 'Pengeboran Sumur', tanggal: new Date('2026-08-25'), waktuMulai: new Date('2026-08-25T08:00:00'), waktuSelesai: new Date('2026-08-30T17:00:00'), lokasi: 'Dukuh Candi Krikil', deskripsi: 'Pengeboran sumur untuk sumber air', status: 'COMPLETED' as any, penanggungJawab: 'Operator Lapangan' },
    { kegiatanId: kegiatan1.id, judul: 'Uji Coba dan Penyaluran', tanggal: new Date('2026-09-10'), waktuMulai: new Date('2026-09-10T08:00:00'), waktuSelesai: new Date('2026-09-10T17:00:00'), lokasi: 'Dukuh Candi Krikil', deskripsi: 'Uji coba aliran air dan penyaluran ke rumah warga', status: 'PLANNED' as any, penanggungJawab: 'Operator Lapangan' },
    { kegiatanId: kegiatan1.id, judul: 'Syukuran dan Penyerahan', tanggal: new Date('2026-09-15'), waktuMulai: new Date('2026-09-15T09:00:00'), waktuSelesai: new Date('2026-09-15T12:00:00'), lokasi: 'Dukuh Candi Krikil', deskripsi: 'Acara syukuran dan serah terima ke warga', status: 'PLANNED' as any, penanggungJawab: 'Super Admin' },
  ];

  for (const a of agendas) {
    await prisma.agenda.create({ data: a });
  }

  // Create Dokumentasi
  const docs = [
    { kegiatanId: kegiatan1.id, judul: 'Survey Lokasi Dukuh Candi Krikil', deskripsi: 'Tim survey memeriksa lokasi dan merencanakan jalur pipa', tanggal: new Date('2026-08-01'), kategori: 'SURVEY' as any, caption: 'Survey lokasi di Dukuh Candi Krikil' },
    { kegiatanId: kegiatan1.id, judul: 'Pembukaan Proyek', deskripsi: 'Acara pembukaan proyek pipanisasi', tanggal: new Date('2026-08-15'), kategori: 'PELAKSANAAN' as any, caption: 'Pembukaan proyek di Masjid' },
    { kegiatanId: kegiatan1.id, judul: 'Pengiriman Material Pipa', deskripsi: 'Pengiriman 17 roll pipa PVC ke lokasi', tanggal: new Date('2026-08-20'), kategori: 'MATERIAL' as any, caption: 'Pipa PVC siap dipasang' },
    { kegiatanId: kegiatan1.id, judul: 'Pemasangan Pipa', deskripsi: 'Proses pemasangan pipa di jalur utama', tanggal: new Date('2026-08-25'), kategori: 'PELAKSANAAN' as any, caption: 'Pemasangan pipa PVC 4"' },
    { kegiatanId: kegiatan1.id, judul: 'Penyaluran Air', deskripsi: 'Air bersih mulai mengalir ke rumah warga', tanggal: new Date('2026-09-05'), kategori: 'PENYALURAN' as any, caption: 'Air bersih mengalir ke rumah warga' },
    { kegiatanId: kegiatan1.id, judul: 'Proyek Selesai', deskripsi: 'Pipanisasi selesai dan diserahterimakan', tanggal: new Date('2026-09-10'), kategori: 'SELESAI' as any, caption: 'Proyek pipanisasi selesai' },
  ];

  for (const d of docs) {
    await prisma.dokumentasi.create({ data: d });
  }

  // Create Laporan
  await prisma.laporan.create({
    data: {
      kegiatanId: kegiatan1.id,
      judul: 'Laporan Pertanggungjawaban Pipanisasi Bahagia #31',
      isi: 'Laporan pertanggungjawaban penggunaan dana kegiatan pipanisasi Bahagia #31 di Dukuh Candi Krikil, Penggung, Boyolali.',
      tipeLaporan: 'PERTANGGUNGJAWABAN' as any,
      status: 'PUBLISHED' as any,
      publishedAt: new Date('2026-09-15'),
      createdBy: superAdmin.id,
    }
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
