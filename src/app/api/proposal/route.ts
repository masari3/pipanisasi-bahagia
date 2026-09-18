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
    const skip = (page - 1) * limit

    const where: any = {}
    if (kegiatanId) where.kegiatanId = kegiatanId
    if (status) where.status = status

    const [data, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        include: { kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.proposal.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      message: 'Proposals fetched successfully',
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

    const body = await request.json()
    const { kegiatanId, judul, isi, fileUrl } = body

    if (!kegiatanId || !judul) {
      return NextResponse.json(
        { success: false, data: null, message: 'kegiatanId and judul are required', error: 'Validation error' },
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

    const proposal = await prisma.proposal.create({
      data: {
        kegiatanId,
        judul,
        isi,
        fileUrl,
        status: 'DRAFT',
      },
    })

    return NextResponse.json(
      { success: true, data: proposal, message: 'Proposal created successfully', error: null },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
