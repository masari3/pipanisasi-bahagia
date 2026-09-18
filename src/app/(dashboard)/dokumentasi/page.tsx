"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Image as ImageIcon,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface DokumentasiItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  tanggal: string;
  kategori: string;
  caption: string | null;
  kegiatan: { id: string; namaKegiatan: string; kodeKegiatan: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const kategoriMap: Record<
  string,
  { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" | "secondary" }
> = {
  SURVEY: { label: "Survey", variant: "info" },
  PELAKSANAAN: { label: "Pelaksanaan", variant: "warning" },
  MATERIAL: { label: "Material", variant: "secondary" },
  PENYALURAN: { label: "Penyaluran", variant: "success" },
  SELESAI: { label: "Selesai", variant: "default" },
};

export default function DokumentasiPage() {
  const [items, setItems] = useState<DokumentasiItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [lightboxItem, setLightboxItem] = useState<DokumentasiItem | null>(null);

  const fetchDokumentasi = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "12");
      if (kategoriFilter) params.set("kategori", kategoriFilter);

      const res = await fetch(`/api/dokumentasi?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setItems(json.data);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch dokumentasi:", error);
    } finally {
      setLoading(false);
    }
  }, [kategoriFilter]);

  useEffect(() => {
    fetchDokumentasi(1);
  }, [fetchDokumentasi]);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus dokumentasi ini?")) return;
    try {
      const res = await fetch(`/api/dokumentasi/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast.success("Dokumentasi berhasil dihapus");
        if (lightboxItem?.id === id) setLightboxItem(null);
      }
    } catch {
      toast.error("Gagal menghapus dokumentasi");
    }
  };

  const filteredItems = items.filter((item) =>
    search ? item.judul.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dokumentasi</h1>
          <p className="text-muted-foreground">Galeri dokumentasi kegiatan</p>
        </div>
        <Link href="/dokumentasi/upload">
          <Button>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari dokumentasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              options={[
                { value: "", label: "Semua Kategori" },
                { value: "SURVEY", label: "Survey" },
                { value: "PELAKSANAAN", label: "Pelaksanaan" },
                { value: "MATERIAL", label: "Material" },
                { value: "PENYALURAN", label: "Penyaluran" },
                { value: "SELESAI", label: "Selesai" },
              ]}
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              placeholder="Filter Kategori"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Tidak ada dokumentasi ditemukan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const kategori = kategoriMap[item.kategori] || {
              label: item.kategori,
              variant: "default" as const,
            };

            return (
              <Card
                key={item.id}
                className="group overflow-hidden transition-shadow hover:shadow-md"
              >
                <div
                  className="relative aspect-video cursor-pointer overflow-hidden bg-muted"
                  onClick={() => setLightboxItem(item)}
                >
                  {item.fileUrl ? (
                    <img
                      src={item.thumbnailUrl || item.fileUrl}
                      alt={item.judul}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant={kategori.variant}>{kategori.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.tanggal)}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground line-clamp-2">{item.judul}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.kegiatan.namaKegiatan}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
            {pagination.total} dokumentasi
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchDokumentasi(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {pagination.page} / {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchDokumentasi(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!lightboxItem} onOpenChange={(open) => !open && setLightboxItem(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{lightboxItem?.judul}</DialogTitle>
          </DialogHeader>
          {lightboxItem && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg bg-muted">
                {lightboxItem.fileUrl ? (
                  <img
                    src={lightboxItem.fileUrl}
                    alt={lightboxItem.judul}
                    className="max-h-[60vh] w-full object-contain"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant={kategoriMap[lightboxItem.kategori]?.variant || "default"}>
                    {kategoriMap[lightboxItem.kategori]?.label || lightboxItem.kategori}
                  </Badge>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {lightboxItem.kegiatan.namaKegiatan} &middot; {formatDate(lightboxItem.tanggal)}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDelete(lightboxItem.id);
                    setLightboxItem(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
              </div>
              {lightboxItem.caption && (
                <p className="text-sm text-muted-foreground">{lightboxItem.caption}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


