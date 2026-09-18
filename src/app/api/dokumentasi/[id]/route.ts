import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const dokumentasi = await prisma.dokumentasi.findUnique({
      where: { id },
      include: {
        kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } },
      },
    })

    if (!dokumentasi) {
      return NextResponse.json(
        { success: false, data: null, message: 'Dokumentasi not found', error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: dokumentasi,
      message: 'Dokumentasi fetched successfully',
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
    const existing = await prisma.dokumentasi.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Dokumentasi not found', error: 'Not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { judul, deskripsi, fileUrl, thumbnailUrl, kategori, caption } = body

    const data: any = {}
    if (judul !== undefined) data.judul = judul
    if (deskripsi !== undefined) data.deskripsi = deskripsi
    if (fileUrl !== undefined) data.fileUrl = fileUrl
    if (thumbnailUrl !== undefined) data.thumbnailUrl = thumbnailUrl
    if (kategori !== undefined) data.kategori = kategori
    if (caption !== undefined) data.caption = caption

    const dokumentasi = await prisma.dokumentasi.update({ where: { id }, data })

    return NextResponse.json({
      success: true,
      data: dokumentasi,
      message: 'Dokumentasi updated successfully',
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
    const existing = await prisma.dokumentasi.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Dokumentasi not found', error: 'Not found' },
        { status: 404 }
      )
    }

    await prisma.dokumentasi.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Dokumentasi deleted successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
