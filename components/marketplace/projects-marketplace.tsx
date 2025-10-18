"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/lib/i18n/language-provider"
import {
  Search,
  SlidersHorizontal,
  FolderKanban,
  Clock,
  DollarSign,
  Users,
  Calendar,
  MapPin
} from "lucide-react"
import { useState, useEffect } from "react"
import { projectsCategories } from "@/lib/data/marketplace-categories"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"

interface Project {
  id: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  client: {
    id: string
    name: string
    country: string
    totalProjects: number
    successRate: number
  }
  budget: {
    min: number
    max: number
  }
  duration: number // in days
  categorySlug: string
  skillsRequired: string[]
  proposalsCount: number
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED"
  postedAt: string
}

export function ProjectsMarketplace() {
  const { t, isRTL } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [budgetFilter, setBudgetFilter] = useState("all")

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)

      try {
        const params = new URLSearchParams()

        if (searchQuery) params.append('search', searchQuery)
        if (selectedCategories.length > 0) {
          params.append('categoryId', selectedCategories.join(','))
        }
        if (sortBy) params.append('sortBy', sortBy)
        if (budgetFilter !== 'all') {
          const [min, max] = budgetFilter.split('-')
          if (min) params.append('minBudget', min)
          if (max) params.append('maxBudget', max)
        }
        params.append('status', 'OPEN')

        const response = await fetch(`/api/projects?${params.toString()}`)
        const data = await response.json()

        if (data.success && data.data) {
          const formattedProjects: Project[] = data.data.map((p: any) => ({
            id: p.id,
            titleAr: p.titleAr,
            titleEn: p.titleEn,
            descriptionAr: p.descriptionAr,
            descriptionEn: p.descriptionEn,
            client: {
              id: p.User?.id || '',
              name: p.User?.fullName || p.User?.username || 'Unknown',
              country: p.User?.country || 'Saudi Arabia',
              totalProjects: p.User?.totalProjects || 0,
              successRate: p.User?.successRate || 0,
            },
            budget: {
              min: parseFloat(p.budgetMin) || 0,
              max: parseFloat(p.budgetMax) || 0,
            },
            duration: p.durationDays || 30,
            categorySlug: p.ProjectCategory?.slug || 'uncategorized',
            skillsRequired: p.skillsRequired ? p.skillsRequired.split(',') : [],
            proposalsCount: p.proposalCount || 0,
            status: p.status,
            postedAt: p.createdAt,
          }))
          setProjects(formattedProjects)
        }
      } catch (error) {
        console.error('Error fetching projects:', error)

        // Mock data fallback - في الواقع سيتم جلبها من API
        const mockProjects: Project[] = [
        {
          id: "1",
          titleAr: "تطوير تطبيق جوال للتجارة الإلكترونية - iOS و Android",
          titleEn: "E-commerce Mobile App Development - iOS & Android",
          descriptionAr: "نحتاج لتطوير تطبيق جوال متكامل للتجارة الإلكترونية يعمل على iOS و Android مع لوحة تحكم إدارية. التطبيق يجب أن يتضمن: نظام طلبات، بوابات دفع متعددة، تتبع الشحنات، نظام إشعارات، وتقييمات المنتجات.",
          descriptionEn: "We need a complete e-commerce mobile app for iOS & Android with admin panel. The app should include: order system, multiple payment gateways, shipment tracking, notification system, and product reviews.",
          client: {
            id: "c1",
            name: "شركة التقنية المتقدمة",
            country: "Saudi Arabia",
            totalProjects: 45,
            successRate: 98,
          },
          budget: {
            min: 25000,
            max: 40000,
          },
          duration: 90,
          categorySlug: "mobile-app-development",
          skillsRequired: ["React Native", "Node.js", "MongoDB", "Payment Integration", "Push Notifications"],
          proposalsCount: 23,
          status: "OPEN",
          postedAt: "2024-01-15",
        },
        {
          id: "2",
          titleAr: "تصميم هوية بصرية كاملة لشركة ناشئة",
          titleEn: "Complete Brand Identity Design for Startup",
          descriptionAr: "نبحث عن مصمم محترف لإنشاء هوية بصرية متكاملة لشركتنا الناشئة في مجال التقنية. نحتاج: شعار، بطاقات عمل، أوراق رسمية، دليل استخدام الهوية، قوالب وسائل التواصل، وتصميم الموقع الإلكتروني.",
          descriptionEn: "Looking for a professional designer to create a complete brand identity for our tech startup. We need: logo, business cards, letterheads, brand guidelines, social media templates, and website design.",
          client: {
            id: "c2",
            name: "محمد الريادي",
            country: "United Arab Emirates",
            totalProjects: 12,
            successRate: 95,
          },
          budget: {
            min: 8000,
            max: 15000,
          },
          duration: 30,
          categorySlug: "graphic-design",
          skillsRequired: ["Adobe Illustrator", "Photoshop", "Brand Identity", "UI/UX Design"],
          proposalsCount: 34,
          status: "OPEN",
          postedAt: "2024-01-14",
        },
        {
          id: "3",
          titleAr: "كتابة محتوى تسويقي لمنصة تعليمية - 50 مقالة",
          titleEn: "Marketing Content Writing for Education Platform - 50 Articles",
          descriptionAr: "مطلوب كاتب محتوى محترف لكتابة 50 مقالة تعليمية وتسويقية لمنصتنا الإلكترونية. المقالات يجب أن تكون متوافقة مع SEO، جذابة للقارئ، ومناسبة للجمهور العربي. كل مقالة 800-1000 كلمة.",
          descriptionEn: "Professional content writer needed for 50 educational and marketing articles for our online platform. Articles should be SEO-friendly, engaging, and suitable for Arabic audience. Each article 800-1000 words.",
          client: {
            id: "c3",
            name: "منصة المعرفة التعليمية",
            country: "Egypt",
            totalProjects: 28,
            successRate: 92,
          },
          budget: {
            min: 5000,
            max: 8000,
          },
          duration: 45,
          categorySlug: "content-writing",
          skillsRequired: ["Arabic Content Writing", "SEO", "Marketing", "Education"],
          proposalsCount: 18,
          status: "OPEN",
          postedAt: "2024-01-13",
        },
        {
          id: "4",
          titleAr: "تطوير منصة حجز مواعيد طبية - نظام متكامل",
          titleEn: "Medical Appointment Booking Platform - Complete System",
          descriptionAr: "نحتاج لتطوير منصة إلكترونية متكاملة لحجز المواعيد الطبية تشمل: لوحات تحكم للأطباء والعيادات والمرضى، نظام دفع آمن، تذكير بالمواعيد، سجلات طبية رقمية، وتقارير شاملة.",
          descriptionEn: "We need a complete medical appointment booking platform including: dashboards for doctors, clinics and patients, secure payment system, appointment reminders, digital medical records, and comprehensive reports.",
          client: {
            id: "c4",
            name: "مجموعة العيادات الطبية",
            country: "Kuwait",
            totalProjects: 8,
            successRate: 100,
          },
          budget: {
            min: 35000,
            max: 50000,
          },
          duration: 120,
          categorySlug: "web-development",
          skillsRequired: ["Next.js", "PostgreSQL", "Healthcare Systems", "Payment Integration", "Security"],
          proposalsCount: 15,
          status: "OPEN",
          postedAt: "2024-01-12",
        },
        {
          id: "5",
          titleAr: "حملة تسويق رقمي متكاملة لمنتج جديد",
          titleEn: "Complete Digital Marketing Campaign for New Product",
          descriptionAr: "نطلق منتجاً جديداً ونحتاج لحملة تسويق رقمي شاملة تشمل: استراتيجية تسويقية، إعلانات Google و Facebook، محتوى وسائل التواصل، SEO، وتقارير أداء دورية لمدة 3 أشهر.",
          descriptionEn: "Launching a new product and need a comprehensive digital marketing campaign including: marketing strategy, Google & Facebook ads, social media content, SEO, and periodic performance reports for 3 months.",
          client: {
            id: "c5",
            name: "شركة الابتكار التجاري",
            country: "Qatar",
            totalProjects: 19,
            successRate: 94,
          },
          budget: {
            min: 15000,
            max: 25000,
          },
          duration: 90,
          categorySlug: "digital-marketing",
          skillsRequired: ["Google Ads", "Facebook Ads", "SEO", "Content Marketing", "Analytics"],
          proposalsCount: 27,
          status: "OPEN",
          postedAt: "2024-01-11",
        },
      ]

        setProjects(mockProjects)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [searchQuery, selectedCategories, sortBy, budgetFilter])

  const toggleCategory = (categorySlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categorySlug)
        ? prev.filter((c) => c !== categorySlug)
        : [...prev, categorySlug]
    )
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return isRTL ? "منذ يوم واحد" : "1 day ago"
    if (diffDays < 7) return isRTL ? `منذ ${diffDays} أيام` : `${diffDays} days ago`
    if (diffDays < 30) return isRTL ? `منذ ${Math.floor(diffDays / 7)} أسابيع` : `${Math.floor(diffDays / 7)} weeks ago`
    return isRTL ? `منذ ${Math.floor(diffDays / 30)} أشهر` : `${Math.floor(diffDays / 30)} months ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FolderKanban className="h-8 w-8" />
          {isRTL ? "سوق المشاريع والعمل الحر" : "Freelance Projects Market"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isRTL
            ? "تصفح مشاريع العمل الحر وقدم عروضك التنافسية"
            : "Browse freelance projects and submit your competitive proposals"}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isRTL ? "ابحث عن المشاريع..." : "Search projects..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={budgetFilter} onValueChange={setBudgetFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder={isRTL ? "الميزانية" : "Budget"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? "جميع الميزانيات" : "All Budgets"}</SelectItem>
            <SelectItem value="low">{isRTL ? "أقل من 5,000 ر.س" : "Under 5,000 SAR"}</SelectItem>
            <SelectItem value="medium">{isRTL ? "5,000 - 20,000 ر.س" : "5,000 - 20,000 SAR"}</SelectItem>
            <SelectItem value="high">{isRTL ? "أكثر من 20,000 ر.س" : "Over 20,000 SAR"}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder={isRTL ? "ترتيب حسب" : "Sort by"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{isRTL ? "الأحدث" : "Newest"}</SelectItem>
            <SelectItem value="budget-high">{isRTL ? "الميزانية: الأعلى" : "Budget: Highest"}</SelectItem>
            <SelectItem value="budget-low">{isRTL ? "الميزانية: الأقل" : "Budget: Lowest"}</SelectItem>
            <SelectItem value="proposals">{isRTL ? "عدد العروض" : "Proposals Count"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  {isRTL ? "التصنيفات" : "Categories"}
                </h3>
                {selectedCategories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategories([])}
                  >
                    {isRTL ? "مسح الكل" : "Clear all"}
                  </Button>
                )}
              </div>

              <Accordion type="multiple" className="w-full">
                {projectsCategories.slice(0, 5).map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="text-sm">
                      {isRTL ? category.nameAr : category.nameEn}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {category.subcategories.slice(0, 3).map((subcategory) => (
                          <div key={subcategory.id} className="space-y-1">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Checkbox
                                id={subcategory.id}
                                checked={selectedCategories.includes(subcategory.id)}
                                onCheckedChange={() => toggleCategory(subcategory.id)}
                              />
                              <label
                                htmlFor={subcategory.id}
                                className="text-sm cursor-pointer"
                              >
                                {isRTL ? subcategory.nameAr : subcategory.nameEn}
                              </label>
                            </div>
                          </div>
                        ))}
                        {category.subcategories.length > 3 && (
                          <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                            {isRTL ? `+${category.subcategories.length - 3} المزيد` : `+${category.subcategories.length - 3} more`}
                          </Button>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Button variant="link" className="w-full mt-4" size="sm">
                {isRTL ? "عرض جميع التصنيفات →" : "View all categories →"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isRTL ? `عرض ${projects.length} مشروع` : `Showing ${projects.length} projects`}
            </p>
          </div>

          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">
                          {isRTL ? project.titleAr : project.titleEn}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {isRTL ? project.descriptionAr : project.descriptionEn}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {isRTL ? "مفتوح" : "Open"}
                      </Badge>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {project.skillsRequired.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Project Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? "الميزانية" : "Budget"}
                          </p>
                          <p className="font-semibold text-green-600">
                            {project.budget.min.toLocaleString()} - {project.budget.max.toLocaleString()} ر.س
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? "المدة" : "Duration"}
                          </p>
                          <p className="font-semibold">
                            {project.duration} {isRTL ? "يوم" : "days"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? "العروض" : "Proposals"}
                          </p>
                          <p className="font-semibold">{project.proposalsCount}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? "تم النشر" : "Posted"}
                          </p>
                          <p className="font-semibold">{getTimeAgo(project.postedAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Client Info & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                          {project.client.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{project.client.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{project.client.country}</span>
                            <span>•</span>
                            <span>{project.client.totalProjects} {isRTL ? "مشروع" : "projects"}</span>
                            <span>•</span>
                            <span className="text-green-600">{project.client.successRate}% {isRTL ? "نجاح" : "success"}</span>
                          </div>
                        </div>
                      </div>
                      <Button>
                        {isRTL ? "تقديم عرض" : "Submit Proposal"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">{isRTL ? "السابق" : "Previous"}</Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="default" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">{isRTL ? "التالي" : "Next"}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
