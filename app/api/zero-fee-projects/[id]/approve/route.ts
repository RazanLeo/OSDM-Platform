import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const zeroFeeProject = await prisma.zeroFeeProject.findUnique({
      where: { id },
    })

    if (!zeroFeeProject) {
      return NextResponse.json({ error: 'Zero fee project not found' }, { status: 404 })
    }

    if (zeroFeeProject.approvedAt) {
      return NextResponse.json({ error: 'Already approved' }, { status: 400 })
    }

    const updated = await prisma.zeroFeeProject.update({
      where: { id },
      data: {
        approvedBy: session.user.id,
        approvedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Zero fee project approved', zeroFeeProject: updated })
  } catch (error) {
    console.error('Error approving zero fee project:', error)
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 })
  }
}
