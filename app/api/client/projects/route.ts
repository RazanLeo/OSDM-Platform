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

    const projects = await prisma.project.findMany({
      where: { clientId: session.user.id },
      include: {
        ProjectCategory: { select: { nameAr: true, nameEn: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedProjects = projects.map(p => ({
      id: p.id,
      titleAr: p.titleAr,
      titleEn: p.titleEn,
      descriptionAr: p.descriptionAr,
      descriptionEn: p.descriptionEn,
      budgetMin: parseFloat(p.budgetMin.toString()),
      budgetMax: parseFloat(p.budgetMax.toString()),
      durationDays: p.durationDays,
      categoryId: p.categoryId,
      status: p.status,
      proposalCount: p.proposalCount,
      createdAt: p.createdAt,
    }))

    return NextResponse.json({ success: true, data: formattedProjects })
  } catch (error) {
    console.error('Error fetching client projects:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch projects' }, { status: 500 })
  }
}
