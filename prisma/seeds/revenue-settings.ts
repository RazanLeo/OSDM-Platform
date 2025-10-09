// ============================================
// REVENUE SETTINGS SEEDER
// Creates default platform revenue settings
// Platform Commission: 25%
// Payment Gateway Fee: 5%
// Subscription Prices: 100 SAR (Individual), 250 SAR (SME), 500 SAR (Large)
// Dispute Window: 7 days
// ============================================

import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

export async function seedRevenueSettings() {
  console.log('💰 Seeding Revenue Settings...')

  // Create or update revenue settings
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

  return settings
}
