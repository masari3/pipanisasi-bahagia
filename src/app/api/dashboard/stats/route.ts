import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, data: null, message: 'Unauthorized', error: 'Authentication required' },
        { status: 401 }
      )
    }

    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)

    const [
      totalKegiatan,
      kegiatanAktif,
      kegiatanSelesai,
      donasiAgg,
      pengeluaranAgg,
      totalDonatur,
      totalPenerimaManfaat,
      totalTitikPipa,
      danaMasukPerBulan,
      danaKeluarPerBulan,
      kegiatanPerStatus,
    ] = await Promise.all([
      prisma.kegiatan.count({ where: { status: { not: 'ARSIP' } } }),
      prisma.kegiatan.count({ where: { status: { in: ['PROPOSAL', 'PENGGALANGAN_DANA', 'PELAKSANAAN'] } } }),
      prisma.kegiatan.count({ where: { status: 'SELESAI' } }),
      prisma.donasi.aggregate({ where: { status: 'VERIFIED' }, _sum: { nominal: true } }),
      prisma.pengeluaran.aggregate({ where: { status: 'VERIFIED' }, _sum: { nominal: true } }),
      prisma.donatur.count(),
      prisma.kegiatan.aggregate({ where: { status: 'SELESAI' }, _sum: { jumlahPenerimaManfaat: true } }),
      prisma.kegiatan.aggregate({ where: { status: 'SELESAI' }, _sum: { panjangPipa: true } }),

      prisma.$queryRaw`
        SELECT 
          TO_CHAR(d."tanggal", 'YYYY-MM') as bulan,
          COALESCE(SUM(d.nominal), 0) as total
        FROM donasis d
        WHERE d.status = 'VERIFIED' AND d."tanggal" >= ${twelveMonthsAgo}
        GROUP BY TO_CHAR(d."tanggal", 'YYYY-MM')
        ORDER BY bulan ASC
      `,

      prisma.$queryRaw`
        SELECT 
          TO_CHAR(p."tanggal", 'YYYY-MM') as bulan,
          COALESCE(SUM(p.nominal), 0) as total
        FROM pengeluarans p
        WHERE p.status = 'VERIFIED' AND p."tanggal" >= ${twelveMonthsAgo}
        GROUP BY TO_CHAR(p."tanggal", 'YYYY-MM')
        ORDER BY bulan ASC
      `,

      prisma.kegiatan.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { status: { not: 'ARSIP' } },
      }),
    ])

    const totalDonasi = Number(donasiAgg._sum.nominal || 0)
    const totalPengeluaran = Number(pengeluaranAgg._sum.nominal || 0)

    return NextResponse.json({
      success: true,
      data: {
        totalKegiatan,
        kegiatanAktif,
        kegiatanSelesai,
        totalDonasi,
        totalPengeluaran,
        saldo: totalDonasi - totalPengeluaran,
        totalDonatur,
        totalPenerimaManfaat: Number(totalPenerimaManfaat._sum.jumlahPenerimaManfaat || 0),
        totalTitikPipa: Number(totalTitikPipa._sum.panjangPipa || 0),
        danaMasukPerBulan,
        danaKeluarPerBulan,
        kegiatanPerStatus: kegiatanPerStatus.map((item) => ({
          status: item.status,
          count: item._count.id,
        })),
      },
      message: 'Dashboard stats fetched successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
