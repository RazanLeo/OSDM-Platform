import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id },
    })

    if (!savedSearch || savedSearch.userId !== session.user.id) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 })
    }

    await prisma.savedSearch.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Saved search deleted' })
  } catch (error) {
    console.error('Error deleting saved search:', error)
    return NextResponse.json({ error: 'Failed to delete saved search' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id },
    })

    if (!savedSearch || savedSearch.userId !== session.user.id) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 })
    }

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: {
        nameAr: body.nameAr || savedSearch.nameAr,
        nameEn: body.nameEn || savedSearch.nameEn,
        filters: body.filters || savedSearch.filters,
        notificationsEnabled: body.notificationsEnabled ?? savedSearch.notificationsEnabled,
      },
    })

    return NextResponse.json({ message: 'Saved search updated', savedSearch: updated })
  } catch (error) {
    console.error('Error updating saved search:', error)
    return NextResponse.json({ error: 'Failed to update saved search' }, { status: 500 })
  }
}
