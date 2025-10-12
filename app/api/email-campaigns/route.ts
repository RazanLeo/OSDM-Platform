import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const campaignSchema = z.object({
  subject: z.string().min(5),
  contentAr: z.string().min(10),
  contentEn: z.string().min(10),
  recipientType: z.enum(['ALL_CUSTOMERS', 'SUBSCRIBERS', 'SPECIFIC']),
  recipientIds: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = campaignSchema.parse(body)

    const campaign = await prisma.emailCampaign.create({
      data: {
        id: nanoid(),
        sellerId: session.user.id,
        subject: validatedData.subject,
        contentAr: validatedData.contentAr,
        contentEn: validatedData.contentEn,
        recipientType: validatedData.recipientType,
        recipientIds: validatedData.recipientIds || [],
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
        status: validatedData.scheduledAt ? 'SCHEDULED' : 'DRAFT',
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Campaign created', campaign })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaigns = await prisma.emailCampaign.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}
