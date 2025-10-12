import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// Validation schema for time entry
const timeEntrySchema = z.object({
  contractId: z.string(),
  hours: z.number().min(0.25).max(24),
  description: z.string().min(10),
  date: z.string().datetime(),
  screenshots: z.array(z.string()).optional(),
})

// POST /api/time-tracking - Create time entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = timeEntrySchema.parse(body)

    // Verify contract exists and user is the freelancer
    const contract = await prisma.contract.findUnique({
      where: { id: validatedData.contractId },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    if (contract.freelancerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        id: nanoid(),
        contractId: validatedData.contractId,
        freelancerId: session.user.id,
        hours: validatedData.hours,
        description: validatedData.description,
        date: new Date(validatedData.date),
        screenshots: validatedData.screenshots || [],
      },
    })

    return NextResponse.json({
      message: 'Time entry created successfully',
      timeEntry,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating time entry:', error)
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    )
  }
}

// GET /api/time-tracking - List time entries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contractId = searchParams.get('contractId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const isApproved = searchParams.get('isApproved')

    if (!contractId) {
      return NextResponse.json(
        { error: 'contractId is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this contract
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    if (
      contract.freelancerId !== session.user.id &&
      contract.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const where: any = { contractId }

    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) }
    }

    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) }
    }

    if (isApproved !== null && isApproved !== undefined) {
      where.isApproved = isApproved === 'true'
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    })

    // Calculate totals
    const totalHours = timeEntries.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0
    )
    const approvedHours = timeEntries
      .filter((entry) => entry.isApproved)
      .reduce((sum, entry) => sum + Number(entry.hours), 0)

    return NextResponse.json({
      timeEntries,
      summary: {
        totalHours,
        approvedHours,
        pendingHours: totalHours - approvedHours,
        entriesCount: timeEntries.length,
      },
    })
  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    )
  }
}
