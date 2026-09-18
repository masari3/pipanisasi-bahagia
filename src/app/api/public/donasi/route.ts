import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

    if (kegiatan.status === 'DRAFT' || kegiatan.status === 'ARSIP') {
      return NextResponse.json(
        { success: false, data: null, message: 'Kegiatan not accepting donations', error: 'Not available' },
        { status: 400 }
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
      { success: true, data: donasi, message: 'Donasi submitted successfully', error: null },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
