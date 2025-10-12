import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkoutSchema = z.object({
  serviceId: z.string(),
  packageId: z.string(),
  sellerId: z.string(),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters')
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = checkoutSchema.parse(body)

    // Verify service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
      include: {
        packages: true
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (service.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Service is not available' },
        { status: 400 }
      )
    }

    // Verify user is not buying their own service
    if (service.sellerId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot purchase your own service' },
        { status: 400 }
      )
    }

    // Verify package exists and belongs to service
    const selectedPackage = service.packages.find((p) => p.id === data.packageId)
    if (!selectedPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Calculate fees
    const servicePrice = Number(selectedPackage.price)
    const platformFee = servicePrice * 0.1 // 10% platform fee
    const totalAmount = servicePrice + platformFee

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create service order
      const newOrder = await tx.serviceOrder.create({
        data: {
          id: `order_${Date.now()}`,
          serviceId: data.serviceId,
          packageId: data.packageId,
          buyerId: session.user.id,
          sellerId: data.sellerId,
          requirements: data.requirements,
          amount: servicePrice,
          platformFee,
          totalAmount,
          status: 'PENDING',
          deliveryDate: new Date(
            Date.now() + selectedPackage.deliveryDays * 24 * 60 * 60 * 1000
          )
        },
        include: {
          service: {
            select: {
              titleAr: true,
              titleEn: true,
              thumbnail: true
            }
          },
          package: {
            select: {
              nameAr: true,
              nameEn: true,
              tier: true
            }
          },
          seller: {
            select: {
              username: true,
              fullName: true
            }
          }
        }
      })

      // Create notification for seller
      await tx.notification.create({
        data: {
          id: `notif_${Date.now()}`,
          userId: data.sellerId,
          type: 'NEW_ORDER',
          titleAr: 'طلب جديد',
          titleEn: 'New Order',
          messageAr: `لديك طلب جديد على خدمة "${newOrder.service.titleAr}"`,
          messageEn: `You have a new order for "${newOrder.service.titleEn}"`,
          link: `/ar/dashboard/seller/orders/${newOrder.id}`
        }
      })

      // Create notification for buyer
      await tx.notification.create({
        data: {
          id: `notif_${Date.now() + 1}`,
          userId: session.user.id,
          type: 'ORDER_CREATED',
          titleAr: 'تم إنشاء الطلب',
          titleEn: 'Order Created',
          messageAr: `تم إنشاء طلبك بنجاح. في انتظار قبول البائع`,
          messageEn: `Your order has been created successfully. Waiting for seller acceptance`,
          link: `/ar/dashboard/buyer/orders/${newOrder.id}`
        }
      })

      return newOrder
    })

    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating service order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
