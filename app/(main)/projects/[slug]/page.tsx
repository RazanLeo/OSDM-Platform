import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DollarSign,
  Clock,
  Briefcase,
  Users,
  MapPin,
  Calendar,
  FileText,
  Target,
  MessageCircle
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ar } from 'date-fns/locale'
import ProjectProposalForm from '@/components/projects/ProjectProposalForm'
import ProjectProposals from '@/components/projects/ProjectProposals'
import ShareButton from '@/components/products/ShareButton'

interface ProjectPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: { client: { select: { fullName: true } } }
  })

  if (!project) {
    return {
      title: 'المشروع غير موجود - OSDM',
    }
  }

  return {
    title: `${project.title} - OSDM`,
    description: project.description.substring(0, 160),
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const session = await getServerSession(authOptions)

  const project = await prisma.project.findUnique({
    where: {
      slug: params.slug
    },
    include: {
      client: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatar: true,
          country: true,
          city: true,
          createdAt: true,
          _count: {
            select: {
              projects: true,
              orders: true
            }
          }
        }
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true
        }
      },
      proposals: {
        include: {
          freelancer: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              sellerLevel: true,
              averageRating: true,
              totalReviews: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          proposals: true
        }
      }
    }
  })

  if (!project) {
    notFound()
  }

  // Check if current user has already submitted a proposal
  let userProposal = null
  if (session?.user?.id) {
    userProposal = project.proposals.find(p => p.freelancerId === session.user.id)
  }

  // Check if user is the client
  const isClient = session?.user?.id === project.clientId

  // Increment view count
  await prisma.project.update({
    where: { id: project.id },
    data: { views: { increment: 1 } }
  })

  // Format budget
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }

  // Get experience level label
  const getExperienceLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      BEGINNER: 'مبتدئ',
      INTERMEDIATE: 'متوسط',
      EXPERT: 'خبير'
    }
    return labels[level] || level
  }

  // Get project size label
  const getProjectSizeLabel = (size: string) => {
    const labels: Record<string, string> = {
      SMALL: 'صغير',
      MEDIUM: 'متوسط',
      LARGE: 'كبير'
    }
    return labels[size] || size
  }

  // Get status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OPEN: 'مفتوح',
      IN_PROGRESS: 'قيد التنفيذ',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغي'
    }
    return labels[status] || status
  }

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-green-500',
      IN_PROGRESS: 'bg-blue-500',
      COMPLETED: 'bg-gray-500',
      CANCELLED: 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground">الرئيسية</Link></li>
          <li>/</li>
          <li><Link href="/projects" className="hover:text-foreground">المشاريع</Link></li>
          <li>/</li>
          <li><Link href={`/projects?category=${project.category.slug}`} className="hover:text-foreground">{project.category.nameAr}</Link></li>
          <li>/</li>
          <li className="text-foreground">{project.title}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Right Column - Project Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    {project.featured && (
                      <Badge variant="secondary">مشروع مميز</Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl mb-3">{project.title}</CardTitle>
                  <CardDescription className="text-base">
                    نُشر {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: ar })}
                  </CardDescription>
                </div>
                <ShareButton
                  url={`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${project.slug}`}
                  title={project.title}
                />
              </div>
            </CardHeader>
            <CardContent>
              {/* Project Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">الميزانية</p>
                    {project.budgetType === 'FIXED' ? (
                      <p className="font-semibold">{formatPrice(project.fixedBudget || 0)}</p>
                    ) : (
                      <p className="font-semibold">
                        {formatPrice(project.hourlyRateMin || 0)} - {formatPrice(project.hourlyRateMax || 0)}/ساعة
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">المدة المتوقعة</p>
                    <p className="font-semibold">{project.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">حجم المشروع</p>
                    <p className="font-semibold">{getProjectSizeLabel(project.projectSize)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">العروض المقدمة</p>
                    <p className="font-semibold">{project._count.proposals}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Skills Required */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  المهارات المطلوبة
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills && (project.skills as string[]).map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Project Description */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  تفاصيل المشروع
                </h3>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Attachments */}
              {project.attachments && (project.attachments as string[]).length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="font-semibold mb-3">المرفقات</h3>
                    <div className="space-y-2">
                      {(project.attachments as string[]).map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
                        >
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">مرفق {index + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Milestones */}
              {project.milestones && (project.milestones as any[]).length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="font-semibold mb-3">المراحل والمعالم</h3>
                    <div className="space-y-3">
                      {(project.milestones as any[]).map((milestone, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{milestone.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {milestone.description}
                                </p>
                                {milestone.dueDate && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>تاريخ التسليم: {format(new Date(milestone.dueDate), 'dd/MM/yyyy', { locale: ar })}</span>
                                  </div>
                                )}
                              </div>
                              <Badge variant="outline">
                                {formatPrice(milestone.amount)}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Proposals Section - Only visible to client */}
          {isClient && project.proposals.length > 0 && (
            <ProjectProposals
              projectId={project.id}
              proposals={project.proposals}
              projectStatus={project.status}
            />
          )}
        </div>

        {/* Left Column - Proposal Form & Client Info */}
        <div className="space-y-6">
          {/* Proposal Form - Only for freelancers */}
          {session?.user?.id && !isClient && project.status === 'OPEN' && (
            <ProjectProposalForm
              projectId={project.id}
              existingProposal={userProposal}
            />
          )}

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href={`/profile/${project.client.username}`}
                className="flex items-start gap-4 hover:bg-muted p-3 rounded-lg transition-colors"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={project.client.avatar || undefined} />
                  <AvatarFallback>{project.client.fullName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{project.client.fullName}</h4>
                  <p className="text-sm text-muted-foreground">@{project.client.username}</p>
                  {project.client.city && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{project.client.city}, {project.client.country}</span>
                    </div>
                  )}
                </div>
              </Link>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">المشاريع المنشورة</span>
                  <span className="font-semibold">{project.client._count.projects}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الطلبات المكتملة</span>
                  <span className="font-semibold">{project.client._count.orders}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">عضو منذ</span>
                  <span className="font-semibold">
                    {formatDistanceToNow(new Date(project.client.createdAt), { addSuffix: true, locale: ar })}
                  </span>
                </div>
              </div>

              {session?.user?.id !== project.clientId && (
                <>
                  <Separator />
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/messages?client=${project.client.username}`}>
                      <MessageCircle className="h-4 w-4 ml-2" />
                      إرسال رسالة
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Project Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">نوع الميزانية</span>
                <Badge variant="secondary">
                  {project.budgetType === 'FIXED' ? 'ميزانية ثابتة' : 'سعر بالساعة'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">المستوى المطلوب</span>
                <Badge variant="secondary">
                  {getExperienceLevelLabel(project.experienceLevel)}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">المشاهدات</span>
                <span className="font-semibold">{project.views}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">تاريخ النشر</span>
                <span className="font-semibold">
                  {format(new Date(project.createdAt), 'dd/MM/yyyy', { locale: ar })}
                </span>
              </div>

              {project.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">آخر موعد للتقديم</span>
                  <span className="font-semibold">
                    {format(new Date(project.deadline), 'dd/MM/yyyy', { locale: ar })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
