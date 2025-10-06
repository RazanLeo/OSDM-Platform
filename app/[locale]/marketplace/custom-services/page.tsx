import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { customServicesCategories } from "@/lib/data/marketplace-categories"
import { CustomServicesClient } from "./client"

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const { locale } = params
  const t = getDictionary(locale)

  return {
    title: t.gateway2Title,
    description: t.gateway2Desc,
  }
}

export default function CustomServicesPage({
  params,
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { locale } = params
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
