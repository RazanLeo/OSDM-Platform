import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10')

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { skills: true },
    })

    const userSkills = user?.skills || []

    const skillVerifications = await prisma.skillVerification.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      select: { skill: true },
    })

    const verifiedSkills = skillVerifications.map(v => v.skill)
    const allSkills = [...new Set([...userSkills, ...verifiedSkills])]

    const previousBids = await prisma.projectBid.findMany({
      where: { freelancerId: session.user.id },
      select: { Project: { select: { category: true, subcategory: true } } },
    })

    const preferredCategories = [...new Set(previousBids.map(b => b.Project.category))]

    const recommendations = await prisma.project.findMany({
      where: {
        status: 'OPEN',
        OR: [
          { requiredSkills: { hasSome: allSkills } },
          { category: { in: preferredCategories } },
        ],
        ProjectBid: {
          none: {
            freelancerId: session.user.id,
          },
        },
      },
      include: {
        Client: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            profileImage: true,
            averageRating: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { proposalCount: 'asc' },
      ],
      take: limit,
    })

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error fetching project recommendations:', error)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
