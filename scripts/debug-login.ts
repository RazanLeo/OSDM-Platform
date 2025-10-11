import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function debugLogin() {
  console.log('\n🔍 Debugging Login System\n' + '='.repeat(60))

  // Test 1: Check if users exist
  console.log('\n1️⃣ Checking users in database...')
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      role: true,
    }
  })

  console.log(`   Found ${users.length} users`)
  for (const user of users) {
    console.log(`   - ${user.email} (${user.username}) - Role: ${user.role}`)
    console.log(`     Has password: ${!!user.password}`)

    if (user.password) {
      // Test password
      const testPass = user.email === 'admin@osdm.sa' ? '123456' :
                       user.email === 'Guest@osdm.sa' ? '123456' :
                       'RazanOSDM@056300'

      const valid = await bcrypt.compare(testPass, user.password)
      console.log(`     Password '${testPass}' works: ${valid ? '✅' : '❌'}`)
    }
  }

  // Test 2: Check NextAuth configuration
  console.log('\n2️⃣ Checking NextAuth Environment...')
  console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'NOT SET'}`)
  console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'}`)
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`)

  // Test 3: Simulate login
  console.log('\n3️⃣ Simulating login for admin@osdm.sa...')
  const testUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@osdm.sa' },
        { username: 'admin' }
      ]
    }
  })

  if (testUser && testUser.password) {
    const isValid = await bcrypt.compare('123456', testUser.password)
    console.log(`   User found: ✅`)
    console.log(`   Password valid: ${isValid ? '✅' : '❌'}`)
    console.log(`   Would login succeed: ${isValid ? '✅ YES' : '❌ NO'}`)
  } else {
    console.log(`   ❌ User not found or no password`)
  }

  await prisma.$disconnect()
}

debugLogin().catch(console.error)
