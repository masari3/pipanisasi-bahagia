"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Droplets,
  MapPin,
  Calendar,
  Search,
  Loader2,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatRupiah, formatDate } from "@/lib/utils";

interface Kegiatan {
  id: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  slug: string;
  jenisKegiatan: string;
  deskripsi: string | null;
  lokasi: string;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  status: string;
  targetDana: number | null;
  danaTerkumpul: number;
  jumlahPenerimaManfaat: number | null;
  _count: { donasis: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "AKTIF", label: "Aktif" },
  { value: "SELESAI", label: "Selesai" },
];

export default function PublicKegiatanPage() {
  const [data, setData] = useState<Kegiatan[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchKegiatan = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/public/kegiatan?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch kegiatan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKegiatan(1);
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchKegiatan(1), 500);
    return () => clearTimeout(timer);
  }, [search]);

  function statusBadge(status: string) {
    const map: Record<string, "success" | "default" | "warning" | "destructive"> = {
      AKTIF: "success",
      SELESAI: "default",
      DRAFT: "warning",
    };
    return map[status] || "default";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#0d4b4f] to-[#1a7a80] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Kegiatan</h1>
          <p className="text-white/80 max-w-2xl">
            Lihat semua kegiatan pipanisasi yang sedang berlangsung dan telah selesai
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kegiatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white shadow"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Droplets className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada kegiatan ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((kegiatan) => {
              const progress = kegiatan.targetDana
                ? Math.round((kegiatan.danaTerkumpul / kegiatan.targetDana) * 100)
                : 0;
              return (
                <Link key={kegiatan.id} href={`/kegiatan/${kegiatan.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="h-44 bg-gradient-to-br from-[#0d4b4f] to-[#1a7a80] rounded-t-xl flex items-center justify-center relative">
                      <Droplets className="h-14 w-14 text-white/20 group-hover:text-white/40 transition-colors" />
                      <div className="absolute top-3 left-3">
                        <Badge variant={statusBadge(kegiatan.status)}>
                          {kegiatan.status}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                          {kegiatan.jenisKegiatan}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {kegiatan.namaKegiatan}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{kegiatan.lokasi}</span>
                      </div>
                      {kegiatan.tanggalMulai && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {formatDate(kegiatan.tanggalMulai)}
                        </div>
                      )}
                      {kegiatan.targetDana && (
                        <div className="space-y-2">
                          <Progress value={progress} color={progress >= 100 ? "success" : "primary"} />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatRupiah(kegiatan.danaTerkumpul)}</span>
                            <span>{formatRupiah(kegiatan.targetDana)}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchKegiatan(pagination.page - 1)}
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchKegiatan(pagination.page + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
