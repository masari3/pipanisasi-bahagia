"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

interface PengeluaranItem {
  id: string;
  kegiatanId: string;
  tanggal: string;
  nomorTransaksi: string;
  kategori: string;
  deskripsi: string | null;
  nominal: number;
  vendor: string | null;
  status: string;
  keterangan: string | null;
  buktiUrl: string | null;
  kegiatan: {
    id: string;
    namaKegiatan: string;
    kodeKegiatan: string;
  };
}

interface Kegiatan {
  id: string;
  namaKegiatan: string;
  kodeKegiatan: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const kategoriOptions = [
  { value: "", label: "Semua Kategori" },
  { value: "MATERIAL", label: "Material" },
  { value: "TRANSPORTASI", label: "Transportasi" },
  { value: "KONSUMSI", label: "Konsumsi" },
  { value: "TENAGA", label: "Tenaga" },
  { value: "OPERASIONAL", label: "Operasional" },
  { value: "LAINNYA", label: "Lainnya" },
];

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu" },
  { value: "VERIFIED", label: "Terverifikasi" },
  { value: "REJECTED", label: "Ditolak" },
];

function statusBadge(status: string) {
  const map: Record<string, "warning" | "success" | "destructive"> = {
    PENDING: "warning",
    VERIFIED: "success",
    REJECTED: "destructive",
  };
  return map[status] || "default" as const;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: "Menunggu",
    VERIFIED: "Terverifikasi",
    REJECTED: "Ditolak",
  };
  return map[status] || status;
}

function kategoriLabel(kategori: string) {
  const map: Record<string, string> = {
    MATERIAL: "Material",
    TRANSPORTASI: "Transportasi",
    KONSUMSI: "Konsumsi",
    TENAGA: "Tenaga",
    OPERASIONAL: "Operasional",
    LAINNYA: "Lainnya",
  };
  return map[kategori] || kategori;
}

export default function PengeluaranPage() {
  const router = useRouter();
  const [data, setData] = useState<PengeluaranItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [filterKegiatan, setFilterKegiatan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterTanggalMulai, setFilterTanggalMulai] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchKegiatanList();
  }, []);

  useEffect(() => {
    fetchPengeluaran(1);
  }, [debouncedSearch, filterKegiatan, filterStatus, filterKategori, filterTanggalMulai, filterTanggalAkhir]);

  const fetchKegiatanList = async () => {
    try {
      const res = await fetch("/api/kegiatan?limit=100");
      const json = await res.json();
      if (json.success) {
        setKegiatanList(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch kegiatan:", error);
    }
  };

  const fetchPengeluaran = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filterKegiatan) params.set("kegiatanId", filterKegiatan);
      if (filterStatus) params.set("status", filterStatus);
      if (filterKategori) params.set("kategori", filterKategori);
      if (filterTanggalMulai) params.set("tanggalMulai", filterTanggalMulai);
      if (filterTanggalAkhir) params.set("tanggalAkhir", filterTanggalAkhir);

      const res = await fetch(`/api/pengeluaran?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch pengeluaran:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterKegiatan, filterStatus, filterKategori, filterTanggalMulai, filterTanggalAkhir]);

  const handleVerify = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/pengeluaran/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VERIFIED" }),
      });
      const json = await res.json();
      if (json.success) {
        fetchPengeluaran(pagination.page);
      }
    } catch (error) {
      console.error("Failed to verify pengeluaran:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Tolak pengeluaran ini?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/pengeluaran/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      const json = await res.json();
      if (json.success) {
        fetchPengeluaran(pagination.page);
      }
    } catch (error) {
      console.error("Failed to reject pengeluaran:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const totalVerified = data
    .filter((d) => d.status === "VERIFIED")
    .reduce((sum, d) => sum + Number(d.nominal), 0);

  const activeFilters = [
    filterKegiatan,
    filterStatus,
    filterKategori,
    filterTanggalMulai,
    filterTanggalAkhir,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterKegiatan("");
    setFilterStatus("");
    setFilterKategori("");
    setFilterTanggalMulai("");
    setFilterTanggalAkhir("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengeluaran</h1>
          <p className="text-muted-foreground">Kelola data pengeluaran</p>
        </div>
        <Button onClick={() => router.push("/pengeluaran/new")}>
          <Plus className="h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Receipt className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Terverifikasi</p>
                <p className="text-lg font-bold text-foreground">{formatRupiah(totalVerified)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Receipt className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Data</p>
                <p className="text-lg font-bold text-foreground">{pagination.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Menunggu Verifikasi</p>
                <p className="text-lg font-bold text-foreground">
                  {data.filter((d) => d.status === "PENDING").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari vendor atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0"
        >
          <Filter className="h-4 w-4" />
          Filter
          {activeFilters > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFilters}
            </Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Filter Lanjutan</p>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-3 w-3" />
                  Hapus Filter
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select
                label="Kegiatan"
                options={[
                  { value: "", label: "Semua Kegiatan" },
                  ...kegiatanList.map((k) => ({ value: k.id, label: k.namaKegiatan })),
                ]}
                value={filterKegiatan}
                onChange={(e) => setFilterKegiatan(e.target.value)}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />
              <Select
                label="Kategori"
                options={kategoriOptions}
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
              />
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Tanggal Mulai
                </label>
                <Input
                  type="date"
                  value={filterTanggalMulai}
                  onChange={(e) => setFilterTanggalMulai(e.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Tanggal Akhir
                </label>
                <Input
                  type="date"
                  value={filterTanggalAkhir}
                  onChange={(e) => setFilterTanggalAkhir(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mb-4 opacity-50" />
              <p>Belum ada data pengeluaran</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">Tanggal</TableHead>
                    <TableHead className="hidden md:table-cell">No. Transaksi</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="hidden lg:table-cell">Deskripsi</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead className="hidden md:table-cell">Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm">{formatDate(item.tanggal)}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm font-mono">{item.nomorTransaksi}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="secondary">{kategoriLabel(item.kategori)}</Badge>
                          <p className="text-xs text-muted-foreground sm:hidden mt-1">
                            {formatDate(item.tanggal)}
                          </p>
                          <p className="text-xs text-muted-foreground md:hidden mt-1">
                            {item.nomorTransaksi}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">{item.deskripsi || "-"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{formatRupiah(Number(item.nominal))}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm">{item.vendor || "-"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge(item.status)}>
                          {statusLabel(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Lihat">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {item.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Verifikasi"
                                onClick={() => handleVerify(item.id)}
                                disabled={actionLoading === item.id}
                              >
                                {actionLoading === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Tolak"
                                onClick={() => handleReject(item.id)}
                                disabled={actionLoading === item.id}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} data)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchPengeluaran(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchPengeluaran(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
