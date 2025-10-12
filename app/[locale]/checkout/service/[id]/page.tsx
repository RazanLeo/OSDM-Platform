import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { ServiceCheckoutForm } from '@/components/checkout/service-checkout-form'
import { getDictionary } from '@/lib/i18n/get-dictionary'

interface Props {
  params: Promise<{
    locale: string
    id: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)
  return {
    title: `${dict.checkout.title} - OSDM`,
    description: dict.checkout.description
  }
}

export default async function ServiceCheckoutPage({ params }: Props) {
  const { locale, id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(`/${locale}/login?callbackUrl=/checkout/service/${id}`)
  }

  // Fetch service with packages
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          username: true,
          fullName: true,
          profilePicture: true,
          isVerified: true
        }
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true
        }
      },
      packages: {
        orderBy: {
          tier: 'asc'
        }
      }
    }
  })

  if (!service) {
    notFound()
  }

  // Check if service is active
  if (service.status !== 'APPROVED') {
    return (
      <div className="container max-w-2xl py-12">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">
            {locale === 'ar' ? 'الخدمة غير متاحة' : 'Service Not Available'}
          </h2>
          <p className="text-muted-foreground">
            {locale === 'ar'
              ? 'هذه الخدمة غير متاحة حالياً للشراء'
              : 'This service is not available for purchase at this time'}
          </p>
        </div>
      </div>
    )
  }

  // Check if user is trying to buy their own service
  if (service.sellerId === session.user.id) {
    return (
      <div className="container max-w-2xl py-12">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">
            {locale === 'ar' ? 'خطأ' : 'Error'}
          </h2>
          <p className="text-muted-foreground">
            {locale === 'ar'
              ? 'لا يمكنك شراء خدمتك الخاصة'
              : 'You cannot purchase your own service'}
          </p>
        </div>
      </div>
    )
  }

  const dict = await getDictionary(locale)
  const isArabic = locale === 'ar'

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isArabic ? 'إتمام الطلب' : 'Complete Your Order'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic
            ? 'اختر الباقة المناسبة وأكمل تفاصيل طلبك'
            : 'Select the right package and complete your order details'}
        </p>
      </div>

      <ServiceCheckoutForm
        service={service}
        packages={service.packages}
        buyerId={session.user.id}
        locale={locale}
        dict={dict}
      />
    </div>
  )
}
