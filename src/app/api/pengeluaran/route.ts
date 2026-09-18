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
    const kategori = searchParams.get('kategori') || ''
    const tanggalMulai = searchParams.get('tanggalMulai') || ''
    const tanggalAkhir = searchParams.get('tanggalAkhir') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    if (kegiatanId) where.kegiatanId = kegiatanId
    if (status) where.status = status
    if (kategori) where.kategori = kategori
    if (tanggalMulai || tanggalAkhir) {
      where.tanggal = {}
      if (tanggalMulai) where.tanggal.gte = new Date(tanggalMulai)
      if (tanggalAkhir) where.tanggal.lte = new Date(tanggalAkhir)
    }

    const [data, total] = await Promise.all([
      prisma.pengeluaran.findMany({
        where,
        include: {
          kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pengeluaran.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      message: 'Pengeluaran fetched successfully',
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

    const role = (session.user as any).role
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && role !== 'BENDAHARA' && role !== 'OPERATOR') {
      return NextResponse.json(
        { success: false, data: null, message: 'Forbidden', error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { kegiatanId, kategori, deskripsi, nominal, vendor, buktiUrl, keterangan } = body

    if (!kegiatanId || !kategori || !nominal) {
      return NextResponse.json(
        { success: false, data: null, message: 'kegiatanId, kategori, and nominal are required', error: 'Validation error' },
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

    const nominalNum = parseFloat(nominal)
    const currentSaldo = Number(kegiatan.saldo)

    if (nominalNum > currentSaldo && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, data: null, message: 'Insufficient balance', error: 'Saldo tidak mencukupi' },
        { status: 400 }
      )
    }

    const nomorTransaksi = `TRX-${Date.now().toString().slice(-8)}`

    const pengeluaran = await prisma.pengeluaran.create({
      data: {
        kegiatanId,
        nomorTransaksi,
        kategori,
        deskripsi,
        nominal: nominalNum,
        vendor,
        buktiUrl,
        keterangan,
        status: 'PENDING',
      },
    })

    await prisma.kegiatan.update({
      where: { id: kegiatanId },
      data: {
        totalPengeluaran: { increment: nominalNum },
        saldo: { decrement: nominalNum },
      },
    })

    return NextResponse.json(
      { success: true, data: pengeluaran, message: 'Pengeluaran created successfully', error: null },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
