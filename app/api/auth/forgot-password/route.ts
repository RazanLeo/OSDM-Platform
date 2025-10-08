import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success for security (don't reveal if email exists)
    // In production, send actual email here

    if (user) {
      // TODO: Generate reset token and send email
      console.log(`Password reset requested for: ${email}`)
      // In production: Send email with reset link
    }

    return NextResponse.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة التعيين'
    })

  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
