"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition, useEffect } from "react"

interface MarketplaceHeaderProps {
  locale: string
  isArabic: boolean
  basePath: string
  sortOptions?: Array<{
    value: string
    labelAr: string
    labelEn: string
  }>
}

const defaultSortOptions = [
  { value: "newest", labelAr: "الأحدث", labelEn: "Newest" },
  { value: "popular", labelAr: "الأكثر شعبية", labelEn: "Most Popular" },
  { value: "price-low", labelAr: "السعر: الأقل أولاً", labelEn: "Price: Low to High" },
  { value: "price-high", labelAr: "السعر: الأعلى أولاً", labelEn: "Price: High to Low" },
]

export function MarketplaceHeader({
  locale,
  isArabic,
  basePath,
  sortOptions = defaultSortOptions,
}: MarketplaceHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")

  // Update search input when URL changes
  useEffect(() => {
    setSearchInput(searchParams.get("search") || "")
  }, [searchParams])

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Reset to page 1 when changing filters
    if (key !== "page") {
      params.delete("page")
    }

    startTransition(() => {
      router.push(`/${locale}${basePath}?${params.toString()}`)
    })
  }

  const handleSearch = (value: string) => {
    setSearchInput(value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams("search", searchInput)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1">
        <Search className={`absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
        <Input
          placeholder={isArabic ? "ابحث..." : "Search..."}
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          className={`${isArabic ? "pr-10" : "pl-10"}`}
          disabled={isPending}
        />
      </form>

      {/* Sort */}
      <Select
        value={searchParams.get("sort") || "newest"}
        onValueChange={(value) => updateParams("sort", value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder={isArabic ? "ترتيب حسب" : "Sort by"} />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {isArabic ? option.labelAr : option.labelEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
