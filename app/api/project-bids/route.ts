import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const bidSchema = z.object({
  projectId: z.string(),
  proposalAr: z.string().min(50),
  proposalEn: z.string().min(50),
  bidAmount: z.number().min(5),
  deliveryDays: z.number().min(1),
  attachments: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = bidSchema.parse(body)

    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.status !== 'OPEN') {
      return NextResponse.json({ error: 'Project is not open for bidding' }, { status: 400 })
    }

    const existingBid = await prisma.projectBid.findFirst({
      where: {
        projectId: validatedData.projectId,
        freelancerId: session.user.id,
      },
    })

    if (existingBid) {
      return NextResponse.json({ error: 'You already submitted a bid' }, { status: 400 })
    }

    const bid = await prisma.projectBid.create({
      data: {
        id: nanoid(),
        projectId: validatedData.projectId,
        freelancerId: session.user.id,
        proposalAr: validatedData.proposalAr,
        proposalEn: validatedData.proposalEn,
        bidAmount: validatedData.bidAmount,
        deliveryDays: validatedData.deliveryDays,
        attachments: validatedData.attachments || [],
        updatedAt: new Date(),
      },
    })

    await prisma.project.update({
      where: { id: validatedData.projectId },
      data: { proposalCount: { increment: 1 } },
    })

    return NextResponse.json({ message: 'Bid submitted successfully', bid })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error submitting bid:', error)
    return NextResponse.json({ error: 'Failed to submit bid' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const type = searchParams.get('type') // 'sent' or 'received'

    let bids
    if (type === 'sent') {
      bids = await prisma.projectBid.findMany({
        where: { freelancerId: session.user.id },
        include: {
          Project: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              status: true,
              budgetMin: true,
              budgetMax: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      })

      if (!project || project.clientId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      bids = await prisma.projectBid.findMany({
        where: { projectId },
        include: {
          User: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              skills: true,
              completionRate: true,
              totalSales: true,
              averageRating: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      return NextResponse.json({ error: 'projectId or type required' }, { status: 400 })
    }

    return NextResponse.json({ bids })
  } catch (error) {
    console.error('Error fetching bids:', error)
    return NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 })
  }
}
