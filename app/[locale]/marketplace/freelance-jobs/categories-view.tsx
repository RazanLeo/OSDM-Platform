"use client"

import { useState } from "react"
import type { Locale } from "@/lib/i18n/config"
import type { Category } from "@/lib/data/marketplace-categories"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoriesViewProps {
  locale: Locale
  categories: Category[]
  onSelectType?: (categoryId: string, subcategoryId: string, typeId: string) => void
}

export function CategoriesView({ locale, categories, onSelectType }: CategoriesViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())
  const isArabic = locale === "ar"

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleSubcategory = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories)
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId)
    } else {
      newExpanded.add(subcategoryId)
    }
    setExpandedSubcategories(newExpanded)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isArabic ? "التصنيفات الأساسية" : "Main Categories"}
        </h2>
        <Badge variant="outline">
          {categories.length} {isArabic ? "تصنيف رئيسي" : "Categories"}
        </Badge>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id)
            const subcategoriesCount = category.subcategories.length
            const typesCount = category.subcategories.reduce(
              (sum, sub) => sum + sub.types.length,
              0
            )

            return (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      <Package className="h-5 w-5 text-[#846F9C]" />
                      <CardTitle className="text-lg">
                        {isArabic ? category.nameAr : category.nameEn}
                      </CardTitle>
                    </Button>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {subcategoriesCount} {isArabic ? "فرعي" : "sub"}
                      </Badge>
                      <Badge variant="outline">
                        {typesCount} {isArabic ? "نوع" : "types"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-2 mr-6">
                      {category.subcategories.map((subcategory) => {
                        const isSubExpanded = expandedSubcategories.has(subcategory.id)

                        return (
                          <div
                            key={subcategory.id}
                            className="border rounded-lg p-3 bg-muted/30"
                          >
                            <Button
                              variant="ghost"
                              className="flex items-center gap-2 p-0 h-auto hover:bg-transparent w-full justify-start"
                              onClick={() => toggleSubcategory(subcategory.id)}
                            >
                              {isSubExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <span className="font-semibold text-[#4691A9]">
                                {isArabic ? subcategory.nameAr : subcategory.nameEn}
                              </span>
                              <Badge variant="outline" className="mr-auto">
                                {subcategory.types.length}{" "}
                                {isArabic ? "نوع" : "types"}
                              </Badge>
                            </Button>

                            {isSubExpanded && (
                              <div className="mt-3 mr-6 space-y-1">
                                {subcategory.types.map((type) => (
                                  <Button
                                    key={type.id}
                                    variant="ghost"
                                    className="w-full justify-start h-auto py-2 px-3 text-sm hover:bg-[#89A58F]/10"
                                    onClick={() =>
                                      onSelectType?.(category.id, subcategory.id, type.id)
                                    }
                                  >
                                    <span className="text-muted-foreground">→</span>
                                    <span className="mr-2">
                                      {isArabic ? type.nameAr : type.nameEn}
                                    </span>
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
