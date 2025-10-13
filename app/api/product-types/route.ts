import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const productTypeSchema = z.object({
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
    const validatedData = productTypeSchema.parse(body)

    const existing = await prisma.productType.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existing) {
      return NextResponse.json({ error: 'Product type already exists' }, { status: 400 })
    }

    const productType = await prisma.productType.create({
      data: {
        id: nanoid(),
        ...validatedData,
      },
    })

    return NextResponse.json({ message: 'Product type created', productType })
  } catch (error) {
    console.error('Error creating product type:', error)
    return NextResponse.json({ error: 'Failed to create product type' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const productTypes = await prisma.productType.findMany({
      where: { isActive: true },
      orderBy: { nameEn: 'asc' },
    })

    return NextResponse.json({ productTypes })
  } catch (error) {
    console.error('Error fetching product types:', error)
    return NextResponse.json({ error: 'Failed to fetch product types' }, { status: 500 })
  }
}
