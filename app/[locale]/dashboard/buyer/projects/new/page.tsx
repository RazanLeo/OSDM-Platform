import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { AddProjectForm } from '@/components/forms/add-project-form'
import { getDictionary } from '@/lib/i18n/get-dictionary'

interface Props {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.locale === 'ar' ? 'إضافة مشروع جديد' : 'Add New Project'} - OSDM`,
    description:
      params.locale === 'ar'
        ? 'قم بإضافة مشروع جديد للحصول على عروض من المستقلين'
        : 'Add a new project to receive proposals from freelancers'
  }
}

export default async function AddProjectPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(`/${params.locale}/login?callbackUrl=/dashboard/buyer/projects/new`)
  }

  // Fetch project categories
  const categories = await prisma.projectCategory.findMany({
    orderBy: { nameEn: 'asc' }
  })

  // Fetch skills for multi-select
  const skills = await prisma.skill.findMany({
    orderBy: { nameEn: 'asc' }
  })

  const dict = await getDictionary(params.locale)

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {params.locale === 'ar' ? 'إضافة مشروع جديد' : 'Add New Project'}
        </h1>
        <p className="text-muted-foreground">
          {params.locale === 'ar'
            ? 'قم بنشر مشروعك واحصل على عروض من المستقلين المحترفين'
            : 'Post your project and receive proposals from professional freelancers'}
        </p>
      </div>

      <AddProjectForm
        categories={categories}
        skills={skills}
        locale={params.locale}
        dict={dict}
      />
    </div>
  )
}
