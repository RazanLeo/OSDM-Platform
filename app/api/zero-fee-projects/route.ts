import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const zeroFeeSchema = z.object({
  projectId: z.string(),
  reason: z.string().min(10),
  sponsorId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = zeroFeeSchema.parse(body)

    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
    })

    if (!project || project.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 403 })
    }

    const existing = await prisma.zeroFeeProject.findUnique({
      where: { projectId: validatedData.projectId },
    })

    if (existing) {
      return NextResponse.json({ error: 'Project already has zero fee application' }, { status: 400 })
    }

    const zeroFeeProject = await prisma.zeroFeeProject.create({
      data: {
        id: nanoid(),
        ...validatedData,
      },
    })

    return NextResponse.json({ message: 'Zero fee application submitted', zeroFeeProject })
  } catch (error) {
    console.error('Error creating zero fee project:', error)
    return NextResponse.json({ error: 'Failed to create zero fee application' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}

    if (status === 'approved') {
      where.approvedAt = { not: null }
    } else if (status === 'pending') {
      where.approvedAt = null
    }

    const zeroFeeProjects = await prisma.zeroFeeProject.findMany({
      where,
      include: {
        Project: {
          include: {
            Client: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ zeroFeeProjects })
  } catch (error) {
    console.error('Error fetching zero fee projects:', error)
    return NextResponse.json({ error: 'Failed to fetch zero fee projects' }, { status: 500 })
  }
}
