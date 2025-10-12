import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const templateSchema = z.object({
  titleAr: z.string().min(3),
  titleEn: z.string().min(3),
  contentAr: z.string().min(10),
  contentEn: z.string().min(10),
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

    const template = await prisma.sellerResponseTemplate.create({
      data: {
        id: nanoid(),
        sellerId: session.user.id,
        ...validatedData,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Template created', template })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.sellerResponseTemplate.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}
