"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  CalendarDays,
  MapPin,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { ITEMS_PER_PAGE } from "@/lib/constants";

interface AgendaItem {
  id: string;
  judul: string;
  tanggal: string;
  waktuMulai: string | null;
  waktuSelesai: string | null;
  lokasi: string | null;
  deskripsi: string | null;
  status: string;
  penanggungJawab: string | null;
  kegiatan: { id: string; namaKegiatan: string; kodeKegiatan: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" }> = {
  PLANNED: { label: "Planned", variant: "info" },
  ONGOING: { label: "Ongoing", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export default function AgendaPage() {
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "card">("card");

  const fetchAgendas = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(ITEMS_PER_PAGE));
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/agenda?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setAgendas(json.data);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch agendas:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAgendas(1);
  }, [fetchAgendas]);

  const filteredAgendas = agendas.filter((a) =>
    search
      ? a.judul.toLowerCase().includes(search.toLowerCase()) ||
        (a.lokasi && a.lokasi.toLowerCase().includes(search.toLowerCase()))
      : true
  );

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda Kegiatan</h1>
          <p className="text-muted-foreground">Jadwal dan agenda kegiatan</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === "card" ? "default" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode("card")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/agenda/new">
            <Button>
              <Plus className="h-4 w-4" />
              Tambah Agenda
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari agenda..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              options={[
                { value: "", label: "Semua Status" },
                { value: "PLANNED", label: "Planned" },
                { value: "ONGOING", label: "Ongoing" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Filter Status"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredAgendas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Tidak ada agenda ditemukan</p>
          </CardContent>
        </Card>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAgendas.map((agenda) => {
            const status = statusMap[agenda.status] || {
              label: agenda.status,
              variant: "default" as const,
            };
            const startTime = formatTime(agenda.waktuMulai);
            const endTime = formatTime(agenda.waktuSelesai);
            const timeRange =
              startTime && endTime
                ? `${startTime} - ${endTime}`
                : startTime || "-";

            return (
              <Card key={agenda.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(agenda.tanggal)}
                    </span>
                  </div>
                  <h3 className="mb-3 font-semibold text-foreground">{agenda.judul}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{timeRange}</span>
                    </div>
                    {agenda.lokasi && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{agenda.lokasi}</span>
                      </div>
                    )}
                    {agenda.penanggungJawab && (
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{agenda.penanggungJawab}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs text-muted-foreground">
                      {agenda.kegiatan.namaKegiatan}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Judul</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-muted-foreground">Waktu</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-muted-foreground">Lokasi</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="hidden lg:table-cell px-4 py-3 text-left font-medium text-muted-foreground">Penanggung Jawab</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgendas.map((agenda) => {
                    const status = statusMap[agenda.status] || {
                      label: agenda.status,
                      variant: "default" as const,
                    };
                    const startTime = formatTime(agenda.waktuMulai);
                    const endTime = formatTime(agenda.waktuSelesai);
                    const timeRange =
                      startTime && endTime
                        ? `${startTime} - ${endTime}`
                        : startTime || "-";

                    return (
                      <tr key={agenda.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{agenda.judul}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {formatDate(agenda.tanggal)}
                          </p>
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3 text-muted-foreground">
                          {formatDate(agenda.tanggal)}
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 text-muted-foreground">
                          {timeRange}
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 text-muted-foreground">
                          {agenda.lokasi || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="hidden lg:table-cell px-4 py-3 text-muted-foreground">
                          {agenda.penanggungJawab || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
            {pagination.total} agenda
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchAgendas(pagination.page - 1)}
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
              onClick={() => fetchAgendas(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
