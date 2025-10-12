import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/marketplace/product-card"
import { CategorySidebar } from "@/components/marketplace/category-sidebar"
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header"
import { Pagination } from "@/components/marketplace/pagination"
import { Package, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const ITEMS_PER_PAGE = 24

interface PageProps {
  params: Promise<{
    locale: string
  }>
  searchParams: {
    category?: string
    search?: string
    sort?: string
    page?: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const isArabic = locale === "ar"

  return {
    title: isArabic ? "سوق المنتجات الرقمية الجاهزة - OSDM" : "Ready-Made Digital Products Market - OSDM",
    description: isArabic
      ? "اكتشف آلاف المنتجات الرقمية الجاهزة للتحميل الفوري - كتب، قوالب، دورات، وأكثر"
      : "Discover thousands of digital products ready for instant download - books, templates, courses, and more",
  }
}

export default async function ReadyProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const isArabic = locale === "ar"

  // Parse search params
  const categoryId = searchParams.category
  const searchQuery = searchParams.search
  const sortBy = searchParams.sort || "newest"
  const page = parseInt(searchParams.page || "1", 10)

  // Build where clause
  const where: any = {
    status: "APPROVED",
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (searchQuery) {
    where.OR = [
      { titleAr: { contains: searchQuery, mode: "insensitive" } },
      { titleEn: { contains: searchQuery, mode: "insensitive" } },
      { descriptionAr: { contains: searchQuery, mode: "insensitive" } },
      { descriptionEn: { contains: searchQuery, mode: "insensitive" } },
    ]
  }

  // Build orderBy clause
  let orderBy: any = { createdAt: "desc" }

  switch (sortBy) {
    case "popular":
      orderBy = { downloadCount: "desc" }
      break
    case "price-low":
      orderBy = { price: "asc" }
      break
    case "price-high":
      orderBy = { price: "desc" }
      break
    case "newest":
    default:
      orderBy = { createdAt: "desc" }
      break
  }

  // Fetch products and total count in parallel
  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        User: {
          select: {
            username: true,
            avatar: true,
          },
        },
        ProductCategory: {
          select: {
            nameAr: true,
            nameEn: true,
          },
        },
      },
      orderBy,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    }),
    prisma.product.count({ where }),
    prisma.productCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        slug: true,
        parentId: true,
        _count: {
          select: {
            Product: true,
          },
        },
      },
    }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <Package className="h-8 w-8 md:h-10 md:w-10" style={{ color: "#846F9C" }} />
          {isArabic ? "سوق المنتجات الرقمية الجاهزة" : "Ready-Made Digital Products Market"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          {isArabic
            ? "اكتشف آلاف المنتجات الرقمية الجاهزة للتحميل الفوري"
            : "Discover thousands of digital products ready for instant download"}
        </p>
      </div>

      {/* Search and Filters */}
      <MarketplaceHeader
        locale={locale}
        isArabic={isArabic}
        basePath="/marketplace/ready-products"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <CategorySidebar
            categories={categories.map(cat => ({
              ...cat,
              _count: {
                products: cat._count.Product,
              },
            }))}
            selectedCategoryId={categoryId}
            locale={locale}
            isArabic={isArabic}
            basePath="/marketplace/ready-products"
            countKey="products"
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isArabic
                ? `عرض ${products.length} من ${totalCount} منتج`
                : `Showing ${products.length} of ${totalCount} products`}
            </p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                {isArabic ? `نتائج البحث عن: "${searchQuery}"` : `Search results for: "${searchQuery}"`}
              </p>
            )}
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      slug: product.slug,
                      titleAr: product.titleAr,
                      titleEn: product.titleEn,
                      thumbnail: product.thumbnail,
                      price: Number(product.price),
                      averageRating: Number(product.averageRating),
                      downloadCount: product.downloadCount,
                      seller: {
                        username: product.User.username,
                        avatar: product.User.avatar,
                      },
                    }}
                    locale={locale}
                    isArabic={isArabic}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                locale={locale}
                isArabic={isArabic}
                basePath="/marketplace/ready-products"
              />
            </>
          ) : (
            /* Empty State */
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isArabic
                  ? "لم يتم العثور على منتجات. جرب البحث بكلمات مختلفة أو اختر تصنيف آخر."
                  : "No products found. Try searching with different keywords or select another category."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
