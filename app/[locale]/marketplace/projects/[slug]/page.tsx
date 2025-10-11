import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DollarSign,
  Clock,
  FileText,
  Users,
  Calendar,
  Briefcase,
  AlertCircle,
  Paperclip,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProjectPageProps {
  params: {
    locale: string
    slug: string
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
  })

  if (!project) {
    return {
      title: params.locale === "ar" ? "المشروع غير موجود - OSDM" : "Project Not Found - OSDM",
    }
  }

  const isArabic = params.locale === "ar"
  const title = isArabic ? project.titleAr : project.titleEn
  const description = isArabic ? project.descriptionAr : project.descriptionEn

  return {
    title: `${title} - OSDM`,
    description: description.substring(0, 160),
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { locale, slug } = params
  const isArabic = locale === "ar"
  const session = await getServerSession(authOptions)

  // Fetch project with all related data
  const project = await prisma.project.findUnique({
    where: {
      slug,
      status: "OPEN",
    },
    include: {
      User: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatar: true,
          createdAt: true,
        },
      },
      ProjectCategory: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
      Proposal: {
        include: {
          User: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      _count: {
        select: {
          Proposal: true,
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // Check if user already submitted a proposal
  let userProposal = null
  if (session?.user?.id) {
    userProposal = await prisma.proposal.findFirst({
      where: {
        projectId: project.id,
        freelancerId: session.user.id,
      },
    })
  }

  // Increment view count
  await prisma.project.update({
    where: { id: project.id },
    data: { viewCount: { increment: 1 } },
  })

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isArabic ? "ar-SA" : "en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const title = isArabic ? project.titleAr : project.titleEn
  const description = isArabic ? project.descriptionAr : project.descriptionEn
  const categoryName = isArabic ? project.ProjectCategory.nameAr : project.ProjectCategory.nameEn

  const isProjectOwner = session?.user?.id === project.clientId
  const canSubmitProposal = session?.user?.id && !isProjectOwner && !userProposal

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}`}>
              {isArabic ? "الرئيسية" : "Home"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}/marketplace/projects`}>
              {isArabic ? "المشاريع" : "Projects"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/${locale}/marketplace/projects?category=${project.ProjectCategory.id}`}
            >
              {categoryName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-4">{title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {project.budgetType === "FIXED"
                        ? isArabic
                          ? "سعر ثابت"
                          : "Fixed Price"
                        : isArabic
                        ? "بالساعة"
                        : "Hourly"}
                    </Badge>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {project._count.Proposal} {isArabic ? "عرض" : "proposals"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <DollarSign className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mb-1">
                    {isArabic ? "الميزانية" : "Budget"}
                  </p>
                  <p className="font-semibold">
                    {project.budgetMin && project.budgetMax
                      ? `${formatPrice(Number(project.budgetMin))} - ${formatPrice(
                          Number(project.budgetMax)
                        )}`
                      : isArabic
                      ? "للنقاش"
                      : "Negotiable"}
                  </p>
                </div>

                {project.duration && (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mb-1">
                      {isArabic ? "المدة" : "Duration"}
                    </p>
                    <p className="font-semibold">
                      {project.duration} {isArabic ? "يوم" : "days"}
                    </p>
                  </div>
                )}

                {project.deadline && (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mb-1">
                      {isArabic ? "الموعد النهائي" : "Deadline"}
                    </p>
                    <p className="font-semibold text-sm">
                      {new Date(project.deadline).toLocaleDateString(
                        isArabic ? "ar-SA" : "en-US"
                      )}
                    </p>
                  </div>
                )}

                <div className="text-center p-4 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mb-1">
                    {isArabic ? "نُشر" : "Posted"}
                  </p>
                  <p className="font-semibold text-sm">
                    {formatDistanceToNow(new Date(project.createdAt), {
                      addSuffix: true,
                      locale: isArabic ? ar : enUS,
                    })}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "وصف المشروع" : "Project Description"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skills Required */}
          {project.skills && project.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "المهارات المطلوبة" : "Required Skills"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {project.attachments && project.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "المرفقات" : "Attachments"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {isArabic ? "مرفق" : "Attachment"} {index + 1}
                      </span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proposal Form */}
          {canSubmitProposal ? (
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "تقديم عرض" : "Submit Proposal"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "قدم عرضك لهذا المشروع واشرح كيف ستنجزه"
                    : "Submit your proposal and explain how you'll complete this project"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={`/${locale}/api/proposals`} method="POST" className="space-y-6">
                  <input type="hidden" name="projectId" value={project.id} />

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">
                      {isArabic ? "رسالة العرض" : "Cover Letter"}
                    </Label>
                    <Textarea
                      id="coverLetter"
                      name="coverLetter"
                      placeholder={
                        isArabic
                          ? "اشرح خبرتك وكيف ستنجز هذا المشروع..."
                          : "Explain your experience and how you'll complete this project..."
                      }
                      rows={6}
                      required
                      className="resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proposedAmount">
                        {isArabic ? "المبلغ المقترح (ريال)" : "Proposed Amount (SAR)"}
                      </Label>
                      <Input
                        id="proposedAmount"
                        name="proposedAmount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder={isArabic ? "مثال: 5000" : "e.g., 5000"}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryDays">
                        {isArabic ? "مدة التسليم (أيام)" : "Delivery Time (days)"}
                      </Label>
                      <Input
                        id="deliveryDays"
                        name="deliveryDays"
                        type="number"
                        min="1"
                        placeholder={isArabic ? "مثال: 14" : "e.g., 14"}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachments">
                      {isArabic ? "مرفقات (اختياري)" : "Attachments (Optional)"}
                    </Label>
                    <Input id="attachments" name="attachments" type="file" multiple />
                    <p className="text-xs text-muted-foreground">
                      {isArabic
                        ? "يمكنك إرفاق نماذج من أعمالك السابقة"
                        : "You can attach samples of your previous work"}
                    </p>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    {isArabic ? "تقديم العرض" : "Submit Proposal"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : userProposal ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isArabic
                  ? "لقد قمت بالفعل بتقديم عرض لهذا المشروع"
                  : "You have already submitted a proposal for this project"}
              </AlertDescription>
            </Alert>
          ) : !session ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isArabic ? "يجب " : "You must "}
                <Link
                  href={`/${locale}/auth/login?callbackUrl=/${locale}/marketplace/projects/${slug}`}
                  className="underline font-semibold"
                >
                  {isArabic ? "تسجيل الدخول" : "sign in"}
                </Link>
                {isArabic ? " لتقديم عرض" : " to submit a proposal"}
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Existing Proposals */}
          {project.Proposal.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isArabic ? "العروض المقدمة" : "Submitted Proposals"} (
                  {project._count.Proposal})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.Proposal.map((proposal) => (
                    <div key={proposal.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={proposal.User.avatar || undefined} />
                          <AvatarFallback>{proposal.User.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Link
                                href={`/${locale}/seller/${proposal.User.username}`}
                                className="font-semibold hover:underline"
                              >
                                {proposal.User.fullName}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                @{proposal.User.username}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">
                                {formatPrice(Number(proposal.proposedAmount))}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {proposal.deliveryDays} {isArabic ? "يوم" : "days"}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {proposal.coverLetter}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(proposal.createdAt), {
                              addSuffix: true,
                              locale: isArabic ? ar : enUS,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {project._count.Proposal > 5 && (
                    <Button variant="outline" className="w-full">
                      {isArabic
                        ? `عرض جميع العروض (${project._count.Proposal})`
                        : `View All Proposals (${project._count.Proposal})`}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "معلومات العميل" : "Client Information"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href={`/${locale}/seller/${project.User.username}`}
                className="flex items-start gap-4 hover:bg-muted p-3 rounded-lg transition-colors"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={project.User.avatar || undefined} />
                  <AvatarFallback>{project.User.fullName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{project.User.fullName}</h4>
                  <p className="text-sm text-muted-foreground">@{project.User.username}</p>
                </div>
              </Link>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {isArabic ? "عضو منذ" : "Member since"}
                  </span>
                  <span className="font-semibold">
                    {formatDistanceToNow(new Date(project.User.createdAt), {
                      addSuffix: true,
                      locale: isArabic ? ar : enUS,
                    })}
                  </span>
                </div>
              </div>

              {session?.user?.id !== project.clientId && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/${locale}/messages?client=${project.User.username}`}>
                    {isArabic ? "تواصل مع العميل" : "Contact Client"}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Project Category */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "التصنيف" : "Category"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/${locale}/marketplace/projects?category=${project.ProjectCategory.id}`}
                className="text-primary hover:underline"
              >
                {categoryName}
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {canSubmitProposal && (
            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    const form = document.getElementById("coverLetter")
                    form?.scrollIntoView({ behavior: "smooth", block: "center" })
                    form?.focus()
                  }}
                >
                  {isArabic ? "تقديم عرض الآن" : "Submit Proposal Now"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
