import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const savedSearchSchema = z.object({
  nameAr: z.string().min(2),
  nameEn: z.string().min(2),
  searchType: z.enum(['PRODUCT', 'SERVICE', 'PROJECT']),
  filters: z.record(z.any()),
  notificationsEnabled: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = savedSearchSchema.parse(body)

    const savedSearch = await prisma.savedSearch.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        ...validatedData,
      },
    })

    return NextResponse.json({ message: 'Search saved', savedSearch })
  } catch (error) {
    console.error('Error saving search:', error)
    return NextResponse.json({ error: 'Failed to save search' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const searchType = searchParams.get('searchType')

    const where: any = { userId: session.user.id }
    if (searchType) {
      where.searchType = searchType
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ savedSearches })
  } catch (error) {
    console.error('Error fetching saved searches:', error)
    return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 })
  }
}
