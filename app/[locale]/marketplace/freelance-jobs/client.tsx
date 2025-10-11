"use client"

import { useState, useMemo, useEffect } from "react"
import type { Locale } from "@/lib/i18n/config"
import type { Category } from "@/lib/data/marketplace-categories"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Clock,
  DollarSign,
  MapPin,
  Briefcase,
  Users,
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  FileText,
  Send,
  BookmarkPlus,
  TrendingUp,
  Award,
  CheckCircle2,
  Grid,
  List,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CategoriesView } from "./categories-view"

interface FreelanceJobsClientProps {
  locale: Locale
  categories: Category[]
  translations: any
  searchParams: { [key: string]: string | string[] | undefined }
}

interface MockJob {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  client: {
    name: string
    avatar: string
    rating: number
    reviews: number
    jobsPosted: number
    hireRate: number
    location: string
    verified: boolean
  }
  budget: {
    type: "fixed" | "hourly"
    min: number
    max?: number
  }
  duration: string
  durationAr: string
  experienceLevel: "entry" | "intermediate" | "expert"
  postedDate: string
  proposals: number
  skills: string[]
  projectType: "small" | "medium" | "large" | "complex"
  categoryId: string
}

const mockJobs: MockJob[] = [
  {
    id: "1",
    title: "Full Stack Developer for E-commerce Platform",
    titleAr: "مطور Full Stack لمنصة تجارة إلكترونية",
    description:
      "We need an experienced full stack developer to build a modern e-commerce platform with React, Node.js, and MongoDB. The project includes payment gateway integration, admin dashboard, and mobile responsive design.",
    descriptionAr:
      "نحتاج مطور Full Stack خبير لبناء منصة تجارة إلكترونية حديثة باستخدام React و Node.js و MongoDB. المشروع يتضمن تكامل بوابة الدفع، لوحة تحكم للإدارة، وتصميم متجاوب مع الجوال.",
    client: {
      name: "شركة التقنية المتقدمة",
      avatar: "/placeholder.svg",
      rating: 4.9,
      reviews: 127,
      jobsPosted: 45,
      hireRate: 95,
      location: "الرياض، السعودية",
      verified: true,
    },
    budget: {
      type: "fixed",
      min: 15000,
      max: 25000,
    },
    duration: "2-3 months",
    durationAr: "2-3 أشهر",
    experienceLevel: "expert",
    postedDate: "2024-01-15",
    proposals: 24,
    skills: ["React", "Node.js", "MongoDB", "Payment Integration", "REST API"],
    projectType: "large",
    categoryId: "full-projects",
  },
  {
    id: "2",
    title: "Mobile App UI/UX Designer",
    titleAr: "مصمم واجهات وتجربة مستخدم لتطبيقات الجوال",
    description:
      "Looking for a talented UI/UX designer to create modern and intuitive designs for our mobile application. Must have experience with Figma and mobile design patterns.",
    descriptionAr:
      "نبحث عن مصمم UI/UX موهوب لإنشاء تصاميم حديثة وبديهية لتطبيق الجوال الخاص بنا. يجب أن يكون لديه خبرة في Figma وأنماط تصميم الجوال.",
    client: {
      name: "أحمد الشمري",
      avatar: "/placeholder.svg",
      rating: 4.7,
      reviews: 56,
      jobsPosted: 12,
      hireRate: 88,
      location: "جدة، السعودية",
      verified: true,
    },
    budget: {
      type: "fixed",
      min: 3000,
      max: 6000,
    },
    duration: "2-4 weeks",
    durationAr: "2-4 أسابيع",
    experienceLevel: "intermediate",
    postedDate: "2024-01-16",
    proposals: 18,
    skills: ["Figma", "UI/UX Design", "Mobile Design", "Prototyping", "User Research"],
    projectType: "medium",
    categoryId: "design-jobs",
  },
  {
    id: "3",
    title: "Content Writer for Tech Blog",
    titleAr: "كاتب محتوى لمدونة تقنية",
    description:
      "We need a skilled Arabic content writer to create engaging articles about technology, programming, and digital trends. 5-10 articles per month, 800-1200 words each.",
    descriptionAr:
      "نحتاج كاتب محتوى عربي ماهر لإنشاء مقالات جذابة عن التقنية والبرمجة والاتجاهات الرقمية. 5-10 مقالات شهرياً، 800-1200 كلمة لكل مقال.",
    client: {
      name: "مدونة التقنية العربية",
      avatar: "/placeholder.svg",
      rating: 4.8,
      reviews: 89,
      jobsPosted: 34,
      hireRate: 92,
      location: "دبي، الإمارات",
      verified: true,
    },
    budget: {
      type: "hourly",
      min: 50,
      max: 100,
    },
    duration: "Long term",
    durationAr: "طويل الأمد",
    experienceLevel: "intermediate",
    postedDate: "2024-01-17",
    proposals: 32,
    skills: ["Arabic Writing", "Content Writing", "SEO", "Technology", "Research"],
    projectType: "medium",
    categoryId: "writing-jobs",
  },
  {
    id: "4",
    title: "Social Media Marketing Manager",
    titleAr: "مدير تسويق عبر وسائل التواصل الاجتماعي",
    description:
      "Seeking an experienced social media manager to handle our brand's presence on Instagram, Twitter, and LinkedIn. Must create content, engage with audience, and run ad campaigns.",
    descriptionAr:
      "نبحث عن مدير سوشيال ميديا خبير لإدارة تواجد علامتنا التجارية على Instagram و Twitter و LinkedIn. يجب إنشاء محتوى والتفاعل مع الجمهور وإدارة حملات إعلانية.",
    client: {
      name: "شركة النور للتسويق",
      avatar: "/placeholder.svg",
      rating: 4.6,
      reviews: 42,
      jobsPosted: 18,
      hireRate: 85,
      location: "الدمام، السعودية",
      verified: false,
    },
    budget: {
      type: "fixed",
      min: 2000,
      max: 4000,
    },
    duration: "3-6 months",
    durationAr: "3-6 أشهر",
    experienceLevel: "intermediate",
    postedDate: "2024-01-18",
    proposals: 27,
    skills: ["Social Media Marketing", "Content Creation", "Instagram", "Facebook Ads", "Analytics"],
    projectType: "medium",
    categoryId: "marketing-jobs",
  },
  {
    id: "5",
    title: "Data Entry Specialist",
    titleAr: "أخصائي إدخال بيانات",
    description:
      "Need someone to help with data entry tasks. Must be detail-oriented and able to work with Excel and Google Sheets. Simple task, perfect for beginners.",
    descriptionAr:
      "نحتاج شخص للمساعدة في مهام إدخال البيانات. يجب أن يكون دقيقاً وقادراً على العمل مع Excel و Google Sheets. مهمة بسيطة، مثالية للمبتدئين.",
    client: {
      name: "فاطمة العتيبي",
      avatar: "/placeholder.svg",
      rating: 4.5,
      reviews: 23,
      jobsPosted: 8,
      hireRate: 80,
      location: "مكة، السعودية",
      verified: false,
    },
    budget: {
      type: "fixed",
      min: 500,
      max: 1000,
    },
    duration: "1-2 weeks",
    durationAr: "1-2 أسبوع",
    experienceLevel: "entry",
    postedDate: "2024-01-19",
    proposals: 45,
    skills: ["Data Entry", "Excel", "Google Sheets", "Attention to Detail"],
    projectType: "small",
    categoryId: "specialized-jobs",
  },
]

export function FreelanceJobsClient({
  locale,
  categories,
  translations: t,
  searchParams,
}: FreelanceJobsClientProps) {
  const isArabic = locale === "ar"
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("newest")
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 50000])
  const [experienceLevel, setExperienceLevel] = useState<string>("all")
  const [projectType, setProjectType] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    if (searchParams.category) {
      setSelectedCategory(searchParams.category as string)
    }
    if (searchParams.q) {
      setSearchQuery(searchParams.q as string)
    }
  }, [searchParams])

  const filteredJobs = useMemo(() => {
    let filtered = mockJobs

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.titleAr.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.descriptionAr.toLowerCase().includes(query) ||
          job.skills.some((skill) => skill.toLowerCase().includes(query))
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((job) => job.categoryId === selectedCategory)
    }

    if (experienceLevel !== "all") {
      filtered = filtered.filter((job) => job.experienceLevel === experienceLevel)
    }

    if (projectType !== "all") {
      filtered = filtered.filter((job) => job.projectType === projectType)
    }

    filtered = filtered.filter((job) => {
      const jobBudget = job.budget.max || job.budget.min
      return jobBudget >= budgetRange[0] && jobBudget <= budgetRange[1]
    })

    switch (sortBy) {
      case "budget-high":
        filtered.sort((a, b) => (b.budget.max || b.budget.min) - (a.budget.max || a.budget.min))
        break
      case "budget-low":
        filtered.sort((a, b) => (a.budget.max || a.budget.min) - (b.budget.max || b.budget.min))
        break
      case "proposals":
        filtered.sort((a, b) => a.proposals - b.proposals)
        break
      default: // newest
        filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
    }

    return filtered
  }, [searchQuery, selectedCategory, sortBy, budgetRange, experienceLevel, projectType])

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleSaved = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSaved = new Set(prev)
      if (newSaved.has(jobId)) {
        newSaved.delete(jobId)
      } else {
        newSaved.add(jobId)
      }
      return newSaved
    })
  }

  const getExperienceLevelText = (level: string) => {
    switch (level) {
      case "entry":
        return isArabic ? "مبتدئ" : "Entry Level"
      case "intermediate":
        return isArabic ? "متوسط" : "Intermediate"
      case "expert":
        return isArabic ? "خبير" : "Expert"
      default:
        return ""
    }
  }

  const getProjectTypeText = (type: string) => {
    switch (type) {
      case "small":
        return isArabic ? "صغير" : "Small"
      case "medium":
        return isArabic ? "متوسط" : "Medium"
      case "large":
        return isArabic ? "كبير" : "Large"
      case "complex":
        return isArabic ? "معقد" : "Complex"
      default:
        return ""
    }
  }

  const getTimeAgo = (date: string) => {
    const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return isArabic ? "اليوم" : "Today"
    if (days === 1) return isArabic ? "أمس" : "Yesterday"
    return isArabic ? `منذ ${days} يوم` : `${days} days ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#846F9C]/10 via-[#4691A9]/10 to-[#89A58F]/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#846F9C] via-[#4691A9] to-[#89A58F] bg-clip-text text-transparent">
              {t.gateway3Title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">{t.gateway3Desc}</p>

            {/* Search Bar */}
            <div className="relative">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground",
                  isArabic ? "right-4" : "left-4"
                )}
              />
              <Input
                type="text"
                placeholder={isArabic ? "ابحث عن فرص العمل..." : "Search for jobs..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("h-14 text-lg shadow-lg border-2", isArabic ? "pr-12 pl-4" : "pl-12 pr-4")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="jobs">
              <Grid className="h-4 w-4 mr-2" />
              {isArabic ? "المشاريع" : "Projects"}
            </TabsTrigger>
            <TabsTrigger value="categories">
              <List className="h-4 w-4 mr-2" />
              {isArabic ? "جميع التصنيفات" : "All Categories"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-6">
            <CategoriesView
              locale={locale}
              categories={categories}
              onSelectType={(catId, subId, typeId) => {
                setSelectedCategory(catId)
                setSelectedSubcategory(subId)
              }}
            />
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <aside className={cn("lg:col-span-1", showFilters ? "block" : "hidden lg:block")}>
            <div className="sticky top-4 space-y-6">
              <div className="lg:hidden flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{isArabic ? "الفلاتر" : "Filters"}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#846F9C]" />
                    {isArabic ? "التصنيفات" : "Categories"}
                  </h3>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-2">
                      <Button
                        variant={!selectedCategory ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(null)}
                      >
                        {isArabic ? "جميع الفئات" : "All Categories"}
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <span className="truncate">{isArabic ? category.nameAr : category.nameEn}</span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Project Type */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold">{isArabic ? "نوع المشروع" : "Project Type"}</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant={projectType === "all" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setProjectType("all")}
                    >
                      {isArabic ? "الكل" : "All"}
                    </Button>
                    {["small", "medium", "large", "complex"].map((type) => (
                      <Button
                        key={type}
                        variant={projectType === type ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setProjectType(type)}
                      >
                        {getProjectTypeText(type)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Experience Level */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold">{isArabic ? "مستوى الخبرة" : "Experience Level"}</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant={experienceLevel === "all" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setExperienceLevel("all")}
                    >
                      {isArabic ? "الكل" : "All Levels"}
                    </Button>
                    {["entry", "intermediate", "expert"].map((level) => (
                      <Button
                        key={level}
                        variant={experienceLevel === level ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setExperienceLevel(level)}
                      >
                        {getExperienceLevelText(level)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Budget Range */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold">{isArabic ? "الميزانية" : "Budget"}</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {budgetRange[0]} {isArabic ? "ريال" : "SAR"}
                      </span>
                      <span>
                        {budgetRange[1]} {isArabic ? "ريال" : "SAR"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="1000"
                      value={budgetRange[1]}
                      onChange={(e) => setBudgetRange([budgetRange[0], Number(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Clear Filters */}
              {(selectedCategory ||
                searchQuery ||
                experienceLevel !== "all" ||
                projectType !== "all" ||
                budgetRange[1] < 50000) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategory(null)
                    setSearchQuery("")
                    setExperienceLevel("all")
                    setProjectType("all")
                    setBudgetRange([0, 50000])
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  {isArabic ? "مسح الفلاتر" : "Clear Filters"}
                </Button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {isArabic ? "الفلاتر" : "Filters"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {filteredJobs.length} {isArabic ? "فرصة" : "jobs"}
                </p>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{isArabic ? "الأحدث" : "Newest"}</SelectItem>
                  <SelectItem value="budget-high">
                    {isArabic ? "الميزانية: الأعلى" : "Budget: Highest"}
                  </SelectItem>
                  <SelectItem value="budget-low">
                    {isArabic ? "الميزانية: الأقل" : "Budget: Lowest"}
                  </SelectItem>
                  <SelectItem value="proposals">
                    {isArabic ? "أقل عروض" : "Fewest Proposals"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Jobs List */}
            {paginatedJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">{isArabic ? "لا توجد فرص عمل" : "No jobs found"}</h3>
                <p className="text-muted-foreground">
                  {isArabic ? "جرب تغيير الفلاتر أو كلمة البحث" : "Try changing the filters or search query"}
                </p>
              </Card>
            ) : (
              <>
                <div className="space-y-6">
                  {paginatedJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-[#846F9C]/50"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{getProjectTypeText(job.projectType)}</Badge>
                              <Badge variant="secondary">{getExperienceLevelText(job.experienceLevel)}</Badge>
                              <span className="text-sm text-muted-foreground">{getTimeAgo(job.postedDate)}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-[#846F9C] transition-colors">
                              {isArabic ? job.titleAr : job.title}
                            </h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSaved(job.id)}
                            className={cn(savedJobs.has(job.id) && "text-[#846F9C]")}
                          >
                            <BookmarkPlus className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {isArabic ? job.descriptionAr : job.description}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        {/* Job Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{isArabic ? "الميزانية" : "Budget"}</span>
                            </div>
                            <p className="font-semibold">
                              {job.budget.type === "fixed" ? (
                                <>
                                  {job.budget.min}
                                  {job.budget.max && ` - ${job.budget.max}`} {isArabic ? "ر.س" : "SAR"}
                                </>
                              ) : (
                                <>
                                  {job.budget.min}
                                  {job.budget.max && `-${job.budget.max}`} {isArabic ? "ر.س/ساعة" : "SAR/hr"}
                                </>
                              )}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <Clock className="h-4 w-4" />
                              <span>{isArabic ? "المدة" : "Duration"}</span>
                            </div>
                            <p className="font-semibold">{isArabic ? job.durationAr : job.duration}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <FileText className="h-4 w-4" />
                              <span>{isArabic ? "العروض" : "Proposals"}</span>
                            </div>
                            <p className="font-semibold">{job.proposals}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <MapPin className="h-4 w-4" />
                              <span>{isArabic ? "الموقع" : "Location"}</span>
                            </div>
                            <p className="font-semibold text-sm">{job.client.location}</p>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Client Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={job.client.avatar} />
                              <AvatarFallback>{job.client.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{job.client.name}</p>
                                {job.client.verified && (
                                  <CheckCircle2 className="h-4 w-4 text-[#4691A9]" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Award className="h-3 w-3" />
                                  <span>
                                    {job.client.rating} ({job.client.reviews})
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>
                                    {job.client.hireRate}% {isArabic ? "معدل التوظيف" : "hire rate"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="bg-muted/50">
                        <Button className="w-full bg-gradient-to-r from-[#846F9C] to-[#4691A9] hover:opacity-90">
                          <Send className="h-4 w-4 mr-2" />
                          {isArabic ? "قدّم عرضك" : "Submit Proposal"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      {isArabic ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
