import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { readyProductsCategories } from "@/lib/data/marketplace-categories"
import { ReadyProductsClient } from "./client"

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const { locale } = params
  const t = getDictionary(locale)

  return {
    title: t.gateway1Title,
    description: t.gateway1Desc,
  }
}

export default function ReadyProductsPage({
  params,
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { locale } = params
  const t = getDictionary(locale)

  return (
    <ReadyProductsClient
      locale={locale}
      categories={readyProductsCategories}
      translations={t}
      searchParams={searchParams}
    />
  )
}
