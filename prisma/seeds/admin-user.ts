// ============================================
// ADMIN USER SEEDER
// Creates the main admin account: Razan@OSDM
// Password: RazanOSDM@056300
// ============================================

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function seedAdminUser() {
  console.log('🔐 Seeding Admin User...')

  // Hash the password
  const hashedPassword = await bcrypt.hash('RazanOSDM@056300', 10)

  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { username: 'Razan@OSDM' },
    update: {},
    create: {
      username: 'Razan@OSDM',
      email: 'admin@osdm.com',
      password: hashedPassword,
      fullName: 'Razan OSDM Admin',
      role: 'ADMIN',
      userType: 'INDIVIDUAL',
      country: 'Saudi Arabia',
      phoneNumber: '+966500000000',
      bio: 'Platform Administrator',
      profilePicture: null,
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  console.log('✅ Admin User created:', {
    username: admin.username,
    email: admin.email,
    role: admin.role,
  })

  return admin
}
