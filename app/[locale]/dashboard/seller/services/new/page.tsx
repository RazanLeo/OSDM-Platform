import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { AddServiceForm } from '@/components/forms/add-service-form'
import { getDictionary } from '@/lib/dictionaries'

interface Props {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.locale === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service'} - OSDM`,
    description:
      params.locale === 'ar'
        ? 'قم بإضافة خدمة جديدة إلى سوق الخدمات'
        : 'Add a new service to the services marketplace'
  }
}

export default async function AddServicePage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(`/${params.locale}/login?callbackUrl=/dashboard/seller/services/new`)
  }

  // Check if user has active subscription
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: {
        where: {
          status: 'ACTIVE',
          expiresAt: { gte: new Date() }
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  if (!user || user.subscription.length === 0) {
    return (
      <div className="container max-w-2xl py-12">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">
            {params.locale === 'ar' ? 'اشتراك غير نشط' : 'No Active Subscription'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {params.locale === 'ar'
              ? 'يجب أن يكون لديك اشتراك نشط لإضافة خدمات'
              : 'You need an active subscription to add services'}
          </p>
        </div>
      </div>
    )
  }

  // Fetch service categories
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { nameEn: 'asc' }
  })

  const dict = await getDictionary(params.locale)

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {params.locale === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service'}
        </h1>
        <p className="text-muted-foreground">
          {params.locale === 'ar'
            ? 'قم بإنشاء خدمة جديدة مع 3 باقات مختلفة'
            : 'Create a new service with 3 different packages'}
        </p>
      </div>

      <AddServiceForm categories={categories} locale={params.locale} dict={dict} />
    </div>
  )
}
