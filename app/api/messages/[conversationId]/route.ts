import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET - جلب الرسائل في محادثة
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.conversationId },
      include: {
        participant1: true,
        participant2: true,
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'المحادثة غير موجودة' },
        { status: 404 }
      )
    }

    // التحقق من الصلاحيات
    if (
      conversation.participant1Id !== session.user.id &&
      conversation.participant2Id !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية لرؤية هذه المحادثة' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const total = await prisma.message.count({
      where: { conversationId: params.conversationId },
    })

    const messages = await prisma.message.findMany({
      where: { conversationId: params.conversationId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    })

    // وضع علامة مقروء على الرسائل
    await prisma.message.updateMany({
      where: {
        conversationId: params.conversationId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    })

    const stats = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    }

    return NextResponse.json({
      success: true,
      data: {
        conversation,
        messages,
      },
      stats,
    })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الرسائل' },
      { status: 500 }
    )
  }
}

// POST - إرسال رسالة
const sendMessageSchema = z.object({
  content: z.string().min(1, 'الرسالة لا يمكن أن تكون فارغة'),
  type: z.enum(['TEXT', 'IMAGE', 'FILE', 'AUDIO', 'VIDEO']).optional(),
  attachments: z.array(z.string().url()).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.conversationId },
    })

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'المحادثة غير موجودة' },
        { status: 404 }
      )
    }

    // التحقق من الصلاحيات
    if (
      conversation.participant1Id !== session.user.id &&
      conversation.participant2Id !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك صلاحية للإرسال في هذه المحادثة' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = sendMessageSchema.parse(body)

    // تحديد المستقبل
    const receiverId =
      conversation.participant1Id === session.user.id
        ? conversation.participant2Id
        : conversation.participant1Id

    // إنشاء الرسالة
    const message = await prisma.message.create({
      data: {
        conversationId: params.conversationId,
        senderId: session.user.id,
        receiverId,
        content: validatedData.content,
        type: validatedData.type || 'TEXT',
        attachments: validatedData.attachments || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    })

    // تحديث وقت آخر رسالة في المحادثة
    await prisma.conversation.update({
      where: { id: params.conversationId },
      data: { lastMessageAt: new Date() },
    })

    // إنشاء إشعار للمستقبل
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'NEW_MESSAGE',
        title: 'رسالة جديدة',
        message: `${session.user.name || session.user.email} أرسل لك رسالة`,
        relatedId: message.id,
      },
    })

    // هنا يمكن إضافة Pusher أو Socket.io للرسائل الفورية
    // await pusher.trigger(`conversation-${params.conversationId}`, 'new-message', message)

    return NextResponse.json({
      success: true,
      message: 'تم إرسال الرسالة بنجاح',
      data: message,
    })
  } catch (error: any) {
    console.error('Error sending message:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في إرسال الرسالة' },
      { status: 500 }
    )
  }
}
