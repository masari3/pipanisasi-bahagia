import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { ITEMS_PER_PAGE } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, data: null, message: 'Unauthorized', error: 'Authentication required' },
        { status: 401 }
      )
    }

    const role = (session.user as any).role
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, data: null, message: 'Forbidden', error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE))
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            select: { role: { select: { id: true, name: true } } },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      message: 'Users fetched successfully',
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

    const role = (session.user as any).role
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, data: null, message: 'Forbidden', error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, password, phone, roleId, roleName } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, data: null, message: 'name and email are required', error: 'Validation error' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, data: null, message: 'Email already registered', error: 'Duplicate email' },
        { status: 409 }
      )
    }

    const bcrypt = await import('bcryptjs')
    const hashedPassword = password ? await bcrypt.hash(password, 12) : null

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        userRoles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: roleName || 'DONATUR' },
                create: { name: roleName || 'DONATUR', description: `Role ${roleName || 'DONATUR'}` },
              },
            },
          },
        },
      },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    })

    return NextResponse.json(
      { success: true, data: user, message: 'User created successfully', error: null },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
