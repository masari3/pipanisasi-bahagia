import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rab = await prisma.rab.findUnique({
      where: { id },
      include: {
        rabItems: true,
        kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } },
      },
    })

    if (!rab) {
      return NextResponse.json(
        { success: false, data: null, message: 'RAB not found', error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: rab,
      message: 'RAB fetched successfully',
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
    const existing = await prisma.rab.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'RAB not found', error: 'Not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { judul, status, items } = body

    let total: number = Number(existing.total)
    const data: any = {}

    if (judul !== undefined) data.judul = judul
    if (status !== undefined) data.status = status

    if (items && Array.isArray(items)) {
      await prisma.rabItem.deleteMany({ where: { rabId: id } })

      const createdItems = await Promise.all(
        items.map((item: any) =>
          prisma.rabItem.create({
            data: {
              rabId: id,
              namaItem: item.namaItem,
              kategori: item.kategori,
              volume: String(parseFloat(item.volume)),
              satuan: item.satuan,
              hargaSatuan: String(parseFloat(item.hargaSatuan)),
              jumlah: String(parseFloat(item.jumlah)),
              keterangan: item.keterangan || null,
            },
          })
        )
      )

      total = createdItems.reduce((sum, item) => sum + Number(item.jumlah), 0)
    }

    data.total = String(total)

    const rab = await prisma.rab.update({
      where: { id },
      data,
      include: { rabItems: true },
    })

    return NextResponse.json({
      success: true,
      data: rab,
      message: 'RAB updated successfully',
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
    const existing = await prisma.rab.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'RAB not found', error: 'Not found' },
        { status: 404 }
      )
    }

    await prisma.rabItem.deleteMany({ where: { rabId: id } })
    await prisma.rab.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: null,
      message: 'RAB deleted successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
