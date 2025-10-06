import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema لرد البائع
const sellerResponseSchema = z.object({
  response: z.string().min(10, 'الرد يجب أن يكون 10 أحرف على الأقل'),
})

// POST - رد البائع على التقييم
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

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: { sellerResponse: true },
    })

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'التقييم غير موجود' },
        { status: 404 }
      )
    }

    // يمكن فقط للبائع الرد
    if (review.sellerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'يمكن فقط للبائع الرد على التقييم' },
        { status: 403 }
      )
    }

    // التحقق من عدم وجود رد سابق
    if (review.sellerResponse) {
      return NextResponse.json(
        { success: false, error: 'لقد قمت بالرد على هذا التقييم بالفعل' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = sellerResponseSchema.parse(body)

    // إنشاء الرد
    const response = await prisma.sellerResponse.create({
      data: {
        reviewId: params.id,
        sellerId: session.user.id,
        response: validatedData.response,
      },
    })

    // إنشاء إشعار للمشتري
    await prisma.notification.create({
      data: {
        userId: review.buyerId,
        type: 'REVIEW_RESPONSE',
        title: 'رد البائع',
        message: 'قام البائع بالرد على تقييمك',
        relatedId: review.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الرد بنجاح',
      data: response,
    })
  } catch (error: any) {
    console.error('Error adding seller response:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في إضافة الرد' },
      { status: 500 }
    )
  }
}
