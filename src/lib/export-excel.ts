"use client"

import * as XLSX from 'xlsx';
import { formatRupiah } from './utils';

interface ExcelExportOptions {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  sheetName?: string;
}

export function exportToExcel(options: ExcelExportOptions) {
  const { title, headers, rows, filename, sheetName = 'Data' } = options;
  
  const wb = XLSX.utils.book_new();
  
  // Create data array with title
  const data = [
    ['PIPANISASI BAHAGIA'],
    [title],
    [''],
    headers,
    ...rows,
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  const colWidths = headers.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;
  
  // Merge title cells
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportRABToExcel(rab: {
  kodeRab: string;
  judul: string;
  items: {
    namaItem: string;
    kategori: string;
    volume: number;
    satuan: string;
    hargaSatuan: number;
    jumlah: number;
    keterangan: string;
  }[];
  total: number;
}) {
  const headers = ['No', 'Nama Item', 'Kategori', 'Volume', 'Satuan', 'Harga Satuan', 'Jumlah', 'Keterangan'];
  const rows = rab.items.map((item, i) => [
    i + 1,
    item.namaItem,
    item.kategori,
    item.volume,
    item.satuan,
    item.hargaSatuan,
    item.jumlah,
    item.keterangan,
  ]);
  rows.push(['', '', '', '', '', 'TOTAL', rab.total, '']);
  
  exportToExcel({
    title: `RAB - ${rab.kodeRab} - ${rab.judul}`,
    headers,
    rows,
    filename: `RAB-${rab.kodeRab}`,
    sheetName: 'RAB',
  });
}

export function exportDonasiToExcel(donasi: {
  tanggal: string;
  donatur: string;
  kegiatan: string;
  nominal: number;
  metode: string;
  bank: string;
  status: string;
}[]) {
  const headers = ['No', 'Tanggal', 'Donatur', 'Kegiatan', 'Nominal', 'Metode', 'Bank', 'Status'];
  const rows = donasi.map((d, i) => [
    i + 1,
    d.tanggal,
    d.donatur,
    d.kegiatan,
    d.nominal,
    d.metode,
    d.bank,
    d.status,
  ]);
  
  exportToExcel({
    title: 'Laporan Dana Masuk',
    headers,
    rows,
    filename: 'Laporan-Dana-Masuk',
    sheetName: 'Dana Masuk',
  });
}

export function exportPengeluaranToExcel(pengeluaran: {
  tanggal: string;
  nomorTransaksi: string;
  kategori: string;
  deskripsi: string;
  nominal: number;
  vendor: string;
  status: string;
}[]) {
  const headers = ['No', 'Tanggal', 'No Transaksi', 'Kategori', 'Deskripsi', 'Nominal', 'Vendor', 'Status'];
  const rows = pengeluaran.map((p, i) => [
    i + 1,
    p.tanggal,
    p.nomorTransaksi,
    p.kategori,
    p.deskripsi,
    p.nominal,
    p.vendor,
    p.status,
  ]);
  
  exportToExcel({
    title: 'Laporan Pengeluaran',
    headers,
    rows,
    filename: 'Laporan-Pengeluaran',
    sheetName: 'Pengeluaran',
  });
}
