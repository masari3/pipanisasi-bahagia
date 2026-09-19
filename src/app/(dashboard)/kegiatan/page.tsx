"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatRupiah, formatDate } from "@/lib/utils";
import { ITEMS_PER_PAGE } from "@/lib/constants";

interface Kegiatan {
  id: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  slug: string;
  lokasi: string;
  status: string;
  targetDana: number | null;
  danaTerkumpul: number;
  totalPengeluaran: number;
  saldo: number;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "PENGGALANGAN_DANA", label: "Penggalangan Dana" },
  { value: "PELAKSANAAN", label: "Pelaksanaan" },
  { value: "SELESAI", label: "Selesai" },
  { value: "LAPORAN", label: "Laporan" },
  { value: "ARSIP", label: "Arsip" },
];

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Terbaru" },
  { value: "createdAt:asc", label: "Terlama" },
  { value: "namaKegiatan:asc", label: "Nama A-Z" },
  { value: "namaKegiatan:desc", label: "Nama Z-A" },
];

function statusBadgeVariant(
  status: string
): "success" | "default" | "warning" | "destructive" | "info" | "secondary" {
  const map: Record<string, "success" | "default" | "warning" | "destructive" | "info" | "secondary"> = {
    DRAFT: "warning",
    PROPOSAL: "info",
    PENGGALANGAN_DANA: "info",
    PELAKSANAAN: "success",
    SELESAI: "default",
    LAPORAN: "secondary",
    ARSIP: "destructive",
  };
  return map[status] || "default";
}

function formatStatusName(status: string): string {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-9 w-full sm:w-64" />
        <Skeleton className="h-9 w-full sm:w-40" />
        <Skeleton className="h-9 w-full sm:w-40" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Kegiatan</TableHead>
                <TableHead className="hidden md:table-cell">Lokasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Target Dana</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Dana Terkumpul</TableHead>
                <TableHead className="hidden xl:table-cell">Progress</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden xl:table-cell"><Skeleton className="h-2 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FolderOpen className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Belum ada kegiatan
        </h3>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          Mulai dengan menambahkan kegiatan pipanisasi baru untuk mengelola dana
          dan pelaksanaan.
        </p>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kegiatan
        </Button>
      </CardContent>
    </Card>
  );
}

export default function KegiatanPage() {
  const router = useRouter();
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({ open: false, id: "", name: "" });
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = sortBy.split(":");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        search,
        status: statusFilter,
        sortBy: sortField,
        sortOrder,
      });
      const res = await fetch(`/api/kegiatan?${params}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotal(json.pagination.total);
      } else {
        toast.error(json.message || "Gagal memuat data");
      }
    } catch {
      toast.error("Gagal memuat data kegiatan");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/kegiatan/${deleteDialog.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Kegiatan berhasil diarsipkan");
        setDeleteDialog({ open: false, id: "", name: "" });
        fetchData();
      } else {
        toast.error(json.message || "Gagal mengarsipkan kegiatan");
      }
    } catch {
      toast.error("Gagal mengarsipkan kegiatan");
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (loading && data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Kegiatan Pipanisasi
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola seluruh kegiatan pipanisasi
            </p>
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Kegiatan Pipanisasi
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} kegiatan ditemukan
          </p>
        </div>
        <Button onClick={() => router.push("/kegiatan/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kegiatan
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau kode kegiatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
        <Select
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        />
      </div>

      {data.length === 0 && !loading ? (
        <EmptyState onAdd={() => router.push("/kegiatan/new")} />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Kegiatan</TableHead>
                    <TableHead className="hidden md:table-cell">Lokasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Target Dana</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Dana Terkumpul</TableHead>
                    <TableHead className="hidden xl:table-cell">Progress</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => {
                    const progress =
                      item.targetDana && item.targetDana > 0
                        ? Math.round(
                            (Number(item.danaTerkumpul) /
                              Number(item.targetDana)) *
                              100
                          )
                        : 0;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.kodeKegiatan}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">
                              {item.namaKegiatan}
                            </p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {item.lokasi || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {item.lokasi || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(item.status)}>
                            {formatStatusName(item.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-right">
                          <span className="text-sm">
                            {item.targetDana
                              ? formatRupiah(Number(item.targetDana))
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-right">
                          <span className="text-sm font-medium">
                            {formatRupiah(Number(item.danaTerkumpul))}
                          </span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="w-24">
                            <Progress
                              value={progress}
                              max={100}
                              color={
                                progress >= 100
                                  ? "success"
                                  : progress >= 50
                                    ? "info"
                                    : "warning"
                              }
                            />
                            <span className="text-xs text-muted-foreground">
                              {progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                router.push(`/kegiatan/${item.id}`)
                              }
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                router.push(`/kegiatan/${item.id}/edit`)
                              }
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  id: item.id,
                                  name: item.namaKegiatan,
                                })
                              }
                              title="Arsipkan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Selanjutnya
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, id: "", name: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arsipkan Kegiatan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengarsipkan kegiatan{" "}
              <strong>{deleteDialog.name}</strong>? Kegiatan yang diarsipkan
              tidak akan ditampilkan di daftar utama.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, id: "", name: "" })
              }
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Mengarsipkan..." : "Arsipkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
