import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const extraSchema = z.object({
  serviceId: z.string(),
  titleAr: z.string().min(3),
  titleEn: z.string().min(3),
  descriptionAr: z.string().min(10),
  descriptionEn: z.string().min(10),
  price: z.number().min(5),
  deliveryDays: z.number().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = extraSchema.parse(body)

    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    })

    if (!service || service.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const extra = await prisma.gigExtra.create({
      data: {
        id: nanoid(),
        ...validatedData,
      },
    })

    return NextResponse.json({ message: 'Gig extra created', extra })
  } catch (error) {
    console.error('Error creating gig extra:', error)
    return NextResponse.json({ error: 'Failed to create gig extra' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId required' }, { status: 400 })
    }

    const extras = await prisma.gigExtra.findMany({
      where: { serviceId, isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ extras })
  } catch (error) {
    console.error('Error fetching gig extras:', error)
    return NextResponse.json({ error: 'Failed to fetch gig extras' }, { status: 500 })
  }
}
