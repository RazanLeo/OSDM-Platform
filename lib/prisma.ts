import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling configuration
  // @ts-ignore
  __internal: {
    engine: {
      connection_limit: 10,
      pool_timeout: 10,
    },
  },
})

// Handle connection errors and reconnection
prisma.$connect().catch((error) => {
  console.error('Failed to connect to database:', error)
  // Retry connection after 5 seconds
  setTimeout(() => {
    prisma.$connect().catch(console.error)
  }, 5000)
})

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
