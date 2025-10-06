"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Category } from "@/lib/data/marketplace-categories"
import { ChevronRight } from "lucide-react"

interface MarketplaceCategoryAccordionProps {
  categories: Category[]
  locale: string
  marketplaceType: "ready-products" | "custom-services" | "freelance-jobs"
}

export function MarketplaceCategoryAccordion({
  categories,
  locale,
  marketplaceType,
}: MarketplaceCategoryAccordionProps) {
  const router = useRouter()
  const [openCategories, setOpenCategories] = useState<string[]>([])
  const [openSubcategories, setOpenSubcategories] = useState<string[]>([])

  const handleTypeClick = (categoryId: string, subcategoryId: string, typeId: string) => {
    router.push(
      `/${locale}/marketplace/${marketplaceType}?category=${categoryId}&subcategory=${subcategoryId}&type=${typeId}`,
    )
  }

  return (
    <div className="w-full">
      <Accordion type="multiple" value={openCategories} onValueChange={setOpenCategories} className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-b">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
              <span className="flex items-center gap-2">{locale === "ar" ? category.nameAr : category.nameEn}</span>
            </AccordionTrigger>
            <AccordionContent>
              <Accordion
                type="multiple"
                value={openSubcategories}
                onValueChange={setOpenSubcategories}
                className="w-full pl-4"
              >
                {category.subcategories.map((subcategory) => (
                  <AccordionItem key={subcategory.id} value={subcategory.id} className="border-b last:border-b-0">
                    <AccordionTrigger className="text-base font-medium hover:no-underline py-3">
                      <span className="flex items-center gap-2">
                        {locale === "ar" ? subcategory.nameAr : subcategory.nameEn}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-4 space-y-2 py-2">
                        {subcategory.types.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => handleTypeClick(category.id, subcategory.id, type.id)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors group"
                          >
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                              {locale === "ar" ? type.nameAr : type.nameEn}
                            </span>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
