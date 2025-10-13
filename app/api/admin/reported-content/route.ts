import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return empty array for now - would need to implement Report model
    return NextResponse.json({ items: [] })
  } catch (error) {
    console.error("Admin reported content error:", error)
    return NextResponse.json(
      { error: "Failed to fetch reported content" },
      { status: 500 }
    )
  }
}
