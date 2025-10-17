import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Fetch proposal with project details
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        Project: {
          select: {
            id: true,
            clientId: true,
            titleAr: true,
            titleEn: true,
            status: true,
          },
        },
        User: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      )
    }

    // Verify user is project owner
    if (proposal.Project.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "Only project owner can reject proposals" },
        { status: 403 }
      )
    }

    // Check if proposal is already rejected or accepted
    if (proposal.status === "REJECTED") {
      return NextResponse.json(
        { error: "Proposal is already rejected" },
        { status: 400 }
      )
    }

    if (proposal.status === "ACCEPTED") {
      return NextResponse.json(
        { error: "Cannot reject an accepted proposal" },
        { status: 400 }
      )
    }

    // Update proposal status
    const updatedProposal = await prisma.$transaction(async (tx) => {
      const updated = await tx.proposal.update({
        where: { id },
        data: {
          status: "REJECTED",
          updatedAt: new Date(),
        },
      })

      // Create notification for freelancer
      await tx.notification.create({
        data: {
          id: `NOT-${nanoid(10)}`,
          userId: proposal.freelancerId,
          type: "SYSTEM",
          titleAr: "تم رفض عرضك",
          titleEn: "Proposal Declined",
          messageAr: `تم رفض عرضك على مشروع "${proposal.Project.titleAr}"`,
          messageEn: `Your proposal for "${proposal.Project.titleEn}" has been declined`,
          link: `/dashboard/seller/proposals/${proposal.id}`,
        },
      })

      return updated
    })

    return NextResponse.json(
      {
        success: true,
        message: "Proposal rejected successfully",
        data: updatedProposal,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Proposal rejection error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to reject proposal" },
      { status: 500 }
    )
  }
}
