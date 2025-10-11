import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ServiceCard } from "@/components/marketplace/service-card"
import { CategorySidebar } from "@/components/marketplace/category-sidebar"
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header"
import { Pagination } from "@/components/marketplace/pagination"
import { Briefcase, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const ITEMS_PER_PAGE = 24

interface PageProps {
  params: {
    locale: string
  }
  searchParams: {
    category?: string
    search?: string
    sort?: string
    page?: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params
  const isArabic = locale === "ar"

  return {
    title: isArabic ? "سوق الخدمات المخصصة - OSDM" : "Custom Services Market - OSDM",
    description: isArabic
      ? "احصل على خدمات احترافية مخصصة من خبراء في مختلف المجالات"
      : "Get professional custom services from experts in various fields",
  }
}

export default async function ServicesPage({ params, searchParams }: PageProps) {
  const { locale } = params
  const isArabic = locale === "ar"

  // Parse search params
  const categoryId = searchParams.category
  const searchQuery = searchParams.search
  const sortBy = searchParams.sort || "newest"
  const page = parseInt(searchParams.page || "1", 10)

  // Build where clause
  const where: any = {
    status: "ACTIVE",
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
      orderBy = { orderCount: "desc" }
      break
    case "newest":
    default:
      orderBy = { createdAt: "desc" }
      break
  }

  // Fetch services and total count in parallel
  const [services, totalCount, categories] = await Promise.all([
    prisma.service.findMany({
      where,
      include: {
        User: {
          select: {
            username: true,
            avatar: true,
          },
        },
        ServiceCategory: {
          select: {
            nameAr: true,
            nameEn: true,
          },
        },
        ServicePackage: {
          select: {
            type: true,
            price: true,
          },
          orderBy: {
            price: "asc",
          },
        },
      },
      orderBy,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    }),
    prisma.service.count({ where }),
    prisma.serviceCategory.findMany({
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
            Service: true,
          },
        },
      },
    }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const sortOptions = [
    { value: "newest", labelAr: "الأحدث", labelEn: "Newest" },
    { value: "popular", labelAr: "الأكثر طلباً", labelEn: "Most Popular" },
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <Briefcase className="h-8 w-8 md:h-10 md:w-10" style={{ color: "#4691A9" }} />
          {isArabic ? "سوق الخدمات المخصصة" : "Custom Services Market"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          {isArabic
            ? "احصل على خدمات احترافية مخصصة من خبراء في مختلف المجالات"
            : "Get professional custom services from experts in various fields"}
        </p>
      </div>

      {/* Search and Filters */}
      <MarketplaceHeader
        locale={locale}
        isArabic={isArabic}
        basePath="/marketplace/services"
        sortOptions={sortOptions}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <CategorySidebar
            categories={categories.map(cat => ({
              ...cat,
              _count: {
                services: cat._count.Service,
              },
            }))}
            selectedCategoryId={categoryId}
            locale={locale}
            isArabic={isArabic}
            basePath="/marketplace/services"
            countKey="services"
          />
        </div>

        {/* Services Grid */}
        <div className="lg:col-span-3">
          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isArabic
                ? `عرض ${services.length} من ${totalCount} خدمة`
                : `Showing ${services.length} of ${totalCount} services`}
            </p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                {isArabic ? `نتائج البحث عن: "${searchQuery}"` : `Search results for: "${searchQuery}"`}
              </p>
            )}
          </div>

          {/* Services Grid */}
          {services.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={{
                      slug: service.slug,
                      titleAr: service.titleAr,
                      titleEn: service.titleEn,
                      thumbnail: service.thumbnail,
                      averageRating: Number(service.averageRating),
                      orderCount: service.orderCount,
                      seller: {
                        username: service.User.username,
                        avatar: service.User.avatar,
                      },
                      packages: service.ServicePackage.map(pkg => ({
                        type: pkg.type,
                        price: Number(pkg.price),
                      })),
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
                basePath="/marketplace/services"
              />
            </>
          ) : (
            /* Empty State */
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isArabic
                  ? "لم يتم العثور على خدمات. جرب البحث بكلمات مختلفة أو اختر تصنيف آخر."
                  : "No services found. Try searching with different keywords or select another category."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
