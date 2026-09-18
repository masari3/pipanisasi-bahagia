import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const laporan = await prisma.laporan.findUnique({
      where: { id },
      include: {
        kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    })

    if (!laporan) {
      return NextResponse.json(
        { success: false, data: null, message: 'Laporan not found', error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: laporan,
      message: 'Laporan fetched successfully',
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
    const existing = await prisma.laporan.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Laporan not found', error: 'Not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { judul, isi, tipeLaporan, fileUrl, status: newStatus } = body

    const data: any = {}
    if (judul !== undefined) data.judul = judul
    if (isi !== undefined) data.isi = isi
    if (tipeLaporan !== undefined) data.tipeLaporan = tipeLaporan
    if (fileUrl !== undefined) data.fileUrl = fileUrl
    if (newStatus) {
      data.status = newStatus
      if (newStatus === 'PUBLISHED') data.publishedAt = new Date()
    }

    const laporan = await prisma.laporan.update({ where: { id }, data })

    return NextResponse.json({
      success: true,
      data: laporan,
      message: 'Laporan updated successfully',
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
    const existing = await prisma.laporan.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Laporan not found', error: 'Not found' },
        { status: 404 }
      )
    }

    await prisma.laporan.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Laporan deleted successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
