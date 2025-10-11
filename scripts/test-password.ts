import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testPassword() {
  try {
    console.log('🔐 Testing password for admin@osdm.sa...\n')

    const user = await prisma.user.findUnique({
      where: { email: 'admin@osdm.sa' }
    })

    if (!user) {
      console.log('❌ User not found!')
      return
    }

    if (!user.password) {
      console.log('❌ User has no password!')
      return
    }

    console.log('✅ User found:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Username: ${user.username}`)
    console.log(`   Has password: ${!!user.password}`)
    console.log(`   Password hash: ${user.password.substring(0, 20)}...`)
    console.log('')

    // Test password
    const testPassword = '123456'
    const isValid = await bcrypt.compare(testPassword, user.password)

    console.log(`🔑 Testing password: "${testPassword}"`)
    console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`)

    if (!isValid) {
      console.log('\n⚠️  Password does not match! Updating password...')
      const newHash = await bcrypt.hash('123456', 10)
      await prisma.user.update({
        where: { email: 'admin@osdm.sa' },
        data: { password: newHash }
      })
      console.log('✅ Password updated successfully!')

      // Verify again
      const updatedUser = await prisma.user.findUnique({
        where: { email: 'admin@osdm.sa' }
      })
      if (updatedUser?.password) {
        const recheck = await bcrypt.compare('123456', updatedUser.password)
        console.log(`   Verification: ${recheck ? '✅ Password now works!' : '❌ Still not working'}`)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPassword()
