"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  locale: string
  isArabic: boolean
  basePath: string
}

export function Pagination({
  currentPage,
  totalPages,
  locale,
  isArabic,
  basePath,
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())

    startTransition(() => {
      router.push(`/${locale}${basePath}?${params.toString()}`)
    })
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push("...")
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("...")
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  const PrevIcon = isArabic ? ChevronRight : ChevronLeft
  const NextIcon = isArabic ? ChevronLeft : ChevronRight

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
        className="gap-1"
      >
        <PrevIcon className="h-4 w-4" />
        {isArabic ? "السابق" : "Previous"}
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 mx-2">
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <div key={`ellipsis-${index}`} className="px-2">
                ...
              </div>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <Button
              key={pageNum}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => goToPage(pageNum)}
              disabled={isPending}
              className={`w-9 h-9 p-0 ${
                isActive
                  ? "bg-gradient-to-r from-[#846F9C] to-[#4691A9] hover:opacity-90"
                  : ""
              }`}
            >
              {pageNum}
            </Button>
          )
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
        className="gap-1"
      >
        {isArabic ? "التالي" : "Next"}
        <NextIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
