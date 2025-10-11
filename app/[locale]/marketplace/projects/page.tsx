import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ProjectCard } from "@/components/marketplace/project-card"
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
    title: isArabic ? "سوق المشاريع الحرة - OSDM" : "Freelance Projects Market - OSDM",
    description: isArabic
      ? "ابحث عن مشاريع مناسبة لمهاراتك وقدم عروضك للعملاء"
      : "Find projects that match your skills and submit your proposals to clients",
  }
}

export default async function ProjectsPage({ params, searchParams }: PageProps) {
  const { locale } = params
  const isArabic = locale === "ar"

  // Parse search params
  const categoryId = searchParams.category
  const searchQuery = searchParams.search
  const sortBy = searchParams.sort || "newest"
  const page = parseInt(searchParams.page || "1", 10)

  // Build where clause
  const where: any = {
    status: "OPEN",
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
    case "budget-high":
      orderBy = { budgetMax: "desc" }
      break
    case "budget-low":
      orderBy = { budgetMin: "asc" }
      break
    case "newest":
    default:
      orderBy = { createdAt: "desc" }
      break
  }

  // Fetch projects and total count in parallel
  const [projects, totalCount, categories] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        User: {
          select: {
            username: true,
            avatar: true,
          },
        },
        ProjectCategory: {
          select: {
            nameAr: true,
            nameEn: true,
          },
        },
        _count: {
          select: {
            Proposal: true,
          },
        },
      },
      orderBy,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    }),
    prisma.project.count({ where }),
    prisma.projectCategory.findMany({
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
            Project: true,
          },
        },
      },
    }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const sortOptions = [
    { value: "newest", labelAr: "الأحدث", labelEn: "Newest" },
    { value: "budget-high", labelAr: "الميزانية: الأعلى أولاً", labelEn: "Budget: High to Low" },
    { value: "budget-low", labelAr: "الميزانية: الأقل أولاً", labelEn: "Budget: Low to High" },
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <Briefcase className="h-8 w-8 md:h-10 md:w-10" style={{ color: "#846F9C" }} />
          {isArabic ? "سوق المشاريع الحرة" : "Freelance Projects Market"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          {isArabic
            ? "ابحث عن مشاريع مناسبة لمهاراتك وقدم عروضك للعملاء"
            : "Find projects that match your skills and submit your proposals to clients"}
        </p>
      </div>

      {/* Search and Filters */}
      <MarketplaceHeader
        locale={locale}
        isArabic={isArabic}
        basePath="/marketplace/projects"
        sortOptions={sortOptions}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <CategorySidebar
            categories={categories.map(cat => ({
              ...cat,
              _count: {
                projects: cat._count.Project,
              },
            }))}
            selectedCategoryId={categoryId}
            locale={locale}
            isArabic={isArabic}
            basePath="/marketplace/projects"
            countKey="projects"
          />
        </div>

        {/* Projects Grid */}
        <div className="lg:col-span-3">
          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isArabic
                ? `عرض ${projects.length} من ${totalCount} مشروع`
                : `Showing ${projects.length} of ${totalCount} projects`}
            </p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                {isArabic ? `نتائج البحث عن: "${searchQuery}"` : `Search results for: "${searchQuery}"`}
              </p>
            )}
          </div>

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={{
                      slug: project.slug,
                      titleAr: project.titleAr,
                      titleEn: project.titleEn,
                      budgetMin: project.budgetMin ? Number(project.budgetMin) : null,
                      budgetMax: project.budgetMax ? Number(project.budgetMax) : null,
                      budgetType: project.budgetType,
                      duration: project.duration,
                      skills: project.skills,
                      createdAt: project.createdAt,
                      client: {
                        username: project.User.username,
                        avatar: project.User.avatar,
                      },
                      _count: {
                        proposals: project._count.Proposal,
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
                basePath="/marketplace/projects"
              />
            </>
          ) : (
            /* Empty State */
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isArabic
                  ? "لم يتم العثور على مشاريع. جرب البحث بكلمات مختلفة أو اختر تصنيف آخر."
                  : "No projects found. Try searching with different keywords or select another category."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
