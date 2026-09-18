import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const donatur = await prisma.donatur.findUnique({
      where: { id },
      include: {
        donasis: {
          include: { kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!donatur) {
      return NextResponse.json(
        { success: false, data: null, message: 'Donatur not found', error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: donatur,
      message: 'Donatur fetched successfully',
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
    const existing = await prisma.donatur.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Donatur not found', error: 'Not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { nama, email, phone, alamat } = body

    const data: any = {}
    if (nama !== undefined) data.nama = nama
    if (email !== undefined) data.email = email
    if (phone !== undefined) data.phone = phone
    if (alamat !== undefined) data.alamat = alamat

    const donatur = await prisma.donatur.update({ where: { id }, data })

    return NextResponse.json({
      success: true,
      data: donatur,
      message: 'Donatur updated successfully',
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
    const existing = await prisma.donatur.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Donatur not found', error: 'Not found' },
        { status: 404 }
      )
    }

    await prisma.donatur.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Donatur deleted successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
