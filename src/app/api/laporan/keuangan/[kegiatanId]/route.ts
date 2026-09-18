import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kegiatanId: string }> }
) {
  try {
    const { kegiatanId } = await params

    const kegiatan = await prisma.kegiatan.findUnique({ where: { id: kegiatanId } })
    if (!kegiatan) {
      return NextResponse.json(
        { success: false, data: null, message: 'Kegiatan not found', error: 'Not found' },
        { status: 404 }
      )
    }

    const [donasiBySumber, pengeluaranByKategori, totalDonasi, totalPengeluaran] = await Promise.all([
      prisma.donasi.groupBy({
        by: ['metode'],
        where: { kegiatanId, status: 'VERIFIED' },
        _sum: { nominal: true },
        _count: { id: true },
      }),

      prisma.pengeluaran.groupBy({
        by: ['kategori'],
        where: { kegiatanId, status: 'VERIFIED' },
        _sum: { nominal: true },
        _count: { id: true },
      }),

      prisma.donasi.aggregate({
        where: { kegiatanId, status: 'VERIFIED' },
        _sum: { nominal: true },
        _count: { id: true },
      }),

      prisma.pengeluaran.aggregate({
        where: { kegiatanId, status: 'VERIFIED' },
        _sum: { nominal: true },
        _count: { id: true },
      }),
    ])

    const totalDanaMasuk = Number(totalDonasi._sum.nominal || 0)
    const totalDanaKeluar = Number(totalPengeluaran._sum.nominal || 0)

    return NextResponse.json({
      success: true,
      data: {
        kegiatan: {
          id: kegiatan.id,
          kodeKegiatan: kegiatan.kodeKegiatan,
          namaKegiatan: kegiatan.namaKegiatan,
          targetDana: kegiatan.targetDana,
          danaTerkumpul: kegiatan.danaTerkumpul,
          totalPengeluaran: kegiatan.totalPengeluaran,
          saldo: kegiatan.saldo,
        },
        ringkasan: {
          totalDanaMasuk,
          totalDanaKeluar,
          saldo: totalDanaMasuk - totalDanaKeluar,
          jumlahDonasi: totalDonasi._count.id,
          jumlahPengeluaran: totalPengeluaran._count.id,
        },
        danaMasukPerSumber: donasiBySumber.map((item) => ({
          sumber: item.metode,
          total: Number(item._sum.nominal || 0),
          jumlah: item._count.id,
        })),
        pengeluaranPerKategori: pengeluaranByKategori.map((item) => ({
          kategori: item.kategori,
          total: Number(item._sum.nominal || 0),
          jumlah: item._count.id,
        })),
      },
      message: 'Financial report fetched successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
