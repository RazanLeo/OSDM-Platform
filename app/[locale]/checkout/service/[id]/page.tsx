import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { ServiceCheckoutForm } from '@/components/checkout/service-checkout-form'
import { getDictionary } from '@/lib/dictionaries'

interface Props {
  params: {
    locale: string
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dict = await getDictionary(params.locale)
  return {
    title: `${dict.checkout.title} - OSDM`,
    description: dict.checkout.description
  }
}

export default async function ServiceCheckoutPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(`/${params.locale}/login?callbackUrl=/checkout/service/${params.id}`)
  }

  // Fetch service with packages
  const service = await prisma.service.findUnique({
    where: { id: params.id },
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
            {params.locale === 'ar' ? 'الخدمة غير متاحة' : 'Service Not Available'}
          </h2>
          <p className="text-muted-foreground">
            {params.locale === 'ar'
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
            {params.locale === 'ar' ? 'خطأ' : 'Error'}
          </h2>
          <p className="text-muted-foreground">
            {params.locale === 'ar'
              ? 'لا يمكنك شراء خدمتك الخاصة'
              : 'You cannot purchase your own service'}
          </p>
        </div>
      </div>
    )
  }

  const dict = await getDictionary(params.locale)
  const isArabic = params.locale === 'ar'

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
        locale={params.locale}
        dict={dict}
      />
    </div>
  )
}
