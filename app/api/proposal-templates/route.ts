import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const templateSchema = z.object({
  titleAr: z.string().min(3),
  titleEn: z.string().min(3),
  contentAr: z.string().min(50),
  contentEn: z.string().min(50),
  category: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = templateSchema.parse(body)

    const template = await prisma.proposalTemplate.create({
      data: {
        id: nanoid(),
        freelancerId: session.user.id,
        ...validatedData,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Proposal template created', template })
  } catch (error) {
    console.error('Error creating proposal template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.proposalTemplate.findMany({
      where: { freelancerId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching proposal templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}
