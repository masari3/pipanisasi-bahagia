import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const kegiatan = await prisma.kegiatan.findUnique({
      where: { slug },
      select: {
        id: true,
        kodeKegiatan: true,
        namaKegiatan: true,
        slug: true,
        jenisKegiatan: true,
        deskripsi: true,
        latarBelakang: true,
        tujuan: true,
        lokasi: true,
        alamat: true,
        desa: true,
        kecamatan: true,
        kabupaten: true,
        provinsi: true,
        latitude: true,
        longitude: true,
        tanggalMulai: true,
        tanggalSelesai: true,
        status: true,
        targetDana: true,
        danaTerkumpul: true,
        totalPengeluaran: true,
        saldo: true,
        jumlahPenerimaManfaat: true,
        jumlahMasjid: true,
        jumlahKk: true,
        panjangPipa: true,
        sumberAir: true,
        createdAt: true,
        _count: { select: { donasis: true, dokumentasis: true } },
        dokumentasis: {
          select: {
            id: true,
            judul: true,
            fileUrl: true,
            thumbnailUrl: true,
            kategori: true,
            tanggal: true,
          },
          orderBy: { tanggal: 'desc' },
          take: 10,
        },
      },
    })

    if (!kegiatan) {
      return NextResponse.json(
        { success: false, data: null, message: 'Kegiatan not found', error: 'Not found' },
        { status: 404 }
      )
    }

    if (kegiatan.status === 'DRAFT' || kegiatan.status === 'ARSIP') {
      return NextResponse.json(
        { success: false, data: null, message: 'Kegiatan not available', error: 'Not available' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: kegiatan,
      message: 'Kegiatan fetched successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
