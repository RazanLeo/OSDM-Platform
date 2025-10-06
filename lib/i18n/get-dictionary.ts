import type { Locale } from "./config"
import { translations } from "./translations"

export function getDictionary(locale: Locale) {
  return translations[locale]
}
