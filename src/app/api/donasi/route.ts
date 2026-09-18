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
    const tanggalMulai = searchParams.get('tanggalMulai') || ''
    const tanggalAkhir = searchParams.get('tanggalAkhir') || ''
    const nominalMin = searchParams.get('nominalMin') || ''
    const nominalMax = searchParams.get('nominalMax') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    if (kegiatanId) where.kegiatanId = kegiatanId
    if (status) where.status = status
    if (tanggalMulai || tanggalAkhir) {
      where.tanggal = {}
      if (tanggalMulai) where.tanggal.gte = new Date(tanggalMulai)
      if (tanggalAkhir) where.tanggal.lte = new Date(tanggalAkhir)
    }
    if (nominalMin || nominalMax) {
      where.nominal = {}
      if (nominalMin) where.nominal.gte = parseFloat(nominalMin)
      if (nominalMax) where.nominal.lte = parseFloat(nominalMax)
    }

    const [data, total] = await Promise.all([
      prisma.donasi.findMany({
        where,
        include: {
          kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } },
          donatur: { select: { id: true, nama: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.donasi.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      message: 'Donasi fetched successfully',
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
    const body = await request.json()
    const { kegiatanId, namaDonatur, donaturId, nominal, metode, bank, rekening, buktiUrl, keterangan } = body

    if (!kegiatanId || !namaDonatur || !nominal || !metode) {
      return NextResponse.json(
        { success: false, data: null, message: 'kegiatanId, namaDonatur, nominal, and metode are required', error: 'Validation error' },
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

    const donasi = await prisma.donasi.create({
      data: {
        kegiatanId,
        namaDonatur,
        donaturId: donaturId || null,
        nominal: parseFloat(nominal),
        metode,
        bank,
        rekening,
        buktiUrl,
        keterangan,
        status: 'PENDING',
      },
    })

    return NextResponse.json(
      { success: true, data: donasi, message: 'Donasi created successfully', error: null },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
