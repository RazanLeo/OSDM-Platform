import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, FileText, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ar, enUS } from "date-fns/locale"

interface ProjectCardProps {
  project: {
    slug: string
    titleAr: string
    titleEn: string
    budgetMin: number | null
    budgetMax: number | null
    budgetType: string
    duration: number | null
    skills: string[]
    createdAt: Date
    client: {
      username: string
      avatar: string | null
    }
    _count: {
      proposals: number
    }
  }
  locale: string
  isArabic: boolean
}

export function ProjectCard({ project, locale, isArabic }: ProjectCardProps) {
  const title = isArabic ? project.titleAr : project.titleEn

  // Format budget
  const budgetDisplay = () => {
    if (project.budgetMin && project.budgetMax) {
      return `${project.budgetMin.toLocaleString()} - ${project.budgetMax.toLocaleString()} ${isArabic ? "ر.س" : "SAR"}`
    } else if (project.budgetMin) {
      return `${project.budgetMin.toLocaleString()}+ ${isArabic ? "ر.س" : "SAR"}`
    }
    return isArabic ? "ميزانية قابلة للتفاوض" : "Negotiable"
  }

  // Format duration
  const durationDisplay = () => {
    if (!project.duration) return isArabic ? "غير محدد" : "Not specified"
    if (project.duration === 1) return isArabic ? "يوم واحد" : "1 day"
    if (project.duration < 7) return `${project.duration} ${isArabic ? "أيام" : "days"}`
    const weeks = Math.floor(project.duration / 7)
    return `${weeks} ${isArabic ? "أسبوع" : weeks === 1 ? "week" : "weeks"}`
  }

  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(project.createdAt), {
    addSuffix: true,
    locale: isArabic ? ar : enUS
  })

  return (
    <Link href={`/${locale}/marketplace/projects/${project.slug}`}>
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
        <CardContent className="p-4 md:p-5 space-y-4">
          {/* Title */}
          <div>
            <h3 className="font-semibold line-clamp-2 text-base md:text-lg min-h-[3rem]">
              {title}
            </h3>
          </div>

          {/* Budget & Duration */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-[#89A58F] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? "الميزانية" : "Budget"}
                </p>
                <p className="font-medium text-xs md:text-sm">{budgetDisplay()}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-[#4691A9] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? "المدة" : "Duration"}
                </p>
                <p className="font-medium text-xs md:text-sm">{durationDisplay()}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          {project.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.skills.slice(0, 4).map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0"
                >
                  {skill}
                </Badge>
              ))}
              {project.skills.length > 4 && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  +{project.skills.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Client & Proposals */}
          <div className="flex items-center justify-between text-xs border-t pt-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#846F9C] to-[#4691A9] flex items-center justify-center text-xs text-white font-medium">
                {project.client.username[0].toUpperCase()}
              </div>
              <p className="text-muted-foreground truncate max-w-[100px]">
                {project.client.username}
              </p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>{project._count.proposals} {isArabic ? "عرض" : "proposals"}</span>
            </div>
          </div>

          {/* Posted Time */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            className="w-full bg-gradient-to-r from-[#846F9C] to-[#4691A9] hover:opacity-90"
            size="sm"
          >
            {isArabic ? "تقديم عرض" : "Submit Proposal"}
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
