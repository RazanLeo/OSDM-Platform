import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema لطلب سحب
const withdrawalSchema = z.object({
  amount: z.number().min(50, 'الحد الأدنى للسحب 50 ريال'),
  method: z.enum(['BANK_TRANSFER', 'PAYPAL', 'WISE', 'WALLET']),
  accountDetails: z.object({
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    iban: z.string().optional(),
    swiftCode: z.string().optional(),
    paypalEmail: z.string().email().optional(),
    wiseEmail: z.string().email().optional(),
  }),
  notes: z.string().optional(),
})

// POST - طلب سحب
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = withdrawalSchema.parse(body)

    // جلب المستخدم
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من أن المستخدم بائع أو مستقل
    if (user.role !== 'SELLER' && user.role !== 'FREELANCER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'فقط البائعون والمستقلون يمكنهم سحب الأرباح' },
        { status: 403 }
      )
    }

    // التحقق من الرصيد المتاح
    const pendingWithdrawals = await prisma.withdrawal.findMany({
      where: {
        userId: session.user.id,
        status: 'PENDING',
      },
    })

    const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0)
    const availableBalance = user.balance - pendingAmount

    if (availableBalance < validatedData.amount) {
      return NextResponse.json(
        {
          success: false,
          error: `الرصيد المتاح للسحب ${availableBalance} ريال فقط`,
        },
        { status: 400 }
      )
    }

    // التحقق من الحد الأدنى
    if (validatedData.amount < 50) {
      return NextResponse.json(
        { success: false, error: 'الحد الأدنى للسحب 50 ريال' },
        { status: 400 }
      )
    }

    // حساب الرسوم (2% من المبلغ)
    const feePercentage = 2
    const fee = (validatedData.amount * feePercentage) / 100
    const netAmount = validatedData.amount - fee

    // إنشاء طلب السحب
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: session.user.id,
        amount: validatedData.amount,
        fee,
        netAmount,
        method: validatedData.method,
        accountDetails: validatedData.accountDetails,
        notes: validatedData.notes,
        status: 'PENDING',
      },
    })

    // إنشاء إشعار للمستخدم
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'WITHDRAWAL_REQUESTED',
        title: 'طلب سحب جديد',
        message: `تم إنشاء طلب سحب بقيمة ${validatedData.amount} ريال. سيتم المراجعة والتحويل خلال 3-5 أيام عمل`,
        relatedId: withdrawal.id,
      },
    })

    // إنشاء إشعار للإدارة
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'NEW_WITHDRAWAL',
          title: 'طلب سحب جديد',
          message: `طلب سحب جديد من ${user.fullName} بقيمة ${validatedData.amount} ريال`,
          relatedId: withdrawal.id,
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء طلب السحب بنجاح',
        data: withdrawal,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating withdrawal:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء طلب السحب' },
      { status: 500 }
    )
  }
}

// GET - جلب طلبات السحب
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    let where: any = {}

    if (user?.role === 'ADMIN') {
      // الإدارة يمكنها رؤية جميع الطلبات
      where = status ? { status } : {}
    } else {
      // المستخدمون العاديون يرون طلباتهم فقط
      where = {
        userId: session.user.id,
        ...(status ? { status } : {}),
      }
    }

    const total = await prisma.withdrawal.count({ where })

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    })

    const stats = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    }

    return NextResponse.json({
      success: true,
      data: withdrawals,
      stats,
    })
  } catch (error: any) {
    console.error('Error fetching withdrawals:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب طلبات السحب' },
      { status: 500 }
    )
  }
}
