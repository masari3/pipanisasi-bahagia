"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  X,
  Download,
  FileText,
  Calendar,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

interface ProposalDetail {
  id: string;
  judul: string;
  isi: string | null;
  fileUrl: string | null;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  kegiatan: { id: string; namaKegiatan: string; kodeKegiatan: string };
}

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" }> = {
  DRAFT: { label: "Draft", variant: "warning" },
  SUBMITTED: { label: "Submitted", variant: "info" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await fetch(`/api/proposal/${id}`);
        const json = await res.json();
        if (json.success) {
          setProposal(json.data);
        } else {
          toast.error("Proposal tidak ditemukan");
          router.push("/proposal");
        }
      } catch {
        toast.error("Gagal memuat proposal");
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id, router]);

  const handleStatusChange = async (newStatus: "APPROVED" | "REJECTED") => {
    if (!confirm(`Yakin ingin ${newStatus === "APPROVED" ? "menyetujui" : "menolak"} proposal ini?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/proposal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setProposal((prev) =>
          prev ? { ...prev, status: newStatus, reviewedAt: new Date().toISOString() } : prev
        );
        toast.success(`Proposal berhasil ${newStatus === "APPROVED" ? "disetujui" : "ditolak"}`);
      } else {
        toast.error(json.message || "Gagal mengubah status");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!proposal) return null;

  const status = statusMap[proposal.status] || { label: proposal.status, variant: "default" as const };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/proposal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Detail Proposal</h1>
          <p className="text-muted-foreground">Lihat detail proposal kegiatan</p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{proposal.judul}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>
                  {proposal.kegiatan.namaKegiatan} ({proposal.kegiatan.kodeKegiatan})
                </span>
              </div>

              {proposal.isi && (
                <div className="prose prose-sm max-w-none rounded-lg border bg-muted/30 p-4">
                  <div className="whitespace-pre-wrap text-sm">{proposal.isi}</div>
                </div>
              )}

              {!proposal.isi && (
                <p className="text-sm text-muted-foreground italic">
                  Tidak ada isi proposal
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Dibuat</p>
                  <p className="font-medium">{formatDate(proposal.createdAt)}</p>
                </div>
              </div>
              {proposal.submittedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Dikirim</p>
                    <p className="font-medium">{formatDateTime(proposal.submittedAt)}</p>
                  </div>
                </div>
              )}
              {proposal.reviewedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Direview</p>
                    <p className="font-medium">{formatDateTime(proposal.reviewedAt)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {proposal.fileUrl && (
            <Card>
              <CardContent className="p-4">
                <a href={proposal.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

          {proposal.status === "SUBMITTED" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aksi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  disabled={actionLoading}
                  onClick={() => handleStatusChange("APPROVED")}
                >
                  <Check className="h-4 w-4" />
                  Setujui
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={actionLoading}
                  onClick={() => handleStatusChange("REJECTED")}
                >
                  <X className="h-4 w-4" />
                  Tolak
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
