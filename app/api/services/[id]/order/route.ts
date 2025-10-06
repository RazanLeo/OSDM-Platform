import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema لطلب خدمة
const orderServiceSchema = z.object({
  packageType: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
  requirements: z.string().min(10, 'يجب كتابة متطلبات الخدمة (10 أحرف على الأقل)'),
  attachments: z.array(z.string().url()).optional(),
  notes: z.string().optional(),
})

// POST - طلب خدمة
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const service = await prisma.customService.findUnique({
      where: { id: params.id },
      include: {
        packages: true,
        seller: true,
      },
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'الخدمة غير موجودة' },
        { status: 404 }
      )
    }

    if (service.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: 'هذه الخدمة غير متاحة حالياً' },
        { status: 400 }
      )
    }

    // لا يمكن للبائع طلب خدمته الخاصة
    if (service.sellerId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'لا يمكنك طلب خدمتك الخاصة' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = orderServiceSchema.parse(body)

    // البحث عن الباقة المطلوبة
    const selectedPackage = service.packages.find(
      (pkg) => pkg.name === validatedData.packageType
    )

    if (!selectedPackage) {
      return NextResponse.json(
        { success: false, error: 'الباقة المطلوبة غير موجودة' },
        { status: 404 }
      )
    }

    // التحقق من رصيد المشتري
    const buyer = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!buyer) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // حساب العمولة
    const platformFeeSetting = await prisma.platformSettings.findUnique({
      where: { key: 'PLATFORM_FEE' },
    })

    const platformFeePercentage = platformFeeSetting?.value
      ? (platformFeeSetting.value as any).percentage || 25
      : 25

    const platformFee = (selectedPackage.price * platformFeePercentage) / 100
    const sellerAmount = selectedPackage.price - platformFee

    // إنشاء الطلب
    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        sellerId: service.sellerId,
        serviceId: service.id,
        orderType: 'SERVICE',
        packageType: validatedData.packageType,
        amount: selectedPackage.price,
        platformFee,
        sellerAmount,
        status: 'PENDING',
        requirements: validatedData.requirements,
        attachments: validatedData.attachments || [],
        notes: validatedData.notes,
        deliveryDate: new Date(
          Date.now() + selectedPackage.deliveryDays * 24 * 60 * 60 * 1000
        ),
      },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
          },
        },
      },
    })

    // إنشاء إشعار للبائع
    await prisma.notification.create({
      data: {
        userId: service.sellerId,
        type: 'NEW_ORDER',
        title: 'طلب جديد',
        message: `لديك طلب جديد على الخدمة "${service.title}"`,
        relatedId: order.id,
      },
    })

    // إنشاء إشعار للمشتري
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'ORDER_CREATED',
        title: 'تم إنشاء الطلب',
        message: `تم إنشاء طلبك على الخدمة "${service.title}" بنجاح. في انتظار موافقة البائع`,
        relatedId: order.id,
      },
    })

    // إنشاء محادثة بين البائع والمشتري
    const conversation = await prisma.conversation.create({
      data: {
        participant1Id: session.user.id,
        participant2Id: service.sellerId,
        orderId: order.id,
        lastMessageAt: new Date(),
      },
    })

    // رسالة ترحيبية تلقائية
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: service.sellerId,
        receiverId: session.user.id,
        content: `مرحباً! شكراً لطلبك الخدمة "${service.title}". سأبدأ العمل عليها فوراً وسأتواصل معك في حال احتجت أي توضيحات.`,
        type: 'TEXT',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء الطلب بنجاح',
        data: {
          order,
          conversationId: conversation.id,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating service order:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء الطلب' },
      { status: 500 }
    )
  }
}
