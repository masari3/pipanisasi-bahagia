import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ITEMS_PER_PAGE } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE))
    const search = searchParams.get('search') || ''
    const jenisKegiatan = searchParams.get('jenisKegiatan') || ''
    const skip = (page - 1) * limit

    const where: any = {
      status: { notIn: ['DRAFT', 'ARSIP'] },
    }

    if (search) {
      where.OR = [
        { namaKegiatan: { contains: search, mode: 'insensitive' } },
        { lokasi: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (jenisKegiatan) where.jenisKegiatan = jenisKegiatan

    const [data, total] = await Promise.all([
      prisma.kegiatan.findMany({
        where,
        select: {
          id: true,
          kodeKegiatan: true,
          namaKegiatan: true,
          slug: true,
          jenisKegiatan: true,
          deskripsi: true,
          lokasi: true,
          alamat: true,
          tanggalMulai: true,
          tanggalSelesai: true,
          status: true,
          targetDana: true,
          danaTerkumpul: true,
          jumlahPenerimaManfaat: true,
          panjangPipa: true,
          sumberAir: true,
          createdAt: true,
          _count: { select: { donasis: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.kegiatan.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      message: 'Public kegiatan fetched successfully',
      error: null,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
