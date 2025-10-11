import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SlidersHorizontal, ChevronRight, ChevronLeft } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface Category {
  id: string
  nameAr: string
  nameEn: string
  slug: string
  parentId: string | null
  children?: Category[]
  _count?: {
    products?: number
    services?: number
    projects?: number
  }
}

interface CategorySidebarProps {
  categories: Category[]
  selectedCategoryId?: string
  locale: string
  isArabic: boolean
  basePath: string // e.g., '/marketplace/ready-products'
  countKey?: "products" | "services" | "projects"
}

export function CategorySidebar({
  categories,
  selectedCategoryId,
  locale,
  isArabic,
  basePath,
  countKey = "products"
}: CategorySidebarProps) {
  // Organize categories into parent-child hierarchy
  const parentCategories = categories.filter(cat => !cat.parentId)
  const childrenMap = new Map<string, Category[]>()

  categories.forEach(cat => {
    if (cat.parentId) {
      if (!childrenMap.has(cat.parentId)) {
        childrenMap.set(cat.parentId, [])
      }
      childrenMap.get(cat.parentId)?.push(cat)
    }
  })

  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight

  return (
    <Card className="sticky top-4">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {isArabic ? "التصنيفات" : "Categories"}
          </h3>
          {selectedCategoryId && (
            <Link href={`/${locale}${basePath}`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                {isArabic ? "مسح" : "Clear"}
              </Button>
            </Link>
          )}
        </div>

        {/* All Categories Link */}
        <Link href={`/${locale}${basePath}`}>
          <div
            className={`flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors ${
              !selectedCategoryId ? "bg-accent font-medium" : ""
            }`}
          >
            <span className="text-sm">
              {isArabic ? "جميع التصنيفات" : "All Categories"}
            </span>
            <ChevronIcon className="h-4 w-4" />
          </div>
        </Link>

        <div className="my-3 border-t" />

        {/* Categories Accordion */}
        <Accordion type="multiple" className="w-full" defaultValue={parentCategories.slice(0, 5).map(c => c.id)}>
          {parentCategories.map((parent) => {
            const children = childrenMap.get(parent.id) || []
            const hasChildren = children.length > 0
            const parentName = isArabic ? parent.nameAr : parent.nameEn
            const isSelected = selectedCategoryId === parent.id

            return (
              <AccordionItem key={parent.id} value={parent.id} className="border-b-0">
                {hasChildren ? (
                  <>
                    <AccordionTrigger className="text-sm py-2 hover:no-underline hover:bg-accent rounded-md px-2">
                      <div className="flex items-center justify-between flex-1">
                        <span className={isSelected ? "font-medium" : ""}>
                          {parentName}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className={`space-y-1 ${isArabic ? "pr-4" : "pl-4"} mt-1`}>
                        {children.map((child) => {
                          const childName = isArabic ? child.nameAr : child.nameEn
                          const isChildSelected = selectedCategoryId === child.id
                          const count = child._count?.[countKey] || 0

                          return (
                            <Link
                              key={child.id}
                              href={`/${locale}${basePath}?category=${child.id}`}
                            >
                              <div
                                className={`flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors text-sm ${
                                  isChildSelected ? "bg-accent font-medium" : ""
                                }`}
                              >
                                <span className="truncate">{childName}</span>
                                {count > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0 h-5 min-w-[20px]"
                                  >
                                    {count}
                                  </Badge>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </>
                ) : (
                  <Link href={`/${locale}${basePath}?category=${parent.id}`}>
                    <div
                      className={`flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors text-sm ${
                        isSelected ? "bg-accent font-medium" : ""
                      }`}
                    >
                      <span>{parentName}</span>
                      <ChevronIcon className="h-4 w-4" />
                    </div>
                  </Link>
                )}
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}
