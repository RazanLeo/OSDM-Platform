import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: { username: 'Razan@OSDM' },
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists!')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('RazanOSDM@056300', 10)

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

    console.log('✅ Admin user created successfully!')
    console.log('📧 Username:', admin.username)
    console.log('🔑 Password: RazanOSDM@056300')
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
