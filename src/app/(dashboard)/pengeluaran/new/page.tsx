"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Loader2,
  Upload,
  X,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const pengeluaranSchema = z.object({
  kegiatanId: z.string().min(1, "Kegiatan harus dipilih"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  kategori: z.enum(["MATERIAL", "TRANSPORTASI", "KONSUMSI", "TENAGA", "OPERASIONAL", "LAINNYA"], "Kategori harus dipilih"),
  deskripsi: z.string().optional(),
  nominal: z.number().min(1, "Nominal harus lebih dari 0"),
  vendor: z.string().optional(),
  keterangan: z.string().optional(),
});

type PengeluaranFormData = z.infer<typeof pengeluaranSchema>;

interface Kegiatan {
  id: string;
  namaKegiatan: string;
  kodeKegiatan: string;
  saldo: number;
}

const kategoriOptions = [
  { value: "MATERIAL", label: "Material" },
  { value: "TRANSPORTASI", label: "Transportasi" },
  { value: "KONSUMSI", label: "Konsumsi" },
  { value: "TENAGA", label: "Tenaga" },
  { value: "OPERASIONAL", label: "Operasional" },
  { value: "LAINNYA", label: "Lainnya" },
];

export default function NewPengeluaranPage() {
  const router = useRouter();
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [loadingKegiatan, setLoadingKegiatan] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [showSaldoWarning, setShowSaldoWarning] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PengeluaranFormData>({
    resolver: zodResolver(pengeluaranSchema),
    defaultValues: {
      tanggal: new Date().toISOString().split("T")[0],
    },
  });

  const watchedNominal = watch("nominal");
  const watchedKegiatanId = watch("kegiatanId");

  useEffect(() => {
    fetchKegiatanList();
  }, []);

  useEffect(() => {
    if (watchedKegiatanId) {
      const kegiatan = kegiatanList.find((k) => k.id === watchedKegiatanId);
      setSelectedKegiatan(kegiatan || null);
      if (kegiatan && watchedNominal > Number(kegiatan.saldo)) {
        setShowSaldoWarning(true);
      } else {
        setShowSaldoWarning(false);
      }
    }
  }, [watchedKegiatanId, watchedNominal, kegiatanList]);

  const fetchKegiatanList = async () => {
    try {
      const res = await fetch("/api/kegiatan?limit=100");
      const json = await res.json();
      if (json.success) {
        setKegiatanList(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch kegiatan:", error);
    } finally {
      setLoadingKegiatan(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBuktiFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setBuktiFile(null);
    setBuktiPreview(null);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        return json.data.url;
      }
      return null;
    } catch {
      return null;
    }
  };

  const onSubmit = async (data: PengeluaranFormData) => {
    if (selectedKegiatan && data.nominal > Number(selectedKegiatan.saldo)) {
      const confirmed = window.confirm(
        "Saldo kegiatan tidak mencukupi. Pengeluaran ini akan membuat saldo negatif. Lanjutkan?"
      );
      if (!confirmed) return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let buktiUrl = null;
      if (buktiFile) {
        buktiUrl = await uploadFile(buktiFile);
        if (!buktiUrl) {
          setError("Gagal mengupload bukti pengeluaran");
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        ...data,
        nominal: data.nominal,
        buktiUrl,
        deskripsi: data.deskripsi || undefined,
        vendor: data.vendor || undefined,
        keterangan: data.keterangan || undefined,
      };

      const res = await fetch("/api/pengeluaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        router.push("/pengeluaran");
      } else {
        setError(json.message || "Gagal menyimpan pengeluaran");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiahDisplay = (value: number | undefined) => {
    if (!value) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tambah Pengeluaran</h1>
          <p className="text-muted-foreground">Formulir penambahan pengeluaran baru</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Kegiatan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Kegiatan *"
              placeholder={loadingKegiatan ? "Memuat kegiatan..." : "Pilih kegiatan"}
              options={kegiatanList.map((k) => ({
                value: k.id,
                label: `${k.kodeKegiatan} - ${k.namaKegiatan}`,
              }))}
              {...register("kegiatanId")}
            />
            {errors.kegiatanId && (
              <p className="mt-1.5 text-sm text-destructive">{errors.kegiatanId.message}</p>
            )}
            {selectedKegiatan && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm">
                  <span className="font-medium">Saldo tersedia:</span>{" "}
                  <span className={`font-bold ${Number(selectedKegiatan.saldo) > 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatRupiahDisplay(Number(selectedKegiatan.saldo))}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Tanggal *
                </label>
                <Input
                  type="date"
                  {...register("tanggal")}
                />
                {errors.tanggal && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.tanggal.message}</p>
                )}
              </div>
              <Select
                label="Kategori *"
                options={kategoriOptions}
                {...register("kategori")}
              />
              {errors.kategori && (
                <p className="mt-1.5 text-sm text-destructive">{errors.kategori.message}</p>
              )}
            </div>
            <Textarea
              label="Deskripsi"
              placeholder="Masukkan deskripsi pengeluaran"
              rows={2}
              {...register("deskripsi")}
            />
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Nominal (Rp) *
              </label>
              <input
                type="number"
                placeholder="0"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register("nominal", { valueAsNumber: true })}
              />
              {errors.nominal && (
                <p className="mt-1.5 text-sm text-destructive">{errors.nominal.message}</p>
              )}
              {watchedNominal > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRupiahDisplay(watchedNominal)}
                </p>
              )}
            </div>

            {showSaldoWarning && selectedKegiatan && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Saldo Tidak Mencukupi</p>
                  <p className="text-sm text-yellow-700">
                    Nominal pengeluaran ({formatRupiahDisplay(watchedNominal)}) melebihi saldo
                    tersedia ({formatRupiahDisplay(Number(selectedKegiatan.saldo))}).
                    Saldo akan menjadi{" "}
                    <span className="font-bold text-red-600">
                      {formatRupiahDisplay(Number(selectedKegiatan.saldo) - watchedNominal)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <Input
              label="Vendor / Penyedia"
              placeholder="Nama vendor atau penyedia barang/jasa"
              {...register("vendor")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bukti & Keterangan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Bukti Pengeluaran
              </label>
              {buktiPreview ? (
                <div className="relative inline-block">
                  {buktiFile?.type.startsWith("image/") ? (
                    <img
                      src={buktiPreview}
                      alt="Preview bukti"
                      className="max-h-48 rounded-lg border"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted">
                      <Receipt className="h-5 w-5" />
                      <span className="text-sm">{buktiFile?.name}</span>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeFile}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Klik untuk upload bukti
                  </span>
                  <span className="text-xs text-muted-foreground">
                    JPG, PNG, atau PDF (maks. 10MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            <Textarea
              label="Keterangan"
              placeholder="Masukkan keterangan tambahan (opsional)"
              rows={3}
              {...register("keterangan")}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Pengeluaran"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
