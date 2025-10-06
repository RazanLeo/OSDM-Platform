import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET - جلب المحادثات
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // جلب المحادثات
    const where = {
      OR: [
        { participant1Id: session.user.id },
        { participant2Id: session.user.id },
      ],
    }

    const total = await prisma.conversation.count({ where })

    const conversations = await prisma.conversation.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        participant1: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        participant2: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        order: {
          select: {
            id: true,
            orderType: true,
            amount: true,
            status: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            type: true,
            createdAt: true,
            isRead: true,
            senderId: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    })

    // حساب الرسائل غير المقروءة لكل محادثة
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: session.user!.id,
            isRead: false,
          },
        })

        // تحديد الطرف الآخر
        const otherParticipant =
          conv.participant1Id === session.user!.id
            ? conv.participant2
            : conv.participant1

        return {
          ...conv,
          unreadCount,
          otherParticipant,
          lastMessage: conv.messages[0] || null,
        }
      })
    )

    const stats = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    }

    return NextResponse.json({
      success: true,
      data: conversationsWithUnread,
      stats,
    })
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المحادثات' },
      { status: 500 }
    )
  }
}

// POST - إنشاء محادثة جديدة
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
    const { participantId, orderId, projectId } = body

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم الآخر مطلوب' },
        { status: 400 }
      )
    }

    // التحقق من عدم محاولة المراسلة للنفس
    if (participantId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'لا يمكنك مراسلة نفسك' },
        { status: 400 }
      )
    }

    // التحقق من وجود المستخدم الآخر
    const otherUser = await prisma.user.findUnique({
      where: { id: participantId },
    })

    if (!otherUser) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من وجود محادثة سابقة
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: session.user.id,
            participant2Id: participantId,
          },
          {
            participant1Id: participantId,
            participant2Id: session.user.id,
          },
        ],
      },
    })

    if (existingConversation) {
      return NextResponse.json({
        success: true,
        message: 'المحادثة موجودة بالفعل',
        data: existingConversation,
      })
    }

    // إنشاء محادثة جديدة
    const conversation = await prisma.conversation.create({
      data: {
        participant1Id: session.user.id,
        participant2Id: participantId,
        orderId: orderId || undefined,
        projectId: projectId || undefined,
        lastMessageAt: new Date(),
      },
      include: {
        participant1: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
        participant2: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء المحادثة بنجاح',
        data: conversation,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء المحادثة' },
      { status: 500 }
    )
  }
}
