import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const skillSchema = z.object({
  skill: z.string().min(2),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  certificateUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = skillSchema.parse(body)

    const existing = await prisma.skillVerification.findFirst({
      where: {
        userId: session.user.id,
        skill: validatedData.skill,
        isActive: true,
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Skill already verified' }, { status: 400 })
    }

    const verification = await prisma.skillVerification.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        skill: validatedData.skill,
        level: validatedData.level,
        certificateUrl: validatedData.certificateUrl,
      },
    })

    return NextResponse.json({ message: 'Skill verification submitted', verification })
  } catch (error) {
    console.error('Error creating skill verification:', error)
    return NextResponse.json({ error: 'Failed to verify skill' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const verifications = await prisma.skillVerification.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ verifications })
  } catch (error) {
    console.error('Error fetching skill verifications:', error)
    return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 })
  }
}
