import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pengeluaran = await prisma.pengeluaran.findUnique({
      where: { id },
      include: {
        kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } },
      },
    })

    if (!pengeluaran) {
      return NextResponse.json(
        { success: false, data: null, message: 'Pengeluaran not found', error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: pengeluaran,
      message: 'Pengeluaran fetched successfully',
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
    const existing = await prisma.pengeluaran.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Pengeluaran not found', error: 'Not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { kategori, deskripsi, nominal, vendor, buktiUrl, keterangan, status: newStatus } = body

    const data: any = {}
    if (kategori !== undefined) data.kategori = kategori
    if (deskripsi !== undefined) data.deskripsi = deskripsi
    if (nominal !== undefined) data.nominal = parseFloat(nominal)
    if (vendor !== undefined) data.vendor = vendor
    if (buktiUrl !== undefined) data.buktiUrl = buktiUrl
    if (keterangan !== undefined) data.keterangan = keterangan
    if (newStatus) {
      data.status = newStatus
      if (newStatus === 'VERIFIED') {
        data.verifiedAt = new Date()
        data.verifiedBy = session.user.id
      }
      if (newStatus === 'REJECTED') {
        data.verifiedAt = new Date()
        data.verifiedBy = session.user.id
      }
    }

    const pengeluaran = await prisma.pengeluaran.update({ where: { id }, data })

    return NextResponse.json({
      success: true,
      data: pengeluaran,
      message: 'Pengeluaran updated successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const existing = await prisma.pengeluaran.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Pengeluaran not found', error: 'Not found' },
        { status: 404 }
      )
    }

    if (existing.status === 'VERIFIED') {
      await prisma.kegiatan.update({
        where: { id: existing.kegiatanId },
        data: {
          totalPengeluaran: { decrement: Number(existing.nominal) },
          saldo: { increment: Number(existing.nominal) },
        },
      })
    }

    await prisma.pengeluaran.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Pengeluaran deleted successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
