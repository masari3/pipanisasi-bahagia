import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } } },
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, data: null, message: 'Proposal not found', error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: proposal,
      message: 'Proposal fetched successfully',
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
    const existing = await prisma.proposal.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Proposal not found', error: 'Not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { judul, isi, fileUrl, status } = body

    const data: any = {}
    if (judul !== undefined) data.judul = judul
    if (isi !== undefined) data.isi = isi
    if (fileUrl !== undefined) data.fileUrl = fileUrl
    if (status) {
      data.status = status
      if (status === 'SUBMITTED') data.submittedAt = new Date()
      if (status === 'APPROVED' || status === 'REJECTED') {
        data.reviewedAt = new Date()
        data.reviewedBy = session.user.id
      }
    }

    const proposal = await prisma.proposal.update({ where: { id }, data })

    return NextResponse.json({
      success: true,
      data: proposal,
      message: 'Proposal updated successfully',
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
    const existing = await prisma.proposal.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Proposal not found', error: 'Not found' },
        { status: 404 }
      )
    }

    await prisma.proposal.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Proposal deleted successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
