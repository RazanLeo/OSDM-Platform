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
        update: {
          nameAr: category.nameAr,
          nameEn: category.nameEn,
          parentId: category.parentId,
          order: category.order,
        },
        create: {
          id: `prod-cat-${category.slug}`,
          ...category,
        },
      })
    }
    console.log(`✅ ${productCategories.length} Product Categories seeded`)

    // 2. Seed Service Categories (110 categories)
    console.log('\n🛠️  Seeding Service Categories...')
    for (const category of serviceCategories) {
      await prisma.serviceCategory.upsert({
        where: { slug: category.slug },
        update: {
          nameAr: category.nameAr,
          nameEn: category.nameEn,
          parentId: category.parentId,
          order: category.order,
        },
        create: {
          id: `serv-cat-${category.slug}`,
          ...category,
        },
      })
    }
    console.log(`✅ ${serviceCategories.length} Service Categories seeded`)

    // 3. Seed Project Categories (51 categories)
    console.log('\n🚀 Seeding Project Categories...')
    for (const category of projectCategories) {
      await prisma.projectCategory.upsert({
        where: { slug: category.slug },
        update: {
          nameAr: category.nameAr,
          nameEn: category.nameEn,
          parentId: category.parentId,
          order: category.order,
        },
        create: {
          id: `proj-cat-${category.slug}`,
          ...category,
        },
      })
    }
    console.log(`✅ ${projectCategories.length} Project Categories seeded`)

    // 4. Seed Admin User (Razan@OSDM)
    console.log('\n🔐 Seeding Users...')

    // Main Admin - Razan
    const adminPassword = await bcrypt.hash('RazanOSDM@056300', 10)
    const admin = await prisma.user.upsert({
      where: { username: 'Razan@OSDM' },
      update: {
        password: adminPassword,
      },
      create: {
        id: 'user-razan-osdm',
        username: 'Razan@OSDM',
        email: 'razan@osdm.sa',
        password: adminPassword,
        fullName: 'رزان توفيق - مديرة المنصة',
        role: 'ADMIN',
        userType: 'INDIVIDUAL',
        country: 'Saudi Arabia',
        phone: '+966544827213',
        bio: 'مديرة ومؤسسة منصة OSDM',
        emailVerified: true,
        phoneVerified: true,
        updatedAt: new Date(),
      },
    })
    console.log('✅ Main Admin created:', {
      username: admin.username,
      email: admin.email,
      role: admin.role,
    })

    // Admin Account - admin@osdm.sa
    const adminAccountPassword = await bcrypt.hash('admin@123456', 10)
    const adminAccount = await prisma.user.upsert({
      where: { email: 'admin@osdm.sa' },
      update: {
        password: adminAccountPassword,
      },
      create: {
        id: 'user-admin-osdm',
        username: 'admin',
        email: 'admin@osdm.sa',
        password: adminAccountPassword,
        fullName: 'حساب المدير',
        role: 'ADMIN',
        userType: 'INDIVIDUAL',
        country: 'Saudi Arabia',
        phone: '+966500000001',
        bio: 'حساب تجريبي للمدير',
        emailVerified: true,
        phoneVerified: true,
        updatedAt: new Date(),
      },
    })
    console.log('✅ Admin Account created:', {
      username: adminAccount.username,
      email: adminAccount.email,
      role: adminAccount.role,
    })

    // Guest Account - Buyer & Seller
    const guestPassword = await bcrypt.hash('guest@123456', 10)
    const guest = await prisma.user.upsert({
      where: { email: 'Guest@osdm.sa' },
      update: {
        password: guestPassword,
      },
      create: {
        id: 'user-guest-osdm',
        username: 'Guest',
        email: 'Guest@osdm.sa',
        password: guestPassword,
        fullName: 'حساب ضيف تجريبي',
        role: 'USER',
        userType: 'INDIVIDUAL',
        country: 'Saudi Arabia',
        phone: '+966500000002',
        bio: 'حساب تجريبي للمشتري والبائع',
        emailVerified: true,
        phoneVerified: true,
        updatedAt: new Date(),
      },
    })
    console.log('✅ Guest Account created:', {
      username: guest.username,
      email: guest.email,
      role: guest.role,
    })

    // 5. Create Wallets for Users
    console.log('\n💰 Creating Wallets...')

    await prisma.wallet.upsert({
      where: { userId: admin.id },
      update: {},
      create: {
        id: `wallet-${admin.id}`,
        userId: admin.id,
        balance: new Decimal(0),
        pendingBalance: new Decimal(0),
        currency: 'SAR',
        updatedAt: new Date(),
      },
    })

    await prisma.wallet.upsert({
      where: { userId: adminAccount.id },
      update: {},
      create: {
        id: `wallet-${adminAccount.id}`,
        userId: adminAccount.id,
        balance: new Decimal(0),
        pendingBalance: new Decimal(0),
        currency: 'SAR',
        updatedAt: new Date(),
      },
    })

    await prisma.wallet.upsert({
      where: { userId: guest.id },
      update: {},
      create: {
        id: `wallet-${guest.id}`,
        userId: guest.id,
        balance: new Decimal(0),
        pendingBalance: new Decimal(0),
        currency: 'SAR',
        updatedAt: new Date(),
      },
    })

    console.log('✅ Wallets created for all users')

    // 6. Seed Revenue Settings (25% + 5%)
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
    console.log(`   - Users: 3 (1 Main Admin + 1 Admin + 1 Guest)`)
    console.log(`   - Wallets: 3`)
    console.log(`   - Revenue Settings: 1`)
    console.log(`   - Total Records: ${productCategories.length + serviceCategories.length + projectCategories.length + 7}`)
    console.log('\n🔐 Login Credentials:')
    console.log('   1️⃣  Main Admin: Razan@OSDM / RazanOSDM@056300')
    console.log('   2️⃣  Admin: admin@osdm.sa / 123456')
    console.log('   3️⃣  Guest: Guest@osdm.sa / 123456')

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
