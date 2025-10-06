import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { blobService, ALLOWED_FILE_TYPES, MAX_FILE_SIZES } from '@/lib/upload/vercel-blob'

// POST - رفع ملف
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('type') as string // 'image', 'document', 'product', etc.
    const folder = formData.get('folder') as string // 'products', 'profiles', 'attachments', etc.

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'الملف مطلوب' },
        { status: 400 }
      )
    }

    // التحقق من نوع الملف
    let allowedTypes: string[] = ALLOWED_FILE_TYPES.all
    let maxSize: number = MAX_FILE_SIZES.other

    if (fileType === 'image') {
      allowedTypes = ALLOWED_FILE_TYPES.images
      maxSize = MAX_FILE_SIZES.image
    } else if (fileType === 'document') {
      allowedTypes = ALLOWED_FILE_TYPES.documents
      maxSize = MAX_FILE_SIZES.document
    } else if (fileType === 'archive') {
      allowedTypes = ALLOWED_FILE_TYPES.archives
      maxSize = MAX_FILE_SIZES.archive
    } else if (fileType === 'audio') {
      allowedTypes = ALLOWED_FILE_TYPES.audio
      maxSize = MAX_FILE_SIZES.audio
    } else if (fileType === 'video') {
      allowedTypes = ALLOWED_FILE_TYPES.video
      maxSize = MAX_FILE_SIZES.video
    }

    if (!blobService.isValidFileType(file.name, allowedTypes)) {
      return NextResponse.json(
        {
          success: false,
          error: `نوع الملف غير مسموح. الأنواع المسموحة: ${allowedTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // التحقق من حجم الملف
    if (!blobService.isValidFileSize(file.size, maxSize)) {
      return NextResponse.json(
        {
          success: false,
          error: `حجم الملف كبير جداً. الحد الأقصى: ${maxSize} ميجابايت`,
        },
        { status: 400 }
      )
    }

    // توليد اسم فريد للملف
    const folderPath = folder || 'general'
    const pathname = blobService.generateUniqueFilename(file.name, session.user.id)
    const fullPath = `${folderPath}/${pathname}`

    // رفع الملف
    const uploadResult = await blobService.uploadFile(file, fullPath, {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json({
      success: true,
      message: 'تم رفع الملف بنجاح',
      data: {
        url: uploadResult.url,
        pathname: uploadResult.pathname,
        contentType: uploadResult.contentType,
        size: file.size,
        originalName: file.name,
      },
    })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'فشل في رفع الملف',
      },
      { status: 500 }
    )
  }
}

// DELETE - حذف ملف
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'رابط الملف مطلوب' },
        { status: 400 }
      )
    }

    // التحقق من أن الملف يخص المستخدم (عبر فحص المسار)
    if (!url.includes(session.user.id)) {
      const user = await prisma?.user.findUnique({
        where: { id: session.user.id },
      })

      // الإدارة يمكنها حذف أي ملف
      if (user?.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'ليس لديك صلاحية لحذف هذا الملف' },
          { status: 403 }
        )
      }
    }

    await blobService.deleteFile(url)

    return NextResponse.json({
      success: true,
      message: 'تم حذف الملف بنجاح',
    })
  } catch (error: any) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'فشل في حذف الملف',
      },
      { status: 500 }
    )
  }
}
