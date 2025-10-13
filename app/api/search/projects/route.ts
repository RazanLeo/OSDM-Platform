import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const minBudget = searchParams.get('minBudget')
    const maxBudget = searchParams.get('maxBudget')
    const projectType = searchParams.get('projectType')
    const experienceLevel = searchParams.get('experienceLevel')
    const status = searchParams.get('status') || 'OPEN'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {
      status,
    }

    if (query) {
      where.OR = [
        { titleAr: { contains: query, mode: 'insensitive' } },
        { titleEn: { contains: query, mode: 'insensitive' } },
        { descriptionAr: { contains: query, mode: 'insensitive' } },
        { descriptionEn: { contains: query, mode: 'insensitive' } },
        { requiredSkills: { hasSome: [query] } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (subcategory) {
      where.subcategory = subcategory
    }

    if (minBudget) {
      where.budget = { ...where.budget, gte: parseFloat(minBudget) }
    }

    if (maxBudget) {
      where.budget = { ...where.budget, lte: parseFloat(maxBudget) }
    }

    if (projectType) {
      where.projectType = projectType
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel
    }

    const orderBy: any = {}
    if (sortBy === 'budget') {
      orderBy.budget = order
    } else if (sortBy === 'proposals') {
      orderBy.proposalCount = order
    } else {
      orderBy.createdAt = order
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          Client: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              profileImage: true,
              totalReviews: true,
              averageRating: true,
            },
          },
          ProjectBid: {
            select: {
              id: true,
              bidAmount: true,
            },
          },
          ZeroFeeProject: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json({
      projects,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error searching projects:', error)
    return NextResponse.json({ error: 'Failed to search projects' }, { status: 500 })
  }
}
