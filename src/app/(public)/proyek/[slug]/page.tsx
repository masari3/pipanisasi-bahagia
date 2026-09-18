"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Droplets,
  MapPin,
  Calendar,
  Users,
  Wallet,
  Heart,
  ArrowLeft,
  Loader2,
  Target,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatRupiah, formatDate } from "@/lib/utils";

interface KegiatanDetail {
  id: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  slug: string;
  jenisKegiatan: string;
  deskripsi: string | null;
  latarBelakang: string | null;
  tujuan: string | null;
  lokasi: string;
  alamat: string | null;
  desa: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  provinsi: string | null;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  status: string;
  targetDana: number | null;
  danaTerkumpul: number;
  totalPengeluaran: number;
  saldo: number;
  jumlahPenerimaManfaat: number | null;
  jumlahMasjid: number | null;
  jumlahKk: number | null;
  panjangPipa: number | null;
  sumberAir: string | null;
  createdAt: string;
  _count: { donasis: number; dokumentasis: number };
  dokumentasis: {
    id: string;
    judul: string;
    fileUrl: string | null;
    thumbnailUrl: string | null;
    kategori: string;
    tanggal: string;
  }[];
}

export default function PublicKegiatanDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [kegiatan, setKegiatan] = useState<KegiatanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const res = await fetch(`/api/public/kegiatan/${slug}`);
        const json = await res.json();
        if (json.success) {
          setKegiatan(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch kegiatan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKegiatan();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!kegiatan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Droplets className="h-12 w-12 mb-4 opacity-50" />
        <p>Kegiatan tidak ditemukan</p>
        <Link href="/kegiatan" className="mt-4">
          <Button variant="outline">Kembali ke Kegiatan</Button>
        </Link>
      </div>
    );
  }

  const progress = kegiatan.targetDana
    ? Math.round((kegiatan.danaTerkumpul / kegiatan.targetDana) * 100)
    : 0;

  function statusBadge(status: string) {
    const map: Record<string, "success" | "default" | "warning"> = {
      AKTIF: "success",
      SELESAI: "default",
      DRAFT: "warning",
    };
    return map[status] || "default";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#0d4b4f] to-[#1a7a80] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/kegiatan" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Kegiatan
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant={statusBadge(kegiatan.status)}>{kegiatan.status}</Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
              {kegiatan.jenisKegiatan}
            </Badge>
            <span className="text-white/60 text-sm">{kegiatan.kodeKegiatan}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            {kegiatan.namaKegiatan}
          </h1>
          <div className="flex flex-wrap gap-4 text-white/70 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {kegiatan.lokasi}
            </div>
            {kegiatan.tanggalMulai && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(kegiatan.tanggalMulai)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Tentang Kegiatan Ini</h2>
                {kegiatan.deskripsi && (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {kegiatan.deskripsi}
                  </p>
                )}
                {kegiatan.latarBelakang && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Latar Belakang</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {kegiatan.latarBelakang}
                    </p>
                  </div>
                )}
                {kegiatan.tujuan && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Tujuan</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {kegiatan.tujuan}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Ringkasan Keuangan</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs text-emerald-600 font-medium">Dana Masuk</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-700">
                      {formatRupiah(kegiatan.danaTerkumpul)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-red-600 font-medium">Pengeluaran</span>
                    </div>
                    <p className="text-lg font-bold text-red-700">
                      {formatRupiah(kegiatan.totalPengeluaran)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-teal-50 border border-teal-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-teal-600" />
                      <span className="text-xs text-teal-600 font-medium">Saldo</span>
                    </div>
                    <p className="text-lg font-bold text-teal-700">
                      {formatRupiah(kegiatan.saldo)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {kegiatan.dokumentasis.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Dokumentasi
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {kegiatan.dokumentasis.map((doc) => (
                      <div
                        key={doc.id}
                        className="relative aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer group"
                        onClick={() => doc.fileUrl && setLightboxImage(doc.fileUrl)}
                      >
                        {doc.fileUrl ? (
                          <img
                            src={doc.thumbnailUrl || doc.fileUrl}
                            alt={doc.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress Donasi</span>
                    <span className="font-bold text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} color={progress >= 100 ? "success" : "primary"} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{formatRupiah(kegiatan.danaTerkumpul)} terkumpul</span>
                    {kegiatan.targetDana && (
                      <span>{formatRupiah(kegiatan.targetDana)} target</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {kegiatan.targetDana && (
                    <div className="p-3 rounded-lg bg-muted text-center">
                      <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-sm font-bold">{formatRupiah(kegiatan.targetDana)}</p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <Wallet className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Terkumpul</p>
                    <p className="text-sm font-bold">{formatRupiah(kegiatan.danaTerkumpul)}</p>
                  </div>
                  {kegiatan.jumlahPenerimaManfaat && (
                    <div className="p-3 rounded-lg bg-muted text-center">
                      <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Penerima</p>
                      <p className="text-sm font-bold">{kegiatan.jumlahPenerimaManfaat}</p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <Heart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Donasi</p>
                    <p className="text-sm font-bold">{kegiatan._count.donasis}</p>
                  </div>
                </div>

                {kegiatan.sumberAir && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Sumber Air</p>
                    <p className="font-medium">{kegiatan.sumberAir}</p>
                  </div>
                )}
                {kegiatan.panjangPipa && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Panjang Pipa</p>
                    <p className="font-medium">{kegiatan.panjangPipa} meter</p>
                  </div>
                )}

                {kegiatan.status === "AKTIF" && (
                  <Link href={`/donasi?kegiatan=${kegiatan.id}`}>
                    <Button className="w-full gradient-accent text-white" size="lg">
                      <Heart className="h-5 w-5" />
                      Donasi untuk Kegiatan Ini
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {lightboxImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxImage(null)}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setLightboxImage(null)}
            >
              &times;
            </button>
            <img src={lightboxImage} alt="Dokumentasi" />
          </div>
        </div>
      )}
    </div>
  );
}
