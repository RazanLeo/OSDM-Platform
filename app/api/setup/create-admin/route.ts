import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

// This endpoint should only be used ONCE to create the initial admin
// After that, it should be disabled in production

export async function POST(request: Request) {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'Razan@OSDM' },
          { email: 'admin@osdm.com' }
        ]
      },
    })

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Admin user already exists!',
          admin: {
            username: existingAdmin.username,
            email: existingAdmin.email,
            role: existingAdmin.role
          }
        },
        { status: 400 }
      )
    }

    // Get password from request or use default
    const body = await request.json().catch(() => ({}))
    const password = body.password || 'RazanOSDM@056300'

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        username: 'Razan@OSDM',
        email: 'admin@osdm.com',
        fullName: 'Razan OSDM Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        status: 'ACTIVE',
        phoneNumber: '+966500000000',
        country: 'Saudi Arabia',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully! ✅',
      credentials: {
        username: 'Razan@OSDM',
        password: 'RazanOSDM@056300',
        email: 'admin@osdm.com',
      },
      loginUrl: '/ar/auth/login',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      }
    })
  } catch (error: any) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create admin user',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// GET method to check if admin exists
export async function GET() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      }
    })

    if (admin) {
      return NextResponse.json({
        exists: true,
        admin: admin,
        message: 'Admin user exists. You can login now.'
      })
    }

    return NextResponse.json({
      exists: false,
      message: 'No admin user found. Send POST request to create one.'
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to check admin user',
        details: error.message
      },
      { status: 500 }
    )
  }
}
