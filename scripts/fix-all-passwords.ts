import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixAllPasswords() {
  try {
    console.log('🔐 Fixing all user passwords...\n')

    const testAccounts = [
      { email: 'admin@osdm.sa', password: '123456' },
      { email: 'Guest@osdm.sa', password: '123456' },
      { email: 'razan@osdm.sa', password: 'RazanOSDM@056300' },
    ]

    for (const account of testAccounts) {
      console.log(`🔑 Processing ${account.email}...`)

      const user = await prisma.user.findUnique({
        where: { email: account.email }
      })

      if (!user) {
        console.log(`   ❌ User not found\n`)
        continue
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(account.password, 10)

      // Update the user
      await prisma.user.update({
        where: { email: account.email },
        data: { password: hashedPassword }
      })

      // Verify it works
      const updatedUser = await prisma.user.findUnique({
        where: { email: account.email }
      })

      if (updatedUser?.password) {
        const isValid = await bcrypt.compare(account.password, updatedUser.password)
        console.log(`   ${isValid ? '✅' : '❌'} Password updated and verified`)
        console.log(`   Username: ${updatedUser.username}`)
        console.log(`   Password: ${account.password}\n`)
      }
    }

    console.log('✅ All passwords updated successfully!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAllPasswords()
