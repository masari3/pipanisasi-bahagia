"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Archive,
  MapPin,
  Calendar,
  Wallet,
  TrendingDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatRupiah, formatDate } from "@/lib/utils";

interface KegiatanArsip {
  id: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  slug: string;
  lokasi: string;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  targetDana: number | null;
  danaTerkumpul: number;
  totalPengeluaran: number;
  status: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "SELESAI", label: "Selesai" },
  { value: "ARSIP", label: "Arsip" },
];

export default function ArsipPage() {
  const [data, setData] = useState<KegiatanArsip[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ARSIP");
  const [yearFilter, setYearFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchArsip = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        status: statusFilter || "ARSIP",
      });

      const res = await fetch(`/api/kegiatan?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        let filtered = json.data;
        if (yearFilter) {
          filtered = filtered.filter((k: any) => {
            const date = k.tanggalMulai || k.createdAt;
            return new Date(date).getFullYear().toString() === yearFilter;
          });
        }
        setData(filtered);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch arsip:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArsip(1);
  }, [statusFilter, yearFilter]);

  const filteredData = data.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.namaKegiatan.toLowerCase().includes(q) ||
      item.kodeKegiatan.toLowerCase().includes(q) ||
      item.lokasi.toLowerCase().includes(q)
    );
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Arsip Kegiatan</h1>
        <p className="text-muted-foreground">Daftar kegiatan yang sudah selesai atau diarsipkan</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kegiatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="">Semua Tahun</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Archive className="h-12 w-12 mb-4 opacity-50" />
            <p>Belum ada kegiatan diarsipkan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredData.map((kegiatan) => (
            <Card key={kegiatan.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{kegiatan.kodeKegiatan}</Badge>
                      <Badge variant={kegiatan.status === "ARSIP" ? "info" : "success"}>
                        {kegiatan.status === "ARSIP" ? "Diarsipkan" : "Selesai"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg">{kegiatan.namaKegiatan}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {kegiatan.lokasi}
                      </div>
                      {kegiatan.tanggalMulai && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(kegiatan.tanggalMulai)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Donasi</p>
                      <p className="font-semibold text-emerald-600">
                        {formatRupiah(kegiatan.danaTerkumpul)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Pengeluaran</p>
                      <p className="font-semibold text-red-600">
                        {formatRupiah(kegiatan.totalPengeluaran)}
                      </p>
                    </div>
                    <Link href={`/kegiatan/${kegiatan.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                        Lihat
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {pagination.page} dari {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchArsip(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchArsip(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
