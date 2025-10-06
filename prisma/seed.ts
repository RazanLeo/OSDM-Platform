import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Admin User (Razan)
  const adminPassword = await bcrypt.hash('RazanOSDM@056300', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'razan@osdm.sa' },
    update: {},
    create: {
      email: 'razan@osdm.sa',
      username: 'Razan@OSDM',
      password: adminPassword,
      fullName: 'Razan Taofek',
      role: 'ADMIN',
      accountType: 'INDIVIDUAL',
      country: 'السعودية',
      city: 'جدة',
      isEmailVerified: true,
      isActive: true,
      verificationStatus: 'VERIFIED',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create Platform Settings
  const platformSettings = [
    {
      key: 'PLATFORM_FEE',
      value: { percentage: 25, description: 'عمولة المنصة من كل معاملة' },
      description: 'نسبة العمولة الافتراضية للمنصة',
    },
    {
      key: 'REGISTRATION_FEE_INDIVIDUAL',
      value: { amount: 50, currency: 'SAR' },
      description: 'رسوم التسجيل للأفراد',
    },
    {
      key: 'REGISTRATION_FEE_COMPANY',
      value: { amount: 500, currency: 'SAR' },
      description: 'رسوم التسجيل للشركات',
    },
    {
      key: 'PRODUCT_LISTING_FEE',
      value: { amount: 50, currency: 'SAR' },
      description: 'رسوم نشر منتج',
    },
    {
      key: 'PREMIUM_SUBSCRIPTION_INDIVIDUAL',
      value: { amount: 100, currency: 'SAR', period: 'MONTHLY' },
      description: 'اشتراك مميز للأفراد',
    },
    {
      key: 'PREMIUM_SUBSCRIPTION_STARTUP',
      value: { amount: 500, currency: 'SAR', period: 'MONTHLY' },
      description: 'اشتراك مميز للشركات الناشئة',
    },
    {
      key: 'PREMIUM_SUBSCRIPTION_ENTERPRISE',
      value: { amount: 1000, currency: 'SAR', period: 'MONTHLY' },
      description: 'اشتراك مميز للشركات الكبرى',
    },
    {
      key: 'SUPPORT_EMAIL',
      value: 'app.osdm@gmail.com',
      description: 'البريد الإلكتروني للدعم',
    },
    {
      key: 'SUPPORT_PHONE',
      value: '+966544827213',
      description: 'رقم الدعم',
    },
  ]

  for (const setting of platformSettings) {
    await prisma.platformSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log('✅ Platform settings created')

  // Create demo seller
  const demoSellerPassword = await bcrypt.hash('Demo123456!', 12)
  const demoSeller = await prisma.user.upsert({
    where: { email: 'seller@demo.osdm.sa' },
    update: {},
    create: {
      email: 'seller@demo.osdm.sa',
      username: 'DemoSeller',
      password: demoSellerPassword,
      fullName: 'بائع تجريبي',
      role: 'SELLER',
      accountType: 'INDIVIDUAL',
      country: 'السعودية',
      city: 'الرياض',
      isEmailVerified: true,
      isActive: true,
      verificationStatus: 'VERIFIED',
      sellerProfile: {
        create: {
          bio: 'بائع متخصص في المنتجات الرقمية',
          skills: ['تصميم', 'برمجة', 'كتابة محتوى'],
          languages: ['العربية', 'English'],
          verifiedBadge: true,
        },
      },
    },
  })

  console.log('✅ Demo seller created:', demoSeller.email)

  // Create demo buyer
  const demoBuyerPassword = await bcrypt.hash('Demo123456!', 12)
  const demoBuyer = await prisma.user.upsert({
    where: { email: 'buyer@demo.osdm.sa' },
    update: {},
    create: {
      email: 'buyer@demo.osdm.sa',
      username: 'DemoBuyer',
      password: demoBuyerPassword,
      fullName: 'مشتري تجريبي',
      role: 'BUYER',
      accountType: 'INDIVIDUAL',
      country: 'السعودية',
      city: 'جدة',
      isEmailVerified: true,
      isActive: true,
    },
  })

  console.log('✅ Demo buyer created:', demoBuyer.email)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
