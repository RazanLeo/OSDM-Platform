import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { customServicesCategories } from "@/lib/data/marketplace-categories"
import { CustomServicesClient } from "./client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = getDictionary(locale)

  return {
    title: t.gateway2Title,
    description: t.gateway2Desc,
  }
}

export default async function CustomServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { locale } = await params
  const t = getDictionary(locale)

  return (
    <CustomServicesClient
      locale={locale}
      categories={customServicesCategories}
      translations={t}
      searchParams={searchParams}
    />
  )
}
