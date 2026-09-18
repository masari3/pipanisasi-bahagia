"use client";

import { useState } from "react";
import {
  FolderKanban,
  Activity,
  HandCoins,
  Receipt,
  Wallet,
  Users,
  Heart,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate } from "@/lib/utils";

const stats = [
  {
    title: "Total Kegiatan",
    value: 24,
    icon: FolderKanban,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Kegiatan Aktif",
    value: 8,
    icon: Activity,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Total Donasi",
    value: 125000000,
    icon: HandCoins,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    title: "Total Pengeluaran",
    value: 85000000,
    icon: Receipt,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  {
    title: "Total Saldo",
    value: 40000000,
    icon: Wallet,
    color: "text-teal-600",
    bg: "bg-teal-100",
  },
  {
    title: "Total Donatur",
    value: 156,
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    title: "Penerima Manfaat",
    value: 892,
    icon: Heart,
    color: "text-pink-600",
    bg: "bg-pink-100",
  },
  {
    title: "Titik Pipanisasi",
    value: 12,
    icon: MapPin,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
];

const monthlyData = [
  { bulan: "Jan", masuk: 12000000, keluar: 8000000 },
  { bulan: "Feb", masuk: 15000000, keluar: 10000000 },
  { bulan: "Mar", masuk: 18000000, keluar: 12000000 },
  { bulan: "Apr", masuk: 14000000, keluar: 9000000 },
  { bulan: "Mei", masuk: 20000000, keluar: 15000000 },
  { bulan: "Jun", masuk: 16000000, keluar: 11000000 },
];

const statusData = [
  { name: "Aktif", value: 8, color: "#16a34a" },
  { name: "Selesai", value: 12, color: "#0d4b4f" },
  { name: "Draft", value: 3, color: "#f59e0b" },
  { name: "Dibatalkan", value: 1, color: "#dc2626" },
];

const recentKegiatan = [
  {
    id: "1",
    judul: "Bakti Sosial Ramadan",
    status: "AKTIF",
    tanggal: "2026-03-15",
    lokasi: "Masjid Al-Ikhlas",
  },
  {
    id: "2",
    judul: "Penggalangan Dana Banjir",
    status: "SELESAI",
    tanggal: "2026-02-20",
    lokasi: "Kelurahan Sukamaju",
  },
  {
    id: "3",
    judul: "Renovasi Sekolah Dasar",
    status: "AKTIF",
    tanggal: "2026-03-01",
    lokasi: "SDN 05 Menteng",
  },
  {
    id: "4",
    judul: "Program Beasiswa Anak Yatim",
    status: "AKTIF",
    tanggal: "2026-03-10",
    lokasi: "Kantor Yayasan",
  },
  {
    id: "5",
    judul: "Pembangunan Sumur Bor",
    status: "DRAFT",
    tanggal: "2026-03-20",
    lokasi: "Desa Ciamis",
  },
];

const recentDonasi = [
  {
    id: "1",
    nama: "Ahmad Fauzi",
    jumlah: 5000000,
    kegiatan: "Bakti Sosial Ramadan",
    tanggal: "2026-03-17",
    status: "Dikonfirmasi",
  },
  {
    id: "2",
    nama: "Siti Rahmawati",
    jumlah: 2500000,
    kegiatan: "Penggalangan Dana Banjir",
    tanggal: "2026-03-16",
    status: "Dikonfirmasi",
  },
  {
    id: "3",
    nama: "Budi Santoso",
    jumlah: 10000000,
    kegiatan: "Renovasi Sekolah Dasar",
    tanggal: "2026-03-15",
    status: "Menunggu",
  },
  {
    id: "4",
    nama: "Dewi Lestari",
    jumlah: 750000,
    kegiatan: "Program Beasiswa Anak Yatim",
    tanggal: "2026-03-14",
    status: "Dikonfirmasi",
  },
  {
    id: "5",
    nama: "Hendra Wijaya",
    jumlah: 3000000,
    kegiatan: "Pembangunan Sumur Bor",
    tanggal: "2026-03-13",
    status: "Menunggu",
  },
];

function statusBadge(status: string) {
  const map: Record<string, "success" | "default" | "warning" | "destructive"> = {
    AKTIF: "success",
    SELESAI: "default",
    DRAFT: "warning",
    DIBATALKAN: "destructive",
    Dikonfirmasi: "success",
    Menunggu: "warning",
  };
  return map[status] || "default";
}

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di sistem Pipanisasi Bahagia
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-lg font-bold text-foreground">
                    {stat.title.includes("Donasi") ||
                    stat.title.includes("Pengeluaran") ||
                    stat.title.includes("Saldo")
                      ? formatRupiah(stat.value)
                      : stat.value.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Dana Masuk vs Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                />
                <Tooltip
                  formatter={(value) => formatRupiah(Number(value))}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Legend />
                <Bar dataKey="masuk" name="Dana Masuk" fill="#0d4b4f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="keluar" name="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kegiatan per Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kegiatan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentKegiatan.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.judul}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {formatDate(item.tanggal)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadge(item.status)}>
                        {formatStatus(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatDate(item.tanggal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Donasi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donatur</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDonasi.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.nama}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.kegiatan}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatRupiah(item.jumlah)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={statusBadge(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
