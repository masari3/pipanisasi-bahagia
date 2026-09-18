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
  HandCoins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const donasiSchema = z.object({
  kegiatanId: z.string().min(1, "Kegiatan harus dipilih"),
  namaDonatur: z.string().min(1, "Nama donatur harus diisi"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
  nominal: z.number().min(1, "Nominal harus lebih dari 0"),
  metode: z.enum(["TRANSFER", "CASH", "QRIS", "OTHER"], "Metode pembayaran harus dipilih"),
  bank: z.string().optional(),
  rekening: z.string().optional(),
  keterangan: z.string().optional(),
});

type DonasiFormData = z.infer<typeof donasiSchema>;

interface Kegiatan {
  id: string;
  namaKegiatan: string;
  kodeKegiatan: string;
}

const metodeOptions = [
  { value: "TRANSFER", label: "Transfer Bank" },
  { value: "CASH", label: "Tunai" },
  { value: "QRIS", label: "QRIS" },
  { value: "OTHER", label: "Lainnya" },
];

const bankOptions = [
  { value: "", label: "Pilih Bank" },
  { value: "BCA", label: "BCA" },
  { value: "BRI", label: "BRI" },
  { value: "BNI", label: "BNI" },
  { value: "MANDIRI", label: "Mandiri" },
  { value: "CIMB", label: "CIMB Niaga" },
  { value: "BSI", label: "BSI" },
  { value: "DANA", label: "DANA" },
  { value: "GOPAY", label: "GoPay" },
  { value: "OVO", label: "OVO" },
  { value: "SHOPEEPAY", label: "ShopeePay" },
];

export default function NewDonasiPage() {
  const router = useRouter();
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [loadingKegiatan, setLoadingKegiatan] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DonasiFormData>({
    resolver: zodResolver(donasiSchema),
    defaultValues: {
      metode: "TRANSFER",
    },
  });

  const watchedMetode = watch("metode");
  const watchedNominal = watch("nominal");

  useEffect(() => {
    fetchKegiatanList();
  }, []);

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

  const onSubmit = async (data: DonasiFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      let buktiUrl = null;
      if (buktiFile) {
        buktiUrl = await uploadFile(buktiFile);
        if (!buktiUrl) {
          setError("Gagal mengupload bukti transfer");
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        ...data,
        nominal: data.nominal,
        buktiUrl,
        email: data.email || undefined,
        phone: data.phone || undefined,
        bank: data.bank || undefined,
        rekening: data.rekening || undefined,
        keterangan: data.keterangan || undefined,
      };

      const res = await fetch("/api/donasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        router.push("/donasi");
      } else {
        setError(json.message || "Gagal menyimpan donasi");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiahInput = (value: number | undefined) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tambah Donasi</h1>
          <p className="text-muted-foreground">Formulir penambahan donasi baru</p>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Donatur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nama Donatur *"
              placeholder="Masukkan nama donatur"
              error={errors.namaDonatur?.message}
              {...register("namaDonatur")}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="email@donatur.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Telepon"
                placeholder="08xxx"
                {...register("phone")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Donasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  {formatRupiahInput(watchedNominal)}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Metode Pembayaran *"
                options={metodeOptions}
                {...register("metode")}
              />
              {errors.metode && (
                <p className="mt-1.5 text-sm text-destructive">{errors.metode.message}</p>
              )}
              {(watchedMetode === "TRANSFER" || !watchedMetode) && (
                <Select
                  label="Bank"
                  options={bankOptions}
                  {...register("bank")}
                />
              )}
            </div>
            {watchedMetode === "TRANSFER" && (
              <Input
                label="Nomor Rekening"
                placeholder="Masukkan nomor rekening"
                {...register("rekening")}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bukti & Keterangan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Bukti Transfer
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
                      <HandCoins className="h-5 w-5" />
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
              "Simpan Donasi"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
