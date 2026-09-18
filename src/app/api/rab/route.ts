import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { ITEMS_PER_PAGE } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE))
    const kegiatanId = searchParams.get('kegiatanId') || ''
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    if (kegiatanId) where.kegiatanId = kegiatanId
    if (status) where.status = status

    const [data, total] = await Promise.all([
      prisma.rab.findMany({
        where,
        include: {
          rabItems: true,
          kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rab.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      message: 'RAB fetched successfully',
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, data: null, message: 'Unauthorized', error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { kegiatanId, judul, items } = body

    if (!kegiatanId || !judul || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, data: null, message: 'kegiatanId, judul, and items are required', error: 'Validation error' },
        { status: 400 }
      )
    }

    const kegiatan = await prisma.kegiatan.findUnique({ where: { id: kegiatanId } })
    if (!kegiatan) {
      return NextResponse.json(
        { success: false, data: null, message: 'Kegiatan not found', error: 'Not found' },
        { status: 404 }
      )
    }

    const total = items.reduce((sum: number, item: any) => sum + (parseFloat(item.jumlah) || 0), 0)
    const kodeRab = `RAB-${Date.now().toString().slice(-6)}`

    const rab = await prisma.rab.create({
      data: {
        kegiatanId,
        kodeRab,
        judul,
        total,
        status: 'DRAFT',
        rabItems: {
          create: items.map((item: any) => ({
            namaItem: item.namaItem,
            kategori: item.kategori,
            volume: parseFloat(item.volume),
            satuan: item.satuan,
            hargaSatuan: parseFloat(item.hargaSatuan),
            jumlah: parseFloat(item.jumlah),
            keterangan: item.keterangan || null,
          })),
        },
      },
      include: { rabItems: true },
    })

    return NextResponse.json(
      { success: true, data: rab, message: 'RAB created successfully', error: null },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
