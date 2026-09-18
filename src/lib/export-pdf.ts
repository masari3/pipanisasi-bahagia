"use client"

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatRupiah } from './utils';

interface ExportOptions {
  title: string;
  subtitle?: string;
  date: string;
  headers: string[];
  rows: (string | number)[][];
  footer?: string[];
  orientation?: 'portrait' | 'landscape';
}

export function exportToPDF(options: ExportOptions) {
  const { title, subtitle, date, headers, rows, footer, orientation = 'portrait' } = options;
  
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  
  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PIPANISASI BAHAGIA', 14, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Mengalirkan Air, Mengalirkan Pahala', 14, 21);
  
  // Line
  doc.setDrawColor(0, 75, 79);
  doc.setLineWidth(0.5);
  doc.line(14, 24, 196, 24);
  
  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 32);
  
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 38);
  }
  
  doc.setFontSize(9);
  doc.text(`Tanggal: ${date}`, 14, subtitle ? 44 : 38);
  
  // Table
  const startY = subtitle ? 48 : 42;
  
  autoTable(doc, {
    startY,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 75, 79],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249],
    },
    margin: { left: 14, right: 14 },
  });
  
  // Footer
  if (footer) {
    const finalY = (doc as any).lastAutoTable?.finalY || startY + 20;
    let y = finalY + 10;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    footer.forEach((line) => {
      doc.text(line, 14, y);
      y += 5;
    });
  }
  
  // Footer page
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(
    `Dicetak pada ${new Date().toLocaleDateString('id-ID')} | Pipanisasi Bahagia`,
    14,
    doc.internal.pageSize.getHeight() - 10
  );
  
  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(`${filename}.pdf`);
}

export function generateLaporanPDF(data: {
  kegiatan: string;
  lokasi: string;
  tanggal: string;
  danaMasuk: { sumber: string; jumlah: number }[];
  danaKeluar: { pengeluaran: string; jumlah: number }[];
  totalMasuk: number;
  totalKeluar: number;
  saldo: number;
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 75, 79);
  doc.text('PIPANISASI BAHAGIA', 105, 20, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Mengalirkan Air, Mengalirkan Pahala', 105, 27, { align: 'center' });
  
  doc.setDrawColor(0, 75, 79);
  doc.setLineWidth(0.8);
  doc.line(14, 32, 196, 32);
  
  // Report title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('LAPORAN PERTANGGUNGJAWABAN', 105, 42, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text(`Donasi ${data.kegiatan}`, 105, 49, { align: 'center' });
  
  // Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Kegiatan: ${data.kegiatan}`, 14, 60);
  doc.text(`Lokasi: ${data.lokasi}`, 14, 66);
  doc.text(`Tanggal: ${data.tanggal}`, 14, 72);
  
  // Dana Masuk
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DANA MASUK', 14, 84);
  
  const masukRows = data.danaMasuk.map((d, i) => [`${i + 1}`, d.sumber, formatRupiah(d.jumlah)]);
  masukRows.push(['', 'TOTAL', formatRupiah(data.totalMasuk)]);
  
  autoTable(doc, {
    startY: 88,
    head: [['No', 'Sumber Dana', 'Jumlah']],
    body: masukRows,
    theme: 'grid',
    headStyles: { fillColor: [0, 75, 79], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  // Dana Keluar
  const afterMasuk = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DANA KELUAR', 14, afterMasuk);
  
  const keluarRows = data.danaKeluar.map((d, i) => [`${i + 1}`, d.pengeluaran, formatRupiah(d.jumlah)]);
  keluarRows.push(['', 'TOTAL', formatRupiah(data.totalKeluar)]);
  
  autoTable(doc, {
    startY: afterMasuk + 4,
    head: [['No', 'Pengeluaran', 'Jumlah']],
    body: keluarRows,
    theme: 'grid',
    headStyles: { fillColor: [0, 75, 79], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  // Saldo
  const afterKeluar = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SALDO', 14, afterKeluar);
  
  doc.setFontSize(10);
  doc.text(`Dana Masuk: ${formatRupiah(data.totalMasuk)}`, 14, afterKeluar + 8);
  doc.text(`Dana Keluar: ${formatRupiah(data.totalKeluar)}`, 14, afterKeluar + 14);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 75, 79);
  doc.text(`Saldo: ${formatRupiah(data.saldo)}`, 14, afterKeluar + 22);
  
  // Ucapan terima kasih
  const afterSaldo = afterKeluar + 34;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100);
  doc.text('Terima kasih atas kepercayaan dan donasi yang diberikan.', 105, afterSaldo, { align: 'center' });
  doc.text('Semoga menjadi amal jariyah yang berkah.', 105, afterSaldo + 6, { align: 'center' });
  
  return doc;
}
