import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// PUT /api/time-tracking/[id]/approve - Approve time entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get time entry
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id },
      include: {
        Contract: true,
      },
    })

    if (!timeEntry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }

    // Verify user is the client
    if (timeEntry.Contract.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Approve time entry
    const updatedEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        isApproved: true,
        approvedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Time entry approved successfully',
      timeEntry: updatedEntry,
    })
  } catch (error) {
    console.error('Error approving time entry:', error)
    return NextResponse.json(
      { error: 'Failed to approve time entry' },
      { status: 500 }
    )
  }
}
