import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

// Update user (suspend, activate, update role, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params
    const body = await request.json()
    const { action, ...updateData } = body

    // Prevent admin from modifying themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot modify your own account" },
        { status: 400 }
      )
    }

    let updates: any = {}

    if (action === "suspend") {
      updates = {
        isSuspended: true,
        isActive: false,
        suspensionReason: updateData.reason || "Suspended by admin",
      }
    } else if (action === "activate") {
      updates = {
        isSuspended: false,
        isActive: true,
        suspensionReason: null,
      }
    } else if (action === "update_role") {
      updates = {
        role: updateData.role,
      }
    } else {
      // General update
      updates = updateData
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        isSuspended: true,
        suspensionReason: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    // Soft delete by deactivating instead of hard delete
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        isSuspended: true,
        suspensionReason: "Account deleted by admin",
      },
    })

    return NextResponse.json({
      success: true,
      message: "User account deactivated",
    })
  } catch (error) {
    console.error("Admin user delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
