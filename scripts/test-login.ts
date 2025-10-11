import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  try {
    const testCredentials = [
      { identifier: 'admin@osdm.sa', password: 'admin@123456' },
      { identifier: 'admin', password: 'admin@123456' },
      { identifier: 'Guest@osdm.sa', password: 'guest@123456' },
      { identifier: 'Guest', password: 'guest@123456' },
      { identifier: 'razan@osdm.sa', password: 'RazanOSDM@056300' },
      { identifier: 'Razan@OSDM', password: 'RazanOSDM@056300' },
    ]

    for (const cred of testCredentials) {
      console.log(`\n🔐 Testing: ${cred.identifier} / ${cred.password}`)
      console.log('='.repeat(50))

      // Try to find user by email or username
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cred.identifier },
            { username: cred.identifier },
          ],
        },
      })

      if (!user) {
        console.log('❌ User NOT FOUND')
        continue
      }

      console.log(`✅ User found:`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Full Name: ${user.fullName}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Is Suspended: ${user.isSuspended}`)
      console.log(`   Has Password: ${!!user.password}`)

      if (!user.password) {
        console.log('❌ User has no password!')
        continue
      }

      // Test password
      const isPasswordValid = await bcrypt.compare(cred.password, user.password)
      console.log(`   Password Valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`)

      if (isPasswordValid) {
        console.log('✅✅ LOGIN WOULD SUCCEED! ✅✅')
      } else {
        console.log('❌❌ LOGIN WOULD FAIL! ❌❌')
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
