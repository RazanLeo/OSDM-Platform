import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { freelanceJobsCategories } from "@/lib/data/marketplace-categories"
import { FreelanceJobsClient } from "./client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = getDictionary(locale)

  return {
    title: t.gateway3Title,
    description: t.gateway3Desc,
  }
}

export default async function FreelanceJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { locale } = await params
  const t = getDictionary(locale)

  return (
    <FreelanceJobsClient
      locale={locale}
      categories={freelanceJobsCategories}
      translations={t}
      searchParams={searchParams}
    />
  )
}
