import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const industryCategorySchema = z.object({
  nameAr: z.string().min(2),
  nameEn: z.string().min(2),
  slug: z.string().min(2),
  icon: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = industryCategorySchema.parse(body)

    const existing = await prisma.industryCategory.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existing) {
      return NextResponse.json({ error: 'Industry category already exists' }, { status: 400 })
    }

    const category = await prisma.industryCategory.create({
      data: {
        id: nanoid(),
        ...validatedData,
      },
    })

    return NextResponse.json({ message: 'Industry category created', category })
  } catch (error) {
    console.error('Error creating industry category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.industryCategory.findMany({
      where: { isActive: true },
      orderBy: { nameEn: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching industry categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
