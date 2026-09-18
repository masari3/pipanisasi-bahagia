import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, data: null, message: 'Name, email, and password are required', error: 'Validation error' },
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

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        userRoles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: 'DONATUR' },
                create: { name: 'DONATUR', description: 'Default donor role' },
              },
            },
          },
        },
      },
      select: { id: true, name: true, email: true, createdAt: true },
    })

    return NextResponse.json(
      { success: true, data: user, message: 'Registration successful', error: null },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: 'Internal server error', error: String(error) },
      { status: 500 }
    )
  }
}
