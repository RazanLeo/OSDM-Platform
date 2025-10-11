import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
import { z } from "zod"

const proposalSchema = z.object({
  projectId: z.string(),
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
  proposedAmount: z.number().min(1, "Proposed amount must be greater than 0"),
  deliveryDays: z.number().int().min(1, "Delivery days must be at least 1"),
  attachments: z.array(z.string()).optional().default([]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = proposalSchema.parse(body)

    // Fetch project
    const project = await prisma.project.findUnique({
      where: {
        id: validatedData.projectId,
        status: "OPEN",
      },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or closed" },
        { status: 404 }
      )
    }

    // Check if user is project owner
    if (project.clientId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot submit a proposal to your own project" },
        { status: 400 }
      )
    }

    // Check if user already submitted a proposal
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        projectId: validatedData.projectId,
        freelancerId: session.user.id,
      },
    })

    if (existingProposal) {
      return NextResponse.json(
        { error: "You have already submitted a proposal for this project" },
        { status: 400 }
      )
    }

    // Create proposal
    const proposal = await prisma.$transaction(async (tx) => {
      const newProposal = await tx.proposal.create({
        data: {
          id: `PROP-${nanoid(10)}`,
          projectId: validatedData.projectId,
          freelancerId: session.user!.id,
          coverLetter: validatedData.coverLetter,
          proposedAmount: validatedData.proposedAmount,
          deliveryDays: validatedData.deliveryDays,
          attachments: validatedData.attachments,
          status: "PENDING",
          updatedAt: new Date(),
        },
        include: {
          User: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
          Project: {
            select: {
              titleAr: true,
              titleEn: true,
            },
          },
        },
      })

      // Update project proposal count
      await tx.project.update({
        where: { id: validatedData.projectId },
        data: {
          proposalCount: { increment: 1 },
        },
      })

      // Create notification for project owner
      await tx.notification.create({
        data: {
          id: `NOT-${nanoid(10)}`,
          userId: project.clientId,
          type: "SYSTEM",
          titleAr: "عرض جديد على مشروعك",
          titleEn: "New Proposal on Your Project",
          messageAr: `${newProposal.User.fullName} قدم عرضاً على مشروع "${newProposal.Project.titleAr}"`,
          messageEn: `${newProposal.User.fullName} submitted a proposal for "${newProposal.Project.titleEn}"`,
          link: `/dashboard/buyer/projects/${project.id}`,
        },
      })

      // Create notification for freelancer
      await tx.notification.create({
        data: {
          id: `NOT-${nanoid(10)}`,
          userId: session.user!.id,
          type: "SYSTEM",
          titleAr: "تم إرسال عرضك",
          titleEn: "Proposal Submitted",
          messageAr: `تم إرسال عرضك على مشروع "${newProposal.Project.titleAr}" بنجاح`,
          messageEn: `Your proposal for "${newProposal.Project.titleEn}" has been submitted successfully`,
          link: `/dashboard/seller/proposals/${newProposal.id}`,
        },
      })

      return newProposal
    })

    return NextResponse.json(
      {
        success: true,
        message: "Proposal submitted successfully",
        data: proposal,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Proposal submission error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to submit proposal" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const freelancerId = searchParams.get("freelancerId")
    const status = searchParams.get("status")

    const where: any = {}

    if (projectId) {
      where.projectId = projectId
    }

    if (freelancerId) {
      where.freelancerId = freelancerId
    } else {
      // By default, only show user's own proposals
      where.freelancerId = session.user.id
    }

    if (status) {
      where.status = status
    }

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        Project: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            slug: true,
            status: true,
            User: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: proposals,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Fetch proposals error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch proposals" },
      { status: 500 }
    )
  }
}
