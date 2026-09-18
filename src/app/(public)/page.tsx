"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Droplets,
  Heart,
  Users,
  FolderKanban,
  Wallet,
  ArrowRight,
  MapPin,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface Stats {
  totalKegiatan: number;
  totalDana: number;
  totalPenerima: number;
}

export default function PublicHomePage() {
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalKegiatan: 0,
    totalDana: 0,
    totalPenerima: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/public/kegiatan?limit=6");
        const json = await res.json();
        if (json.success) {
          setKegiatanList(json.data);
          setStats({
            totalKegiatan: json.pagination.total,
            totalDana: json.data.reduce(
              (sum: number, k: Kegiatan) => sum + k.danaTerkumpul,
              0
            ),
            totalPenerima: json.data.reduce(
              (sum: number, k: Kegiatan) => sum + (k.jumlahPenerimaManfaat || 0),
              0
            ),
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const aktifKegiatan = kegiatanList.filter((k) => k.status === "AKTIF");
  const latestKegiatan = kegiatanList.slice(0, 3);

  function statusBadge(status: string) {
    const map: Record<string, "success" | "default" | "warning" | "destructive"> = {
      AKTIF: "success",
      SELESAI: "default",
      DRAFT: "warning",
    };
    return map[status] || "default";
  }

  return (
    <div className="space-y-0">
      <section className="relative bg-gradient-to-br from-[#0d4b4f] via-[#0a3d40] to-[#1a7a80] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-accent-orange/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Droplets className="h-3 w-3 mr-1" />
              Pipanisasi Bahagia
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Air Bersih untuk{" "}
              <span className="text-accent-orange">Semua</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
              Mengalirkan Air, Mengalirkan Pahala. Bersama kita wujudkan akses air bersih
              bagi masyarakat yang membutuhkan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/donasi">
                <Button size="lg" className="gradient-accent text-white shadow-accent-lg">
                  <Heart className="h-5 w-5" />
                  Donasi Sekarang
                </Button>
              </Link>
              <Link href="/kegiatan">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Lihat Kegiatan
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-16 relative z-10">
            {[
              {
                label: "Total Kegiatan",
                value: stats.totalKegiatan.toLocaleString("id-ID"),
                icon: FolderKanban,
                color: "bg-blue-500",
              },
              {
                label: "Total Dana Terkumpul",
                value: formatRupiah(stats.totalDana),
                icon: Wallet,
                color: "bg-emerald-500",
              },
              {
                label: "Penerima Manfaat",
                value: stats.totalPenerima.toLocaleString("id-ID"),
                icon: Users,
                color: "bg-purple-500",
              },
              {
                label: "Donatur",
                value: "150+",
                icon: Heart,
                color: "bg-pink-500",
              },
            ].map((stat) => (
              <Card key={stat.label} className="shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.color} p-2.5 rounded-xl text-white`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Kegiatan Terbaru
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pantau kegiatan pipanisasi yang sedang berlangsung dan telah selesai
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : latestKegiatan.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Belum ada kegiatan
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestKegiatan.map((kegiatan) => {
                const progress = kegiatan.targetDana
                  ? Math.round((kegiatan.danaTerkumpul / kegiatan.targetDana) * 100)
                  : 0;
                return (
                  <Link key={kegiatan.id} href={`/kegiatan/${kegiatan.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                      <div className="h-48 bg-gradient-to-br from-[#0d4b4f] to-[#1a7a80] rounded-t-xl flex items-center justify-center">
                        <Droplets className="h-16 w-16 text-white/30 group-hover:text-white/50 transition-colors" />
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={statusBadge(kegiatan.status)}>
                            {kegiatan.status}
                          </Badge>
                          <Badge variant="outline">{kegiatan.jenisKegiatan}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {kegiatan.namaKegiatan}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3.5 w-3.5" />
                          {kegiatan.lokasi}
                        </div>
                        {kegiatan.targetDana && (
                          <div className="space-y-2">
                            <Progress value={progress} />
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

          <div className="text-center mt-8">
            <Link href="/kegiatan">
              <Button variant="outline" size="lg">
                Lihat Semua Kegiatan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {aktifKegiatan.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Kegiatan Aktif
              </h2>
              <p className="text-muted-foreground">
                Donasi Anda sangat berarti untuk kegiatan ini
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aktifKegiatan.slice(0, 4).map((kegiatan) => {
                const progress = kegiatan.targetDana
                  ? Math.round((kegiatan.danaTerkumpul / kegiatan.targetDana) * 100)
                  : 0;
                return (
                  <Link key={kegiatan.id} href={`/kegiatan/${kegiatan.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Badge variant="success" className="mb-2">Aktif</Badge>
                            <h3 className="font-semibold text-lg">{kegiatan.namaKegiatan}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {kegiatan.lokasi}
                            </p>
                          </div>
                          {kegiatan.jumlahPenerimaManfaat && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Penerima</p>
                              <p className="text-lg font-bold text-primary">
                                {kegiatan.jumlahPenerimaManfaat}
                              </p>
                            </div>
                          )}
                        </div>
                        {kegiatan.targetDana && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} color="success" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Terkumpul: {formatRupiah(kegiatan.danaTerkumpul)}</span>
                              <span>Target: {formatRupiah(kegiatan.targetDana)}</span>
                            </div>
                          </div>
                        )}
                        <Button className="w-full mt-4" size="sm">
                          <Heart className="h-4 w-4" />
                          Donasi
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-gradient-to-br from-[#0d4b4f] to-[#1a7a80] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="h-12 w-12 mx-auto mb-6 text-accent-orange" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Bantu Sebarkan Kebaikan
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Setiap donasi yang Anda berikan akan membantu masyarakat mendapatkan akses
            air bersih yang layak. Bersama kita bisa membuat perubahan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/donasi">
              <Button size="lg" className="gradient-accent text-white shadow-accent-lg">
                <Heart className="h-5 w-5" />
                Donasi Sekarang
              </Button>
            </Link>
            <Link href="/tentang">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
