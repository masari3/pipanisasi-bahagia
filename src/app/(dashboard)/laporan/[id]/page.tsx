"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Download,
  Droplets,
  Loader2,
  Calendar,
  MapPin,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah, formatDate } from "@/lib/utils";

interface KegiatanOption {
  id: string;
  namaKegiatan: string;
  kodeKegiatan: string;
}

interface LaporanDetail {
  id: string;
  judul: string;
  isi: string | null;
  tipeLaporan: string;
  fileUrl: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  kegiatan: {
    id: string;
    namaKegiatan: string;
    kodeKegiatan: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

interface KeuanganData {
  kegiatan: {
    id: string;
    kodeKegiatan: string;
    namaKegiatan: string;
    targetDana: number;
    danaTerkumpul: number;
    totalPengeluaran: number;
    saldo: number;
  };
  ringkasan: {
    totalDanaMasuk: number;
    totalDanaKeluar: number;
    saldo: number;
    jumlahDonasi: number;
    jumlahPengeluaran: number;
  };
  danaMasukPerSumber: {
    sumber: string;
    total: number;
    jumlah: number;
  }[];
  pengeluaranPerKategori: {
    kategori: string;
    total: number;
    jumlah: number;
  }[];
}

export default function LaporanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [laporan, setLaporan] = useState<LaporanDetail | null>(null);
  const [keuangan, setKeuangan] = useState<KeuanganData | null>(null);
  const [kegiatanList, setKegiatanList] = useState<KegiatanOption[]>([]);
  const [selectedKegiatanId, setSelectedKegiatanId] = useState("");
  const [loading, setLoading] = useState(true);
  const [keuanganLoading, setKeuanganLoading] = useState(false);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const res = await fetch(`/api/laporan/${id}`);
        const json = await res.json();
        if (json.success) {
          setLaporan(json.data);
          setSelectedKegiatanId(json.data.kegiatan.id);
        }
      } catch (error) {
        console.error("Failed to fetch laporan:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchKegiatanList = async () => {
      try {
        const res = await fetch("/api/kegiatan?limit=100");
        const json = await res.json();
        if (json.success) {
          setKegiatanList(
            json.data.map((k: any) => ({
              id: k.id,
              namaKegiatan: k.namaKegiatan,
              kodeKegiatan: k.kodeKegiatan,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch kegiatan list:", error);
      }
    };

    fetchLaporan();
    fetchKegiatanList();
  }, [id]);

  useEffect(() => {
    if (!selectedKegiatanId) return;

    const fetchKeuangan = async () => {
      setKeuanganLoading(true);
      try {
        const res = await fetch(`/api/laporan/keuangan/${selectedKegiatanId}`);
        const json = await res.json();
        if (json.success) {
          setKeuangan(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch keuangan:", error);
      } finally {
        setKeuanganLoading(false);
      }
    };

    fetchKeuangan();
  }, [selectedKegiatanId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("PIPANISASI BAHAGIA", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(laporan?.judul || "Laporan", 105, 30, { align: "center" });

      let y = 45;

      if (keuangan) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Ringkasan Keuangan", 14, y);
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.text(`Total Dana Masuk: ${formatRupiah(keuangan.ringkasan.totalDanaMasuk)}`, 14, y);
        y += 6;
        doc.text(`Total Dana Keluar: ${formatRupiah(keuangan.ringkasan.totalDanaKeluar)}`, 14, y);
        y += 6;
        doc.text(`Saldo: ${formatRupiah(keuangan.ringkasan.saldo)}`, 14, y);
        y += 12;

        if (keuangan.danaMasukPerSumber.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.text("Dana Masuk", 14, y);
          y += 4;
          autoTable(doc, {
            startY: y,
            head: [["No", "Sumber", "Jumlah", "Total"]],
            body: keuangan.danaMasukPerSumber.map((item, i) => [
              String(i + 1),
              item.sumber,
              String(item.jumlah),
              formatRupiah(item.total),
            ]),
          });
          y = (doc as any).lastAutoTable.finalY + 10;
        }

        if (keuangan.pengeluaranPerKategori.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.text("Dana Keluar", 14, y);
          y += 4;
          autoTable(doc, {
            startY: y,
            head: [["No", "Pengeluaran", "Jumlah", "Total"]],
            body: keuangan.pengeluaranPerKategori.map((item, i) => [
              String(i + 1),
              item.kategori,
              String(item.jumlah),
              formatRupiah(item.total),
            ]),
          });
        }
      }

      doc.save(`${laporan?.judul || "laporan"}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Laporan tidak ditemukan
      </div>
    );
  }

  return (
    <div className="space-y-6 no-print">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/laporan">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{laporan.judul}</h1>
            <p className="text-muted-foreground">
              {laporan.kegiatan.namaKegiatan} &middot; {laporan.kegiatan.kodeKegiatan}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Cetak
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="no-print">
        <Select
          label="Pilih Kegiatan"
          options={kegiatanList.map((k) => ({
            value: k.id,
            label: `${k.namaKegiatan} (${k.kodeKegiatan})`,
          }))}
          value={selectedKegiatanId}
          onChange={(e) => setSelectedKegiatanId(e.target.value)}
        />
      </div>

      <div ref={printRef} className="space-y-6">
        <Card className="border-2 border-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center">
                <Droplets className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary">PIPANISASI BAHAGIA</h2>
                <p className="text-sm text-muted-foreground">
                  Yayasan Pipanisasi Bahagia
                </p>
              </div>
            </div>
            <div className="text-center border-t pt-4">
              <h3 className="text-lg font-semibold">{laporan.judul}</h3>
              <p className="text-sm text-muted-foreground">
                {laporan.kegiatan.namaKegiatan} &middot; {formatDate(laporan.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        {keuanganLoading ? (
          <Card>
            <CardContent className="p-6 flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : keuangan ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Dana Masuk</p>
                      <p className="text-lg font-bold text-foreground">
                        {formatRupiah(keuangan.ringkasan.totalDanaMasuk)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Dana Keluar</p>
                      <p className="text-lg font-bold text-foreground">
                        {formatRupiah(keuangan.ringkasan.totalDanaKeluar)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-100">
                      <Wallet className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Saldo Akhir</p>
                      <p className="text-lg font-bold text-foreground">
                        {formatRupiah(keuangan.ringkasan.saldo)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Jumlah Donasi</p>
                      <p className="text-lg font-bold text-foreground">
                        {keuangan.ringkasan.jumlahDonasi}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Section 1: Proposal Pipanisasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Kode Kegiatan</p>
                      <p className="font-medium">{keuangan.kegiatan.kodeKegiatan}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Nama Kegiatan</p>
                      <p className="font-medium">{keuangan.kegiatan.namaKegiatan}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target Dana</p>
                      <p className="font-medium">{formatRupiah(keuangan.kegiatan.targetDana)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dana Terkumpul</p>
                      <p className="font-medium">{formatRupiah(keuangan.kegiatan.danaTerkumpul)}</p>
                    </div>
                  </div>
                  {laporan.isi && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-2">Isi Proposal</p>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                        {laporan.isi}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Section 2: Laporan Keuangan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    Dana Masuk
                  </h4>
                  {keuangan.danaMasukPerSumber.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada data dana masuk</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">No</TableHead>
                          <TableHead>Sumber Dana</TableHead>
                          <TableHead className="text-center">Jumlah Transaksi</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {keuangan.danaMasukPerSumber.map((item, index) => (
                          <TableRow key={item.sumber}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{item.sumber}</TableCell>
                            <TableCell className="text-center">{item.jumlah}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatRupiah(item.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold">
                          <TableCell colSpan={2}>Total</TableCell>
                          <TableCell className="text-center">
                            {keuangan.danaMasukPerSumber.reduce((a, b) => a + b.jumlah, 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatRupiah(keuangan.ringkasan.totalDanaMasuk)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Dana Keluar
                  </h4>
                  {keuangan.pengeluaranPerKategori.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada data dana keluar</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">No</TableHead>
                          <TableHead>Pengeluaran</TableHead>
                          <TableHead className="text-center">Jumlah Transaksi</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {keuangan.pengeluaranPerKategori.map((item, index) => (
                          <TableRow key={item.kategori}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{item.kategori}</TableCell>
                            <TableCell className="text-center">{item.jumlah}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatRupiah(item.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold">
                          <TableCell colSpan={2}>Total</TableCell>
                          <TableCell className="text-center">
                            {keuangan.pengeluaranPerKategori.reduce((a, b) => a + b.jumlah, 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatRupiah(keuangan.ringkasan.totalDanaKeluar)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Saldo (Dana Masuk - Dana Keluar)</span>
                    <span className={keuangan.ringkasan.saldo >= 0 ? "text-emerald-600" : "text-red-600"}>
                      {formatRupiah(keuangan.ringkasan.saldo)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground italic">
                  Terima kasih atas kepercayaan dan dukungan Anda dalam program pipanisasi ini.
                  Semoga kebaikan yang diberikan menjadi berkah bagi kita semua.
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center py-12 text-muted-foreground">
              Pilih kegiatan untuk melihat data keuangan
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
