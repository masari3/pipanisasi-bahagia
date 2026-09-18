"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { formatRupiah } from "@/lib/utils";
import { KATEGORI_RAB } from "@/lib/constants";
import toast from "react-hot-toast";

interface KegiatanOption {
  id: string;
  namaKegiatan: string;
  kodeKegiatan: string;
}

interface RabItemForm {
  tempId: string;
  namaItem: string;
  kategori: string;
  volume: string;
  satuan: string;
  hargaSatuan: string;
  keterangan: string;
}

const kategoriOptions = KATEGORI_RAB.map((k) => ({
  value: k.value,
  label: k.label,
}));

function createEmptyItem(): RabItemForm {
  return {
    tempId: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    namaItem: "",
    kategori: "MATERIAL",
    volume: "1",
    satuan: "pcs",
    hargaSatuan: "0",
    keterangan: "",
  };
}

export default function NewRabPage() {
  const router = useRouter();
  const [kegiatanList, setKegiatanList] = useState<KegiatanOption[]>([]);
  const [kegiatanId, setKegiatanId] = useState("");
  const [judul, setJudul] = useState("");
  const [items, setItems] = useState<RabItemForm[]>([createEmptyItem()]);
  const [saving, setSaving] = useState(false);
  const [loadingKegiatan, setLoadingKegiatan] = useState(true);

  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const res = await fetch("/api/kegiatan?limit=100");
        const json = await res.json();
        if (json.success) {
          setKegiatanList(json.data);
        }
      } catch {
        toast.error("Gagal memuat data kegiatan");
      } finally {
        setLoadingKegiatan(false);
      }
    };
    fetchKegiatan();
  }, []);

  const addItem = () => setItems((prev) => [...prev, createEmptyItem()]);

  const removeItem = (tempId: string) => {
    if (items.length <= 1) {
      toast.error("Minimal harus ada 1 item");
      return;
    }
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  const updateItem = (tempId: string, field: keyof RabItemForm, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
    );
  };

  const calculatedItems = items.map((item) => {
    const volume = parseFloat(item.volume) || 0;
    const hargaSatuan = parseFloat(item.hargaSatuan) || 0;
    return { ...item, jumlah: volume * hargaSatuan };
  });

  const total = calculatedItems.reduce((sum, item) => sum + item.jumlah, 0);

  const handleSubmit = async () => {
    if (!kegiatanId) {
      toast.error("Pilih kegiatan terlebih dahulu");
      return;
    }
    if (!judul.trim()) {
      toast.error("Judul harus diisi");
      return;
    }
    if (items.some((item) => !item.namaItem.trim())) {
      toast.error("Semua item harus diisi namanya");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        kegiatanId,
        judul,
        items: items.map((item) => ({
          namaItem: item.namaItem,
          kategori: item.kategori,
          volume: item.volume,
          satuan: item.satuan,
          hargaSatuan: item.hargaSatuan,
          jumlah: String((parseFloat(item.volume) || 0) * (parseFloat(item.hargaSatuan) || 0)),
          keterangan: item.keterangan || undefined,
        })),
      };

      const res = await fetch("/api/rab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("RAB berhasil dibuat");
        router.push(`/rab/${json.data.id}`);
      } else {
        toast.error(json.message || "Gagal membuat RAB");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rab">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buat RAB Baru</h1>
          <p className="text-muted-foreground">Tambah rencana anggaran biaya baru</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi RAB</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingKegiatan ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Memuat kegiatan...
                </div>
              ) : (
                <Select
                  label="Kegiatan"
                  options={kegiatanList.map((k) => ({
                    value: k.id,
                    label: `${k.kodeKegiatan} - ${k.namaKegiatan}`,
                  }))}
                  value={kegiatanId}
                  onChange={(e) => setKegiatanId(e.target.value)}
                  placeholder="Pilih kegiatan"
                />
              )}
              <Textarea
                label="Judul RAB"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Masukkan judul RAB"
                rows={2}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Item Anggaran</CardTitle>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-3.5 w-3.5" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {calculatedItems.map((item, index) => (
                <div key={item.tempId} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeItem(item.tempId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="sm:col-span-2 lg:col-span-3">
                      <Input
                        label="Nama Item"
                        value={item.namaItem}
                        onChange={(e) => updateItem(item.tempId, "namaItem", e.target.value)}
                        placeholder="Contoh: Pipa PVC 2 inch"
                      />
                    </div>
                    <Select
                      label="Kategori"
                      options={kategoriOptions}
                      value={item.kategori}
                      onChange={(e) => updateItem(item.tempId, "kategori", e.target.value)}
                    />
                    <Input
                      label="Volume"
                      type="number"
                      value={item.volume}
                      onChange={(e) => updateItem(item.tempId, "volume", e.target.value)}
                      min="0"
                    />
                    <Input
                      label="Satuan"
                      value={item.satuan}
                      onChange={(e) => updateItem(item.tempId, "satuan", e.target.value)}
                      placeholder="pcs, kg, meter"
                    />
                    <Input
                      label="Harga Satuan (Rp)"
                      type="number"
                      value={item.hargaSatuan}
                      onChange={(e) => updateItem(item.tempId, "hargaSatuan", e.target.value)}
                      min="0"
                    />
                    <div className="flex items-end">
                      <div className="w-full">
                        <p className="mb-1.5 text-sm font-medium text-foreground">Jumlah</p>
                        <p className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm font-bold">
                          {formatRupiah(item.jumlah)}
                        </p>
                      </div>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <Textarea
                        label="Keterangan"
                        value={item.keterangan}
                        onChange={(e) => updateItem(item.tempId, "keterangan", e.target.value)}
                        placeholder="Keterangan opsional"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Ringkasan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jumlah Item</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal per Item</span>
                </div>
                {calculatedItems.map((item, i) => (
                  <div key={item.tempId} className="flex justify-between text-xs text-muted-foreground">
                    <span className="truncate">{item.namaItem || `Item ${i + 1}`}</span>
                    <span>{formatRupiah(item.jumlah)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">{formatRupiah(total)}</span>
                </div>
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Menyimpan..." : "Buat RAB"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
