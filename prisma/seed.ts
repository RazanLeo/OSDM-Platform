// ============================================
// MAIN SEED FILE
// Runs all seeders in correct order
// ============================================

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Decimal } from '@prisma/client/runtime/library'
import { productCategories } from './seeds/product-categories'
import { serviceCategories } from './seeds/service-categories'
import { projectCategories } from './seeds/project-categories'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')
  console.log('='.repeat(50))

  try {
    // 1. Seed Product Categories (310 categories)
    console.log('\n📦 Seeding Product Categories...')
    for (const category of productCategories) {
      await prisma.productCategory.upsert({
        where: { slug: category.slug },
        update: category,
        create: category,
      })
    }
    console.log(`✅ ${productCategories.length} Product Categories seeded`)

    // 2. Seed Service Categories (110 categories)
    console.log('\n🛠️  Seeding Service Categories...')
    for (const category of serviceCategories) {
      await prisma.serviceCategory.upsert({
        where: { slug: category.slug },
        update: category,
        create: category,
      })
    }
    console.log(`✅ ${serviceCategories.length} Service Categories seeded`)

    // 3. Seed Project Categories (51 categories)
    console.log('\n🚀 Seeding Project Categories...')
    for (const category of projectCategories) {
      await prisma.projectCategory.upsert({
        where: { slug: category.slug },
        update: category,
        create: category,
      })
    }
    console.log(`✅ ${projectCategories.length} Project Categories seeded`)

    // 4. Seed Admin User (Razan@OSDM)
    console.log('\n🔐 Seeding Admin User...')
    const hashedPassword = await bcrypt.hash('RazanOSDM@056300', 10)

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
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    console.log('✅ Admin User created:', {
      username: admin.username,
      email: admin.email,
      role: admin.role,
    })

    // 5. Seed Revenue Settings (25% + 5%)
    console.log('\n💰 Seeding Revenue Settings...')
    const settings = await prisma.revenueSettings.upsert({
      where: { id: 'default-revenue-settings' },
      update: {
        platformCommission: new Decimal(25.00),
        paymentGatewayFee: new Decimal(5.00),
        individualPrice: new Decimal(100.00),
        smePrice: new Decimal(250.00),
        largePrice: new Decimal(500.00),
        disputeWindowDays: 7,
        updatedAt: new Date(),
      },
      create: {
        id: 'default-revenue-settings',
        platformCommission: new Decimal(25.00),
        paymentGatewayFee: new Decimal(5.00),
        individualPrice: new Decimal(100.00),
        smePrice: new Decimal(250.00),
        largePrice: new Decimal(500.00),
        disputeWindowDays: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    console.log('✅ Revenue Settings created:', {
      platformCommission: `${settings.platformCommission}%`,
      paymentGatewayFee: `${settings.paymentGatewayFee}%`,
      individualPrice: `${settings.individualPrice} SAR`,
      smePrice: `${settings.smePrice} SAR`,
      largePrice: `${settings.largePrice} SAR`,
      disputeWindowDays: `${settings.disputeWindowDays} days`,
    })

    console.log('\n' + '='.repeat(50))
    console.log('🎉 Database seeding completed successfully!')
    console.log('='.repeat(50))
    console.log('\n📊 Summary:')
    console.log(`   - Product Categories: ${productCategories.length}`)
    console.log(`   - Service Categories: ${serviceCategories.length}`)
    console.log(`   - Project Categories: ${projectCategories.length}`)
    console.log(`   - Admin User: 1`)
    console.log(`   - Revenue Settings: 1`)
    console.log(`   - Total Records: ${productCategories.length + serviceCategories.length + projectCategories.length + 2}`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
