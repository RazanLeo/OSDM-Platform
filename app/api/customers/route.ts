import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'lastPurchase'
    const order = searchParams.get('order') || 'desc'

    const customers = await prisma.customer.findMany({
      where: { sellerId: session.user.id },
      include: {
        Buyer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            avatar: true,
            country: true,
          },
        },
      },
      orderBy: { [sortBy]: order },
    })

    const stats = {
      total: customers.length,
      totalRevenue: customers.reduce((sum, c) => sum + Number(c.totalSpent), 0),
      totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0),
      avgOrderValue: customers.length > 0
        ? customers.reduce((sum, c) => sum + Number(c.totalSpent), 0) / customers.reduce((sum, c) => sum + c.totalOrders, 0)
        : 0,
    }

    return NextResponse.json({ customers, stats })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
