import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ITEMS_PER_PAGE } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE))
    const kategori = searchParams.get('kategori') || ''
    const kegiatanId = searchParams.get('kegiatanId') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    if (kategori) where.kategori = kategori
    if (kegiatanId) where.kegiatanId = kegiatanId

    const [data, total] = await Promise.all([
      prisma.dokumentasi.findMany({
        where,
        select: {
          id: true,
          judul: true,
          deskripsi: true,
          fileUrl: true,
          thumbnailUrl: true,
          tanggal: true,
          kategori: true,
          caption: true,
          kegiatan: { select: { id: true, namaKegiatan: true, slug: true } },
        },
        skip,
        take: limit,
        orderBy: { tanggal: 'desc' },
      }),
      prisma.dokumentasi.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      message: 'Gallery fetched successfully',
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
