"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Receipt,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { formatRupiah, formatDate } from "@/lib/utils";
import { ITEMS_PER_PAGE } from "@/lib/constants";

interface RabItem {
  id: string;
  kodeRab: string;
  judul: string;
  total: number;
  status: string;
  createdAt: string;
  kegiatan: { id: string; namaKegiatan: string; kodeKegiatan: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" }> = {
  DRAFT: { label: "Draft", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REVISION: { label: "Revisi", variant: "destructive" },
};

export default function RabPage() {
  const [rabs, setRabs] = useState<RabItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRabs = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(ITEMS_PER_PAGE));
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/rab?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setRabs(json.data);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch RAB:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRabs(1);
  }, [fetchRabs]);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus RAB ini?")) return;
    try {
      const res = await fetch(`/api/rab/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchRabs(pagination.page);
      }
    } catch (error) {
      console.error("Failed to delete RAB:", error);
    }
  };

  const filteredRabs = rabs.filter((r) =>
    search
      ? r.judul.toLowerCase().includes(search.toLowerCase()) ||
        r.kodeRab.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            RAB / Rencana Anggaran Biaya
          </h1>
          <p className="text-muted-foreground">Kelola rencana anggaran biaya kegiatan</p>
        </div>
        <Link href="/rab/new">
          <Button>
            <Plus className="h-4 w-4" />
            Tambah RAB
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari RAB..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              options={[
                { value: "", label: "Semua Status" },
                { value: "DRAFT", label: "Draft" },
                { value: "APPROVED", label: "Approved" },
                { value: "REVISION", label: "Revisi" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Filter Status"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredRabs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Tidak ada RAB ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode RAB</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead className="hidden md:table-cell">Kegiatan</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRabs.map((rab) => (
                      <TableRow key={rab.id}>
                        <TableCell>
                          <span className="font-mono text-sm">{rab.kodeRab}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{rab.judul}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {rab.kegiatan.namaKegiatan}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <p className="text-sm">{rab.kegiatan.namaKegiatan}</p>
                            <p className="text-xs text-muted-foreground">
                              {rab.kegiatan.kodeKegiatan}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatRupiah(Number(rab.total))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusMap[rab.status]?.variant || "default"}>
                            {statusMap[rab.status]?.label || rab.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/rab/${rab.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(rab.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
                  {pagination.total} RAB
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchRabs(pagination.page - 1)}
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
                    onClick={() => fetchRabs(pagination.page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
