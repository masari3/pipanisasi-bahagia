import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agenda = await prisma.agenda.findUnique({
      where: { id },
      include: {
        kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } },
      },
    })

    if (!agenda) {
      return NextResponse.json(
        { success: false, data: null, message: 'Agenda not found', error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: agenda,
      message: 'Agenda fetched successfully',
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
    const existing = await prisma.agenda.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Agenda not found', error: 'Not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { judul, tanggal, waktuMulai, waktuSelesai, lokasi, deskripsi, status: newStatus, penanggungJawab } = body

    const data: any = {}
    if (judul !== undefined) data.judul = judul
    if (tanggal !== undefined) data.tanggal = new Date(tanggal)
    if (waktuMulai !== undefined) data.waktuMulai = waktuMulai ? new Date(waktuMulai) : null
    if (waktuSelesai !== undefined) data.waktuSelesai = waktuSelesai ? new Date(waktuSelesai) : null
    if (lokasi !== undefined) data.lokasi = lokasi
    if (deskripsi !== undefined) data.deskripsi = deskripsi
    if (newStatus !== undefined) data.status = newStatus
    if (penanggungJawab !== undefined) data.penanggungJawab = penanggungJawab

    const agenda = await prisma.agenda.update({ where: { id }, data })

    return NextResponse.json({
      success: true,
      data: agenda,
      message: 'Agenda updated successfully',
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
    const existing = await prisma.agenda.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Agenda not found', error: 'Not found' },
        { status: 404 }
      )
    }

    await prisma.agenda.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Agenda deleted successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
