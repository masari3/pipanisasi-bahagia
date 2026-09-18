import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        proposals: true,
        rabs: { include: { rabItems: true } },
        _count: { select: { donasis: true, pengeluarans: true } },
      },
    })

    if (!kegiatan) {
      return NextResponse.json(
        { success: false, data: null, message: 'Kegiatan not found', error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: kegiatan,
      message: 'Kegiatan fetched successfully',
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
    const existing = await prisma.kegiatan.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Kegiatan not found', error: 'Not found' },
        { status: 404 }
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

    let slug = existing.slug
    if (namaKegiatan && namaKegiatan !== existing.namaKegiatan) {
      const baseSlug = slugify(namaKegiatan)
      slug = baseSlug
      let counter = 1
      while (await prisma.kegiatan.findFirst({ where: { slug, id: { not: id } } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    const kegiatan = await prisma.kegiatan.update({
      where: { id },
      data: {
        ...(namaKegiatan && { namaKegiatan }),
        ...(slug !== existing.slug && { slug }),
        ...(jenisKegiatan && { jenisKegiatan }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(latarBelakang !== undefined && { latarBelakang }),
        ...(tujuan !== undefined && { tujuan }),
        ...(lokasi !== undefined && { lokasi }),
        ...(alamat !== undefined && { alamat }),
        ...(desa !== undefined && { desa }),
        ...(kecamatan !== undefined && { kecamatan }),
        ...(kabupaten !== undefined && { kabupaten }),
        ...(provinsi !== undefined && { provinsi }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(tanggalMulai !== undefined && { tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : null }),
        ...(tanggalSelesai !== undefined && { tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null }),
        ...(targetDana !== undefined && { targetDana: targetDana ? parseFloat(targetDana) : null }),
        ...(jumlahPenerimaManfaat !== undefined && { jumlahPenerimaManfaat: jumlahPenerimaManfaat ? parseInt(jumlahPenerimaManfaat) : null }),
        ...(jumlahMasjid !== undefined && { jumlahMasjid: jumlahMasjid ? parseInt(jumlahMasjid) : null }),
        ...(jumlahKk !== undefined && { jumlahKk: jumlahKk ? parseInt(jumlahKk) : null }),
        ...(panjangPipa !== undefined && { panjangPipa: panjangPipa ? parseFloat(panjangPipa) : null }),
        ...(sumberAir !== undefined && { sumberAir }),
        ...(status && { status }),
      },
    })

    return NextResponse.json({
      success: true,
      data: kegiatan,
      message: 'Kegiatan updated successfully',
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
    const existing = await prisma.kegiatan.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'Kegiatan not found', error: 'Not found' },
        { status: 404 }
      )
    }

    await prisma.kegiatan.update({
      where: { id },
      data: { status: 'ARSIP' },
    })

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Kegiatan archived successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
