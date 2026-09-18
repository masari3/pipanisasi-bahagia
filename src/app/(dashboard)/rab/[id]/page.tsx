"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { KATEGORI_RAB } from "@/lib/constants";
import toast from "react-hot-toast";

interface RabItemData {
  id: string;
  namaItem: string;
  kategori: string;
  volume: number;
  satuan: string;
  hargaSatuan: number;
  jumlah: number;
  keterangan: string | null;
}

interface RabDetail {
  id: string;
  kodeRab: string;
  judul: string;
  total: number;
  status: string;
  createdAt: string;
  kegiatan: { id: string; namaKegiatan: string; kodeKegiatan: string };
  rabItems: RabItemData[];
}

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" }> = {
  DRAFT: { label: "Draft", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REVISION: { label: "Revisi", variant: "destructive" },
};

const kategoriOptions = KATEGORI_RAB.map((k) => ({
  value: k.value,
  label: k.label,
}));

interface EditableItem {
  tempId: string;
  namaItem: string;
  kategori: string;
  volume: string;
  satuan: string;
  hargaSatuan: string;
  keterangan: string;
}

export default function RabDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [rab, setRab] = useState<RabDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editItems, setEditItems] = useState<EditableItem[]>([]);
  const [editJudul, setEditJudul] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRab = async () => {
      try {
        const res = await fetch(`/api/rab/${id}`);
        const json = await res.json();
        if (json.success) {
          setRab(json.data);
        } else {
          toast.error("RAB tidak ditemukan");
          router.push("/rab");
        }
      } catch {
        toast.error("Gagal memuat RAB");
      } finally {
        setLoading(false);
      }
    };
    fetchRab();
  }, [id, router]);

  const startEdit = () => {
    if (!rab) return;
    setEditJudul(rab.judul);
    setEditItems(
      rab.rabItems.map((item) => ({
        tempId: item.id,
        namaItem: item.namaItem,
        kategori: item.kategori,
        volume: String(item.volume),
        satuan: item.satuan,
        hargaSatuan: String(item.hargaSatuan),
        keterangan: item.keterangan || "",
      }))
    );
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditItems([]);
  };

  const addEditItem = () => {
    setEditItems((prev) => [
      ...prev,
      {
        tempId: `new-${Date.now()}`,
        namaItem: "",
        kategori: "MATERIAL",
        volume: "1",
        satuan: "pcs",
        hargaSatuan: "0",
        keterangan: "",
      },
    ]);
  };

  const removeEditItem = (tempId: string) => {
    setEditItems((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  const updateEditItem = (
    tempId: string,
    field: keyof EditableItem,
    value: string
  ) => {
    setEditItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
    );
  };

  const calculatedTotal = editItems.reduce((sum, item) => {
    const v = parseFloat(item.volume) || 0;
    const h = parseFloat(item.hargaSatuan) || 0;
    return sum + v * h;
  }, 0);

  const handleSave = async () => {
    if (!rab) return;
    setSaving(true);
    try {
      const items = editItems.map((item) => ({
        namaItem: item.namaItem,
        kategori: item.kategori,
        volume: item.volume,
        satuan: item.satuan,
        hargaSatuan: item.hargaSatuan,
        jumlah: String((parseFloat(item.volume) || 0) * (parseFloat(item.hargaSatuan) || 0)),
        keterangan: item.keterangan || undefined,
      }));

      const res = await fetch(`/api/rab/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul: editJudul, items }),
      });
      const json = await res.json();
      if (json.success) {
        setRab(json.data);
        setEditing(false);
        toast.success("RAB berhasil diperbarui");
      } else {
        toast.error(json.message || "Gagal memperbarui RAB");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!rab) return;
    if (!confirm("Yakin ingin menghapus item ini?")) return;

    const updatedItems = rab.rabItems
      .filter((i) => i.id !== itemId)
      .map((i) => ({
        namaItem: i.namaItem,
        kategori: i.kategori,
        volume: String(i.volume),
        satuan: i.satuan,
        hargaSatuan: String(i.hargaSatuan),
        jumlah: String(i.jumlah),
        keterangan: i.keterangan || undefined,
      }));

    try {
      const res = await fetch(`/api/rab/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updatedItems }),
      });
      const json = await res.json();
      if (json.success) {
        setRab(json.data);
        toast.success("Item berhasil dihapus");
      }
    } catch {
      toast.error("Gagal menghapus item");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!rab) return null;

  const status = statusMap[rab.status] || { label: rab.status, variant: "default" as const };

  const renderItemsTable = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">No</TableHead>
            <TableHead>Nama Item</TableHead>
            <TableHead className="hidden sm:table-cell">Kategori</TableHead>
            <TableHead className="text-right">Volume</TableHead>
            <TableHead className="hidden sm:table-cell text-right">Harga Satuan</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead className="hidden md:table-cell">Keterangan</TableHead>
            {editing && <TableHead className="w-10"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rab.rabItems.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium">{item.namaItem}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="secondary">{item.kategori}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {item.volume} {item.satuan}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-right">
                {formatRupiah(Number(item.hargaSatuan))}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatRupiah(Number(item.jumlah))}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {item.keterangan || "-"}
              </TableCell>
              {editing && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          {rab.rabItems.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={editing ? 8 : 7}
                className="h-24 text-center text-muted-foreground"
              >
                Belum ada item
              </TableCell>
            </TableRow>
          )}
          <TableRow className="font-bold">
            <TableCell colSpan={editing ? 5 : 5}>Total</TableCell>
            <TableCell className="text-right">{formatRupiah(Number(rab.total))}</TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );

  const renderEditForm = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Judul</label>
        <Input
          value={editJudul}
          onChange={(e) => setEditJudul(e.target.value)}
          placeholder="Judul RAB"
        />
      </div>

      {editItems.map((item, index) => (
        <div key={item.tempId} className="rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Item {index + 1}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={() => removeEditItem(item.tempId)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            <Input
              label="Nama Item"
              value={item.namaItem}
              onChange={(e) => updateEditItem(item.tempId, "namaItem", e.target.value)}
              placeholder="Nama item"
            />
            <Select
              label="Kategori"
              options={kategoriOptions}
              value={item.kategori}
              onChange={(e) => updateEditItem(item.tempId, "kategori", e.target.value)}
            />
            <Input
              label="Volume"
              type="number"
              value={item.volume}
              onChange={(e) => updateEditItem(item.tempId, "volume", e.target.value)}
            />
            <Input
              label="Satuan"
              value={item.satuan}
              onChange={(e) => updateEditItem(item.tempId, "satuan", e.target.value)}
              placeholder="pcs, kg, dll"
            />
            <Input
              label="Harga Satuan"
              type="number"
              value={item.hargaSatuan}
              onChange={(e) => updateEditItem(item.tempId, "hargaSatuan", e.target.value)}
            />
            <div className="flex items-end">
              <div className="w-full">
                <p className="mb-1.5 text-sm font-medium text-foreground">Jumlah</p>
                <p className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm font-medium">
                  {formatRupiah(
                    (parseFloat(item.volume) || 0) * (parseFloat(item.hargaSatuan) || 0)
                  )}
                </p>
              </div>
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <Textarea
                label="Keterangan"
                value={item.keterangan}
                onChange={(e) => updateEditItem(item.tempId, "keterangan", e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addEditItem}>
        <Plus className="h-4 w-4" />
        Tambah Item
      </Button>

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <span className="font-semibold">Total RAB</span>
        <span className="text-lg font-bold">{formatRupiah(calculatedTotal)}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rab">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{rab.kodeRab}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-muted-foreground">{rab.judul}</p>
        </div>
        {!editing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={startEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        )}
        {editing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={cancelEdit}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Daftar Item
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? renderEditForm() : renderItemsTable()}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Item</span>
                <span className="font-medium">{rab.rabItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Anggaran</span>
                <span className="font-bold text-lg">{formatRupiah(Number(rab.total))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kegiatan</span>
                <span className="font-medium">{rab.kegiatan.namaKegiatan}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
