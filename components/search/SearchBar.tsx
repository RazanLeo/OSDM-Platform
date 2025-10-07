"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"

interface SearchBarProps {
  locale: "ar" | "en"
}

export function SearchBar({ locale }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const isRTL = locale === "ar"

  const t = {
    search: isRTL ? "ابحث..." : "Search...",
    product: isRTL ? "منتج" : "Product",
    service: isRTL ? "خدمة" : "Service",
    job: isRTL ? "مشروع" : "Job",
    noResults: isRTL ? "لا توجد نتائج" : "No results",
    viewAll: isRTL ? "عرض جميع النتائج" : "View all results",
  }

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`)
        const data = await res.json()
        setResults(data.results || [])
        setIsOpen(true)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (item: any) => {
    const baseUrl = `/${locale}/marketplace`
    let url = ""

    switch (item.type) {
      case "product":
        url = `${baseUrl}/ready-products/${item.id}`
        break
      case "service":
        url = `${baseUrl}/custom-services/${item.id}`
        break
      case "job":
        url = `${baseUrl}/freelance-jobs/${item.id}`
        break
    }

    if (url) {
      router.push(url)
      setQuery("")
      setIsOpen(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isRTL ? "ar-SA" : "en-US", {
      style: "currency",
      currency: "SAR",
    }).format(price)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "product":
        return t.product
      case "service":
        return t.service
      case "job":
        return t.job
      default:
        return type
    }
  }

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <Search className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
        <Input
          type="text"
          placeholder={t.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"}`}
          dir={isRTL ? "rtl" : "ltr"}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 ${isRTL ? "left-2" : "right-2"} h-6 w-6 p-0`}
            onClick={() => {
              setQuery("")
              setResults([])
              setIsOpen(false)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <Loader2 className={`absolute top-3 h-4 w-4 animate-spin text-muted-foreground ${isRTL ? "left-3" : "right-3"}`} />
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className={`absolute top-full mt-2 w-full rounded-md border bg-popover shadow-lg z-50 ${isRTL ? "text-right" : "text-left"}`}>
          <Command dir={isRTL ? "rtl" : "ltr"}>
            <CommandList>
              <CommandGroup>
                {results.map((item) => (
                  <CommandItem
                    key={`${item.type}-${item.id}`}
                    onSelect={() => handleSelect(item)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-3 w-full">
                      {item.images?.[0] && (
                        <div className="w-12 h-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                          <img
                            src={item.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm truncate">
                            {isRTL ? item.titleAr : item.titleEn}
                          </p>
                          <Badge variant="outline" className="flex-shrink-0 text-xs">
                            {getTypeLabel(item.type)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {isRTL ? item.descriptionAr?.slice(0, 60) : item.descriptionEn?.slice(0, 60)}...
                        </p>
                        {item.type === "product" && (
                          <p className="text-sm font-semibold mt-1">
                            {formatPrice(item.price)}
                          </p>
                        )}
                        {item.type === "service" && item.startingPrice && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {isRTL ? "يبدأ من " : "Starting at "}
                            {formatPrice(item.startingPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          {/* View All Results */}
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                router.push(`/${locale}/search?q=${encodeURIComponent(query)}`)
                setIsOpen(false)
              }}
            >
              {t.viewAll} ({results.length}+)
            </Button>
          </div>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full mt-2 w-full rounded-md border bg-popover p-4 shadow-lg z-50">
          <CommandEmpty>{t.noResults}</CommandEmpty>
        </div>
      )}
    </div>
  )
}
