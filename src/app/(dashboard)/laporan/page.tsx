"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Eye,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah, formatDate } from "@/lib/utils";

interface Laporan {
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const TIPE_LAPORAN = [
  { value: "", label: "Semua" },
  { value: "KEUANGAN", label: "Laporan Keuangan" },
  { value: "KEGIATAN", label: "Laporan Kegiatan" },
  { value: "PERTANGGUNGJAWABAN", label: "Laporan Pertanggungjawaban" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Dipublikasikan" },
];

function tipeBadge(tipe: string) {
  const map: Record<string, "default" | "success" | "info" | "warning"> = {
    KEUANGAN: "success",
    KEGIATAN: "info",
    PERTANGGUNGJAWABAN: "warning",
  };
  return map[tipe] || "default";
}

function statusBadge(status: string) {
  const map: Record<string, "success" | "default" | "warning"> = {
    PUBLISHED: "success",
    DRAFT: "warning",
  };
  return map[status] || "default";
}

export default function LaporanPage() {
  const [data, setData] = useState<Laporan[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchLaporan = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (activeTab) params.set("tipeLaporan", activeTab);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/laporan?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan(1);
  }, [activeTab, statusFilter]);

  const filteredData = data.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.judul.toLowerCase().includes(q) ||
      item.kegiatan.namaKegiatan.toLowerCase().includes(q) ||
      item.kegiatan.kodeKegiatan.toLowerCase().includes(q)
    );
  });

  const tabs = [
    { value: "", label: "Semua" },
    { value: "KEUANGAN", label: "Laporan Keuangan" },
    { value: "KEGIATAN", label: "Laporan Kegiatan" },
    { value: "PERTANGGUNGJAWABAN", label: "Laporan Pertanggungjawaban" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laporan</h1>
          <p className="text-muted-foreground">
            Kelola laporan kegiatan dan keuangan
          </p>
        </div>
        <Link href="/laporan/buat">
          <Button>
            <Plus className="h-4 w-4" />
            Buat Laporan
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari laporan..."
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
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p>Belum ada laporan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead className="hidden md:table-cell">Kegiatan</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((laporan) => (
                    <TableRow key={laporan.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{laporan.judul}</p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {laporan.kegiatan.namaKegiatan}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(laporan.createdAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="text-sm">{laporan.kegiatan.namaKegiatan}</p>
                          <p className="text-xs text-muted-foreground">
                            {laporan.kegiatan.kodeKegiatan}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tipeBadge(laporan.tipeLaporan)}>
                          {laporan.tipeLaporan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge(laporan.status)}>
                          {laporan.status === "PUBLISHED" ? "Dipublikasikan" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/laporan/${laporan.id}`}>
                            <Button variant="ghost" size="icon" title="Lihat">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {laporan.fileUrl && (
                            <Button variant="ghost" size="icon" title="Download">
                              <a href={laporan.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
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
              onClick={() => fetchLaporan(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchLaporan(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
