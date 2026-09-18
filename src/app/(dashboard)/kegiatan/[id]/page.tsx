"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  MapPin,
  Calendar,
  FileText,
  Receipt,
  HandCoins,
  Clock,
  Image as ImageIcon,
  FileBarChart,
  Landmark,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah, formatDate } from "@/lib/utils";

interface KegiatanDetail {
  id: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  slug: string;
  jenisKegiatan: string;
  deskripsi: string | null;
  latarBelakang: string | null;
  tujuan: string | null;
  lokasi: string | null;
  alamat: string | null;
  desa: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  provinsi: string | null;
  latitude: number | null;
  longitude: number | null;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  status: string;
  targetDana: number | null;
  danaTerkumpul: number;
  totalPengeluaran: number;
  saldo: number;
  jumlahPenerimaManfaat: number | null;
  jumlahMasjid: number | null;
  jumlahKk: number | null;
  panjangPipa: number | null;
  sumberAir: string | null;
  createdAt: string;
  creator: { id: string; name: string; email: string };
  proposals: {
    id: string;
    judul: string;
    status: string;
    submittedAt: string | null;
    createdAt: string;
  }[];
  rabs: {
    id: string;
    kodeRab: string;
    judul: string;
    total: number;
    status: string;
    rabItems: {
      id: string;
      namaItem: string;
      kategori: string;
      volume: number;
      satuan: string;
      hargaSatuan: number;
      jumlah: number;
      keterangan: string | null;
    }[];
  }[];
  donasis: {
    id: string;
    namaDonatur: string | null;
    nominal: number;
    metode: string;
    status: string;
    tanggal: string;
  }[];
  pengeluarans: {
    id: string;
    deskripsi: string;
    kategori: string;
    nominal: number;
    status: string;
    tanggal: string;
  }[];
  agendas: {
    id: string;
    judul: string;
    tanggal: string;
    status: string;
    keterangan: string | null;
  }[];
  dokumentasis: {
    id: string;
    judul: string;
    kategori: string;
    fileUrl: string;
    createdAt: string;
  }[];
  laporans: {
    id: string;
    judul: string;
    tipe: string;
    status: string;
    createdAt: string;
  }[];
}

const STATUS_OPTIONS: Record<string, { label: string; variant: "success" | "default" | "warning" | "destructive" | "info" | "secondary" }> = {
  DRAFT: { label: "Draft", variant: "warning" },
  PROPOSAL: { label: "Proposal", variant: "info" },
  PENGGALANGAN_DANA: { label: "Penggalangan Dana", variant: "info" },
  PELAKSANAAN: { label: "Pelaksanaan", variant: "success" },
  SELESAI: { label: "Selesai", variant: "default" },
  LAPORAN: { label: "Laporan", variant: "secondary" },
  ARSIP: { label: "Arsip", variant: "destructive" },
};

const TAB_LIST = [
  { key: "ringkasan", label: "Ringkasan", icon: FileText },
  { key: "proposal", label: "Proposal", icon: Landmark },
  { key: "rab", label: "RAB", icon: Receipt },
  { key: "donasi", label: "Dana Masuk", icon: HandCoins },
  { key: "pengeluaran", label: "Pengeluaran", icon: CreditCard },
  { key: "agenda", label: "Agenda", icon: Clock },
  { key: "dokumentasi", label: "Dokumentasi", icon: ImageIcon },
  { key: "laporan", label: "Laporan", icon: FileBarChart },
];

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0" />
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function KegiatanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<KegiatanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ringkasan");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kegiatan/${id}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast.error(json.message || "Kegiatan tidak ditemukan");
        router.push("/kegiatan");
      }
    } catch {
      toast.error("Gagal memuat data kegiatan");
      router.push("/kegiatan");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data) return <DetailSkeleton />;

  const statusInfo = STATUS_OPTIONS[data.status] || {
    label: data.status,
    variant: "default" as const,
  };
  const progress =
    data.targetDana && Number(data.targetDana) > 0
      ? Math.round((Number(data.danaTerkumpul) / Number(data.targetDana)) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          onClick={() => router.push("/kegiatan")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-foreground truncate">
              {data.namaKegiatan}
            </h1>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {data.lokasi && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {data.lokasi}
              </span>
            )}
            {data.tanggalMulai && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(data.tanggalMulai)}
                {data.tanggalSelesai &&
                  ` - ${formatDate(data.tanggalSelesai)}`}
              </span>
            )}
            <span className="font-mono text-xs">{data.kodeKegiatan}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <HandCoins className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dana Terkumpul</p>
                <p className="text-lg font-bold text-foreground">
                  {formatRupiah(Number(data.danaTerkumpul))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <CreditCard className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dana Digunakan</p>
                <p className="text-lg font-bold text-foreground">
                  {formatRupiah(Number(data.totalPengeluaran))}
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
                <p className="text-xs text-muted-foreground">Saldo</p>
                <p className="text-lg font-bold text-foreground">
                  {formatRupiah(Number(data.saldo))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-lg font-bold text-foreground">{progress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Penerima Manfaat
                </p>
                <p className="text-lg font-bold text-foreground">
                  {(data.jumlahPenerimaManfaat || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Receipt className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Target Dana</p>
                <p className="text-lg font-bold text-foreground">
                  {data.targetDana
                    ? formatRupiah(Number(data.targetDana))
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 border-b">
        {TAB_LIST.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "ringkasan" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deskripsi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {data.deskripsi || "Tidak ada deskripsi"}
              </p>
            </CardContent>
          </Card>
          {data.latarBelakang && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Latar Belakang</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {data.latarBelakang}
                </p>
              </CardContent>
            </Card>
          )}
          {data.tujuan && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tujuan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {data.tujuan}
                </p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detail Informasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Lokasi:</span>
                  <span className="font-medium">{data.lokasi || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Mulai:</span>
                  <span className="font-medium">
                    {data.tanggalMulai ? formatDate(data.tanggalMulai) : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Alamat:</span>{" "}
                  <span className="font-medium">{data.alamat || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Desa:</span>{" "}
                  <span className="font-medium">{data.desa || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Kecamatan:</span>{" "}
                  <span className="font-medium">{data.kecamatan || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Kabupaten:</span>{" "}
                  <span className="font-medium">{data.kabupaten || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Provinsi:</span>{" "}
                  <span className="font-medium">{data.provinsi || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Jenis:</span>{" "}
                  <span className="font-medium">{data.jenisKegiatan}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sumber Air:</span>{" "}
                  <span className="font-medium">{data.sumberAir || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Panjang Pipa:
                  </span>{" "}
                  <span className="font-medium">
                    {data.panjangPipa
                      ? `${Number(data.panjangPipa)} meter`
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Jumlah Masjid:</span>{" "}
                  <span className="font-medium">
                    {data.jumlahMasjid || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Jumlah KK:</span>{" "}
                  <span className="font-medium">
                    {data.jumlahKk || "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "proposal" && (
        <Card>
          <CardContent className="p-0">
            {data.proposals.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Belum ada proposal
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Diajukan
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Dibuat
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.proposals.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.judul}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === "APPROVED"
                              ? "success"
                              : p.status === "REJECTED"
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {p.submittedAt ? formatDate(p.submittedAt) : "-"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDate(p.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "rab" && (
        <div className="space-y-4">
          {data.rabs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Belum ada RAB
              </CardContent>
            </Card>
          ) : (
            data.rabs.map((rab) => (
              <Card key={rab.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {rab.judul}
                      <span className="ml-2 text-xs text-muted-foreground font-mono">
                        {rab.kodeRab}
                      </span>
                    </CardTitle>
                    <Badge
                      variant={
                        rab.status === "APPROVED"
                          ? "success"
                          : rab.status === "REVISION"
                            ? "warning"
                            : "default"
                      }
                    >
                      {rab.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Item</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Kategori
                        </TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                        <TableHead className="text-right">
                          Harga Satuan
                        </TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rab.rabItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.namaItem}</p>
                              {item.keterangan && (
                                <p className="text-xs text-muted-foreground">
                                  {item.keterangan}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {item.kategori}
                          </TableCell>
                          <TableCell className="text-right">
                            {Number(item.volume)} {item.satuan}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatRupiah(Number(item.hargaSatuan))}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatRupiah(Number(item.jumlah))}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-right font-semibold"
                        >
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatRupiah(Number(rab.total))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "donasi" && (
        <Card>
          <CardContent className="p-0">
            {data.donasis.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Belum ada dana masuk
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donatur</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Metode
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Tanggal
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.donasis.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">
                        {d.namaDonatur || "Anonim"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(Number(d.nominal))}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {d.metode}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={
                            d.status === "VERIFIED"
                              ? "success"
                              : d.status === "REJECTED"
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDate(d.tanggal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "pengeluaran" && (
        <Card>
          <CardContent className="p-0">
            {data.pengeluarans.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Belum ada pengeluaran
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Kategori
                    </TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Tanggal
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.pengeluarans.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.deskripsi}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {p.kategori}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(Number(p.nominal))}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={
                            p.status === "VERIFIED"
                              ? "success"
                              : p.status === "REJECTED"
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDate(p.tanggal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "agenda" && (
        <Card>
          <CardContent className="p-0">
            {data.agendas.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Belum ada agenda
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell hidden sm:table-cell">
                      Keterangan
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.agendas.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.judul}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(a.tanggal)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            a.status === "COMPLETED"
                              ? "success"
                              : a.status === "ONGOING"
                                ? "info"
                                : a.status === "CANCELLED"
                                  ? "destructive"
                                  : "default"
                          }
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {a.keterangan || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "dokumentasi" && (
        <Card>
          <CardContent>
            {data.dokumentasis.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Belum ada dokumentasi
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.dokumentasis.map((d) => (
                  <div
                    key={d.id}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
                  >
                    {d.kategori === "VIDEO" ? (
                      <div className="flex items-center justify-center h-full">
                        <FileBarChart className="h-10 w-10 text-muted-foreground" />
                      </div>
                    ) : (
                      <img
                        src={d.fileUrl}
                        alt={d.judul}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs text-white font-medium line-clamp-1">
                        {d.judul}
                      </p>
                      <p className="text-xs text-white/70">{d.kategori}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "laporan" && (
        <Card>
          <CardContent className="p-0">
            {data.laporans.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Belum ada laporan
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead className="hidden sm:table-cell">Tipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Dibuat
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.laporans.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.judul}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {l.tipe}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            l.status === "PUBLISHED"
                              ? "success"
                              : "warning"
                          }
                        >
                          {l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDate(l.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
