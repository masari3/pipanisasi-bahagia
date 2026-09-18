"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Dokumentasi {
  id: string;
  judul: string;
  deskripsi: string | null;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  tanggal: string;
  kategori: string;
  caption: string | null;
  kegiatan: {
    id: string;
    namaKegiatan: string;
    slug: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const KATEGORI_OPTIONS = [
  { value: "", label: "Semua Kategori" },
  { value: "FOTO", label: "Foto" },
  { value: "VIDEO", label: "Video" },
  { value: "DOKUMEN", label: "Dokumen" },
];

export default function PublicGaleriPage() {
  const [data, setData] = useState<Dokumentasi[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [kategori, setKategori] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchGallery = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (kategori) params.set("kategori", kategori);

      const res = await fetch(`/api/public/dokumentasi?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery(1);
  }, [kategori]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevImage = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const nextImage = () => {
    if (lightboxIndex !== null && lightboxIndex < data.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#0d4b4f] to-[#1a7a80] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Galeri</h1>
          <p className="text-white/80 max-w-2xl">
            Dokumentasi kegiatan pipanisasi yang telah dilakukan
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {KATEGORI_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setKategori(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                kategori === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-foreground border hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada dokumentasi</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((item, index) => (
              <div
                key={item.id}
                className="group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                  {item.fileUrl ? (
                    <img
                      src={item.thumbnailUrl || item.fileUrl}
                      alt={item.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-medium truncate">{item.judul}</p>
                    <p className="text-xs text-white/70">{item.kegiatan.namaKegiatan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchGallery(pagination.page - 1)}
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
              onClick={() => fetchGallery(pagination.page + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        )}
      </div>

      {lightboxIndex !== null && data[lightboxIndex] && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              &times;
            </button>
            {lightboxIndex > 0 && (
              <button
                className="lightbox-nav lightbox-nav-prev"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {lightboxIndex < data.length - 1 && (
              <button
                className="lightbox-nav lightbox-nav-next"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
            <img
              src={data[lightboxIndex].fileUrl || ""}
              alt={data[lightboxIndex].judul}
            />
            <div className="lightbox-caption">
              <p className="font-medium">{data[lightboxIndex].judul}</p>
              <p className="text-xs text-white/70">
                {data[lightboxIndex].kegiatan.namaKegiatan} &middot;{" "}
                {formatDate(data[lightboxIndex].tanggal)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
