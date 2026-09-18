import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const donasi = await prisma.donasi.findUnique({
      where: { id },
      include: {
        kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } },
        donatur: true,
      },
    })

    if (!donasi) {
      return NextResponse.json(
        { success: false, data: null, message: 'Donasi not found', error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: donasi,
      message: 'Donasi fetched successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, data: null, message: 'Unauthorized', error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const existing = await prisma.donasi.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Donasi not found', error: 'Not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status: newStatus, keterangan } = body

    const data: any = {}
    if (newStatus) data.status = newStatus
    if (keterangan !== undefined) data.keterangan = keterangan

    if (newStatus === 'VERIFIED') {
      data.verifiedAt = new Date()
      data.verifiedBy = session.user.id

      await prisma.kegiatan.update({
        where: { id: existing.kegiatanId },
        data: {
          danaTerkumpul: { increment: Number(existing.nominal) },
        },
      })
    }

    if (newStatus === 'REJECTED') {
      data.verifiedAt = new Date()
      data.verifiedBy = session.user.id
    }

    const donasi = await prisma.donasi.update({ where: { id }, data })

    return NextResponse.json({
      success: true,
      data: donasi,
      message: 'Donasi updated successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
