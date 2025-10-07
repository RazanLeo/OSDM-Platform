// Re-export prisma instance as both db and prisma for compatibility
import { prisma as prismaClient } from './prisma'

export { prismaClient as db }
export { prismaClient as prisma }
export default prismaClient
