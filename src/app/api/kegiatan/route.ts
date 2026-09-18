import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE))
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const jenisKegiatan = searchParams.get('jenisKegiatan') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { namaKegiatan: { contains: search, mode: 'insensitive' } },
        { kodeKegiatan: { contains: search, mode: 'insensitive' } },
        { lokasi: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status
    if (jenisKegiatan) where.jenisKegiatan = jenisKegiatan

    const [data, total] = await Promise.all([
      prisma.kegiatan.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { donasis: true, pengeluarans: true } },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.kegiatan.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      message: 'Kegiatan fetched successfully',
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

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, message: 'User ID not found in session', error: 'Session error' },
        { status: 401 }
      )
    }

    const role = (session.user as any).role
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, data: null, message: 'Forbidden', error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      namaKegiatan, jenisKegiatan, deskripsi, latarBelakang, tujuan,
      lokasi, alamat, desa, kecamatan, kabupaten, provinsi,
      latitude, longitude, tanggalMulai, tanggalSelesai,
      targetDana, jumlahPenerimaManfaat, jumlahMasjid, jumlahKk,
      panjangPipa, sumberAir, status,
    } = body

    if (!namaKegiatan || !jenisKegiatan) {
      return NextResponse.json(
        { success: false, data: null, message: 'namaKegiatan and jenisKegiatan are required', error: 'Validation error' },
        { status: 400 }
      )
    }

    const baseSlug = slugify(namaKegiatan)
    let slug = baseSlug
    let counter = 1
    while (await prisma.kegiatan.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const kodeKegiatan = `KG-${Date.now().toString().slice(-6)}`

    const kegiatan = await prisma.kegiatan.create({
      data: {
        kodeKegiatan,
        namaKegiatan,
        slug,
        jenisKegiatan,
        deskripsi,
        latarBelakang,
        tujuan,
        lokasi,
        alamat,
        desa,
        kecamatan,
        kabupaten,
        provinsi,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : null,
        tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
        targetDana: targetDana ? parseFloat(targetDana) : null,
        jumlahPenerimaManfaat: jumlahPenerimaManfaat ? parseInt(jumlahPenerimaManfaat) : null,
        jumlahMasjid: jumlahMasjid ? parseInt(jumlahMasjid) : null,
        jumlahKk: jumlahKk ? parseInt(jumlahKk) : null,
        panjangPipa: panjangPipa ? parseFloat(panjangPipa) : null,
        sumberAir,
        status: status || 'DRAFT',
        createdBy: userId,
      },
    })

    return NextResponse.json(
      { success: true, data: kegiatan, message: 'Kegiatan created successfully', error: null },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
