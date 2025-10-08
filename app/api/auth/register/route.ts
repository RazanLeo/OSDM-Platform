import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  phoneNumber: z.string().optional(),
  accountType: z.string().optional(),
  // No role - all users are regular USER role with buyer/seller capabilities

  // Company fields
  companyName: z.string().optional(),
  companyRegistration: z.string().optional(),
  taxNumber: z.string().optional(),

  // Location
  country: z.string().optional(),
  city: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        {
          error: existingUser.email === validatedData.email
            ? "البريد الإلكتروني مستخدم بالفعل"
            : "اسم المستخدم مستخدم بالفعل"
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user - all users are regular users with buyer/seller access
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        password: hashedPassword,
        fullName: validatedData.fullName,
        phone: validatedData.phoneNumber, // phoneNumber → phone
        role: 'USER', // All registered users are USER role
        accountType: validatedData.accountType?.toUpperCase() || 'INDIVIDUAL', // individual → INDIVIDUAL
        companyName: validatedData.companyName,
        companyRegistration: validatedData.companyRegistration,
        taxNumber: validatedData.taxNumber,
        country: validatedData.country || "Saudi Arabia",
        city: validatedData.city,
      }
    })

    // Create seller profile for all users (everyone can sell)
    await prisma.sellerProfile.create({
      data: {
        userId: user.id,
      }
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      user: userWithoutPassword
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب" },
      { status: 500 }
    )
  }
}
