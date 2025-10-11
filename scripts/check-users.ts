import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        emailVerified: true,
      }
    })

    if (users.length === 0) {
      console.log('❌ No users found in database!')
    } else {
      console.log(`✅ Found ${users.length} users:\n`)
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Username: ${user.username}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Email Verified: ${user.emailVerified}`)
        console.log('')
      })
    }

    // Check specifically for admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@osdm.sa' }
    })

    if (admin) {
      console.log('✅ Admin user (admin@osdm.sa) exists!')
      console.log(`   Has password: ${!!admin.password}`)
    } else {
      console.log('❌ Admin user (admin@osdm.sa) NOT FOUND!')
    }

  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
