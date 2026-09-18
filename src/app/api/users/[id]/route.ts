import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
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
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        userRoles: { select: { role: { select: { id: true, name: true } } } },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, data: null, message: 'User not found', error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User fetched successfully',
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

    const role = (session.user as any).role
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, data: null, message: 'Forbidden', error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { id } = await params
    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'User not found', error: 'Not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, email, password, phone, isActive, roleName } = body

    const data: any = {}
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (phone !== undefined) data.phone = phone
    if (isActive !== undefined) data.isActive = isActive
    if (password) {
      const bcrypt = await import('bcryptjs')
      data.password = await bcrypt.hash(password, 12)
    }

    if (roleName) {
      await prisma.userRole.deleteMany({ where: { userId: id } })
      const role = await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName, description: `Role ${roleName}` },
      })
      await prisma.userRole.create({
        data: {
          userId: id,
          roleId: role.id,
        },
      })
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, name: true, email: true, phone: true,
        isActive: true, createdAt: true, updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User updated successfully',
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

    const role = (session.user as any).role
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, data: null, message: 'Forbidden', error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { id } = await params
    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, data: null, message: 'Cannot delete your own account', error: 'Self-delete not allowed' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, message: 'User not found', error: 'Not found' },
        { status: 404 }
      )
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      data: null,
      message: 'User deactivated successfully',
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
