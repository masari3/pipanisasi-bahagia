"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JENIS_KEGIATAN, STATUS_KEGIATAN } from "@/lib/constants";

const kegiatanSchema = z.object({
  namaKegiatan: z.string().min(1, "Nama kegiatan wajib diisi"),
  jenisKegiatan: z.string().min(1, "Jenis kegiatan wajib dipilih"),
  status: z.string().optional(),
  deskripsi: z.string().optional(),
  latarBelakang: z.string().optional(),
  tujuan: z.string().optional(),
  lokasi: z.string().optional(),
  alamat: z.string().optional(),
  desa: z.string().optional(),
  kecamatan: z.string().optional(),
  kabupaten: z.string().optional(),
  provinsi: z.string().optional(),
  tanggalMulai: z.string().optional(),
  tanggalSelesai: z.string().optional(),
  targetDana: z.string().optional(),
  jumlahPenerimaManfaat: z.string().optional(),
  jumlahMasjid: z.string().optional(),
  jumlahKk: z.string().optional(),
  panjangPipa: z.string().optional(),
  sumberAir: z.string().optional(),
});

type KegiatanFormData = z.infer<typeof kegiatanSchema>;

const JENIS_OPTIONS = [
  { value: "", label: "Pilih Jenis Kegiatan" },
  ...JENIS_KEGIATAN,
];

const STATUS_OPTIONS = [
  { value: "", label: "Pilih Status" },
  ...STATUS_KEGIATAN,
];

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function toStr(value: number | null | undefined): string {
  if (value == null) return "";
  return String(value);
}

export default function EditKegiatanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KegiatanFormData>({
    resolver: zodResolver(kegiatanSchema),
    defaultValues: {
      namaKegiatan: "",
      jenisKegiatan: "",
      status: "",
      deskripsi: "",
      latarBelakang: "",
      tujuan: "",
      lokasi: "",
      alamat: "",
      desa: "",
      kecamatan: "",
      kabupaten: "",
      provinsi: "",
      tanggalMulai: "",
      tanggalSelesai: "",
      targetDana: "",
      jumlahPenerimaManfaat: "",
      jumlahMasjid: "",
      jumlahKk: "",
      panjangPipa: "",
      sumberAir: "",
    },
  });

  const fetchKegiatan = useCallback(async () => {
    try {
      const res = await fetch(`/api/kegiatan/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        reset({
          namaKegiatan: d.namaKegiatan ?? "",
          jenisKegiatan: d.jenisKegiatan ?? "",
          status: d.status ?? "",
          deskripsi: d.deskripsi ?? "",
          latarBelakang: d.latarBelakang ?? "",
          tujuan: d.tujuan ?? "",
          lokasi: d.lokasi ?? "",
          alamat: d.alamat ?? "",
          desa: d.desa ?? "",
          kecamatan: d.kecamatan ?? "",
          kabupaten: d.kabupaten ?? "",
          provinsi: d.provinsi ?? "",
          tanggalMulai: formatDate(d.tanggalMulai),
          tanggalSelesai: formatDate(d.tanggalSelesai),
          targetDana: toStr(d.targetDana),
          jumlahPenerimaManfaat: toStr(d.jumlahPenerimaManfaat),
          jumlahMasjid: toStr(d.jumlahMasjid),
          jumlahKk: toStr(d.jumlahKk),
          panjangPipa: toStr(d.panjangPipa),
          sumberAir: d.sumberAir ?? "",
        });
      } else {
        toast.error(json.message || "Gagal memuat data kegiatan");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchKegiatan();
  }, [fetchKegiatan]);

  const onSubmit = async (data: KegiatanFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        targetDana: data.targetDana ? parseFloat(data.targetDana) : null,
        jumlahPenerimaManfaat: data.jumlahPenerimaManfaat
          ? parseInt(data.jumlahPenerimaManfaat)
          : null,
        jumlahMasjid: data.jumlahMasjid
          ? parseInt(data.jumlahMasjid)
          : null,
        jumlahKk: data.jumlahKk ? parseInt(data.jumlahKk) : null,
        panjangPipa: data.panjangPipa
          ? parseFloat(data.panjangPipa)
          : null,
        tanggalMulai: data.tanggalMulai || null,
        tanggalSelesai: data.tanggalSelesai || null,
      };

      const res = await fetch(`/api/kegiatan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Kegiatan berhasil diperbarui!");
        router.push(`/kegiatan/${id}`);
      } else {
        toast.error(json.message || "Gagal memperbarui kegiatan");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-40 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-9 w-full bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5"
          onClick={() => router.push(`/kegiatan/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Edit Kegiatan
          </h1>
          <p className="text-sm text-muted-foreground">
            Perbarui informasi kegiatan
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Kegiatan *"
                placeholder="Contoh: Pipanisasi Desa Sukamaju"
                error={errors.namaKegiatan?.message}
                {...register("namaKegiatan")}
              />
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Jenis Kegiatan *
                </label>
                <select
                  className="flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("jenisKegiatan")}
                >
                  {JENIS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.jenisKegiatan?.message && (
                  <p className="mt-1.5 text-sm text-destructive">
                    {errors.jenisKegiatan.message}
                  </p>
                )}
              </div>
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Status
                </label>
                <select
                  className="flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("status")}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.status?.message && (
                  <p className="mt-1.5 text-sm text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
            <Textarea
              label="Deskripsi"
              placeholder="Deskripsi singkat tentang kegiatan..."
              rows={3}
              {...register("deskripsi")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latar Belakang & Tujuan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Latar Belakang"
              placeholder="Latar belakang kegiatan..."
              rows={4}
              {...register("latarBelakang")}
            />
            <Textarea
              label="Tujuan"
              placeholder="Tujuan kegiatan..."
              rows={4}
              {...register("tujuan")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lokasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Lokasi"
                placeholder="Contoh: Masjid Al-Ikhlas"
                {...register("lokasi")}
              />
              <Input
                label="Alamat"
                placeholder="Alamat lengkap"
                {...register("alamat")}
              />
              <Input
                label="Desa"
                placeholder="Nama desa"
                {...register("desa")}
              />
              <Input
                label="Kecamatan"
                placeholder="Nama kecamatan"
                {...register("kecamatan")}
              />
              <Input
                label="Kabupaten"
                placeholder="Nama kabupaten"
                {...register("kabupaten")}
              />
              <Input
                label="Provinsi"
                placeholder="Nama provinsi"
                {...register("provinsi")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Waktu & Dana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tanggal Mulai"
                type="date"
                {...register("tanggalMulai")}
              />
              <Input
                label="Tanggal Selesai"
                type="date"
                {...register("tanggalSelesai")}
              />
              <Input
                label="Target Dana (Rp)"
                type="number"
                placeholder="0"
                {...register("targetDana")}
              />
              <Input
                label="Sumber Air"
                placeholder="Contoh: Sungai, Sumur"
                {...register("sumberAir")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Pendukung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Jumlah Penerima Manfaat"
                type="number"
                placeholder="0"
                {...register("jumlahPenerimaManfaat")}
              />
              <Input
                label="Jumlah Masjid"
                type="number"
                placeholder="0"
                {...register("jumlahMasjid")}
              />
              <Input
                label="Jumlah KK"
                type="number"
                placeholder="0"
                {...register("jumlahKk")}
              />
              <Input
                label="Panjang Pipa (meter)"
                type="number"
                step="0.01"
                placeholder="0"
                {...register("panjangPipa")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/kegiatan/${id}`)}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
