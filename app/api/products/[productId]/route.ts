import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        User: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
        ProductCategory: {
          select: {
            nameAr: true,
            nameEn: true,
            slug: true,
          },
        },
        ProductFile: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            fileType: true,
          },
        },
        ProductImage: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
        ProductReview: {
          include: {
            User: {
              select: {
                fullName: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate average rating and review count
    const reviewCount = product.ProductReview.length
    const averageRating = reviewCount > 0
      ? product.ProductReview.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0

    const productData = {
      ...product,
      averageRating,
      reviewCount,
    }

    return NextResponse.json({
      success: true,
      data: productData,
    })
  } catch (error: any) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const body = await request.json()

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    })
  } catch (error: any) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params

    await prisma.product.delete({
      where: { id: productId },
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
