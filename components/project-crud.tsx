"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, FolderKanban, Eye } from "lucide-react"
import { toast } from "sonner"

export function ProjectCRUD({ isArabic = true }: { isArabic?: boolean }) {
  const [projects, setProjects] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    categoryId: "",
    budgetMin: "",
    budgetMax: "",
    durationDays: "30",
    skillsRequired: "",
  })

  useEffect(() => {
    loadProjects()
    loadCategories()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/client/projects')
      const data = await response.json()
      if (response.ok && data.success) setProjects(data.data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?type=FREELANCE_PROJECT')
      const data = await response.json()
      if (response.ok && data.success) setCategories(data.data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async () => {
    if (!formData.titleAr || !formData.titleEn || !formData.budgetMin) {
      toast.error(isArabic ? "الحقول المطلوبة ناقصة" : "Required fields missing")
      return
    }

    setSubmitting(true)
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects'
      const method = editingProject ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleAr: formData.titleAr,
          titleEn: formData.titleEn,
          descriptionAr: formData.descriptionAr,
          descriptionEn: formData.descriptionEn,
          categoryId: formData.categoryId,
          budgetMin: parseFloat(formData.budgetMin),
          budgetMax: parseFloat(formData.budgetMax || formData.budgetMin),
          durationDays: parseInt(formData.durationDays),
          skillsRequired: formData.skillsRequired,
        }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        toast.success(isArabic ? "تم الحفظ" : "Saved")
        setIsDialogOpen(false)
        resetForm()
        await loadProjects()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isArabic ? "حذف المشروع؟" : "Delete project?")) return
    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success(isArabic ? "تم الحذف" : "Deleted")
        await loadProjects()
      }
    } catch (error) {
      toast.error(isArabic ? "فشل الحذف" : "Failed")
    }
  }

  const resetForm = () => {
    setFormData({
      titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "",
      categoryId: "", budgetMin: "", budgetMax: "", durationDays: "30", skillsRequired: "",
    })
    setEditingProject(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isArabic ? "إدارة المشاريع" : "Manage Projects"}</h2>
          <p className="text-muted-foreground">{isArabic ? "مشاريعك وطلب العروض من المستقلين" : "Your projects and freelancer proposals"}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />{isArabic ? "مشروع جديد" : "New Project"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingProject ? (isArabic ? "تعديل المشروع" : "Edit Project") : (isArabic ? "مشروع جديد" : "New Project")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{isArabic ? "العنوان (عربي)" : "Title (AR)"} *</Label><Input value={formData.titleAr} onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })} /></div>
                <div className="space-y-2"><Label>{isArabic ? "العنوان (إنجليزي)" : "Title (EN)"} *</Label><Input value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{isArabic ? "الوصف (عربي)" : "Description (AR)"} *</Label><Textarea value={formData.descriptionAr} onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })} rows={5} /></div>
                <div className="space-y-2"><Label>{isArabic ? "الوصف (إنجليزي)" : "Description (EN)"} *</Label><Textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} rows={5} /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{isArabic ? "التصنيف" : "Category"}</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger><SelectValue placeholder={isArabic ? "اختر" : "Select"} /></SelectTrigger>
                    <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{isArabic ? cat.nameAr : cat.nameEn}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>{isArabic ? "الحد الأدنى للميزانية (ر.س)" : "Min Budget (SAR)"} *</Label><Input type="number" value={formData.budgetMin} onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })} /></div>
                <div className="space-y-2"><Label>{isArabic ? "الحد الأقصى للميزانية (ر.س)" : "Max Budget (SAR)"}</Label><Input type="number" value={formData.budgetMax} onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })} /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{isArabic ? "المدة المتوقعة (أيام)" : "Duration (days)"}</Label><Input type="number" value={formData.durationDays} onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })} /></div>
                <div className="space-y-2"><Label>{isArabic ? "المهارات المطلوبة (مفصولة بفاصلة)" : "Skills Required (comma-separated)"}</Label><Input value={formData.skillsRequired} onChange={(e) => setFormData({ ...formData, skillsRequired: e.target.value })} placeholder="React, Node.js, Design" /></div>
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">{submitting ? (isArabic ? "جاري الحفظ..." : "Saving...") : (isArabic ? "حفظ المشروع" : "Save Project")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12"><FolderKanban className="h-16 w-16 text-muted-foreground mb-4" /><p className="text-muted-foreground">{isArabic ? "لا توجد مشاريع" : "No projects yet"}</p></CardContent></Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{isArabic ? project.titleAr : project.titleEn}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{isArabic ? project.descriptionAr : project.descriptionEn}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                        <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(project.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <Badge>{project.status === 'OPEN' ? (isArabic ? "مفتوح" : "Open") : project.status === 'IN_PROGRESS' ? (isArabic ? "جاري العمل" : "In Progress") : (isArabic ? "مكتمل" : "Completed")}</Badge>
                      <span className="text-sm font-bold text-green-600">{project.budgetMin.toLocaleString()} - {project.budgetMax.toLocaleString()} ر.س</span>
                      <span className="text-xs text-muted-foreground">{project.proposalCount} {isArabic ? "عرض" : "proposals"}</span>
                      <span className="text-xs text-muted-foreground">{project.durationDays} {isArabic ? "يوم" : "days"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
