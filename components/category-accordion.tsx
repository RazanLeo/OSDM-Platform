"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { Category } from "@/lib/data/marketplace-categories"

interface CategoryAccordionProps {
  categories: Category[]
  locale: string
}

export function CategoryAccordion({ categories, locale }: CategoryAccordionProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(null)
  const router = useRouter()
  const isArabic = locale === "ar"

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
    setExpandedSubcategory(null)
  }

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategory(expandedSubcategory === subcategoryId ? null : subcategoryId)
  }

  const handleTypeClick = (categoryId: string, subcategoryId: string, typeId: string) => {
    const params = new URLSearchParams({
      category: categoryId,
      subcategory: subcategoryId,
      type: typeId,
    })
    router.push(`/${locale}/marketplace?${params.toString()}`)
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div key={category.id} className="border border-border/50 rounded-lg overflow-hidden bg-card/30">
          {/* Main Category */}
          <button
            onClick={() => toggleCategory(category.id)}
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-left"
          >
            <span className="text-lg font-semibold bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
              {isArabic ? category.nameAr : category.nameEn}
            </span>
            {expandedCategory === category.id ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Subcategories */}
          {expandedCategory === category.id && (
            <div className="border-t border-border/50 bg-background/50">
              {category.subcategories.map((subcategory) => (
                <div key={subcategory.id} className="border-b border-border/30 last:border-b-0">
                  <button
                    onClick={() => toggleSubcategory(subcategory.id)}
                    className="w-full flex items-center justify-between p-3 pl-8 hover:bg-accent/30 transition-colors text-left"
                  >
                    <span className="font-medium text-foreground">
                      {isArabic ? subcategory.nameAr : subcategory.nameEn}
                    </span>
                    {expandedSubcategory === subcategory.id ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Types */}
                  {expandedSubcategory === subcategory.id && (
                    <div className="bg-background/80 p-4 pl-12 space-y-2">
                      {subcategory.types.map((type) => (
                        <div
                          key={type.id}
                          onClick={() => handleTypeClick(category.id, subcategory.id, type.id)}
                          className="flex items-center gap-2 p-2 rounded hover:bg-accent/20 transition-colors cursor-pointer"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#846F9C] to-[#4691A9]" />
                          <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            {isArabic ? type.nameAr : type.nameEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
