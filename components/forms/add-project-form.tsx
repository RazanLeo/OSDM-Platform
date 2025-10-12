'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Category {
  id: string
  nameAr: string
  nameEn: string
}

interface Skill {
  id: string
  nameAr: string
  nameEn: string
}

interface AddProjectFormProps {
  categories: Category[]
  skills: Skill[]
  locale: string
  dict: any
}

export function AddProjectForm({ categories, skills, locale, dict }: AddProjectFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isArabic = locale === 'ar'

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form fields
  const [titleAr, setTitleAr] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [budgetType, setBudgetType] = useState<'FIXED' | 'HOURLY'>('FIXED')
  const [minBudget, setMinBudget] = useState<number>(0)
  const [maxBudget, setMaxBudget] = useState<number>(0)
  const [duration, setDuration] = useState<number>(30)
  const [deadline, setDeadline] = useState<string>('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [attachments, setAttachments] = useState<string[]>([])
  const [attachmentInput, setAttachmentInput] = useState('')

  const handleAddSkill = (skillId: string) => {
    if (!selectedSkills.includes(skillId)) {
      setSelectedSkills([...selectedSkills, skillId])
    }
  }

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter((id) => id !== skillId))
  }

  const handleAddAttachment = () => {
    if (attachmentInput.trim()) {
      setAttachments([...attachments, attachmentInput.trim()])
      setAttachmentInput('')
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !titleAr ||
      !titleEn ||
      !descriptionAr ||
      !descriptionEn ||
      !categoryId ||
      minBudget <= 0 ||
      maxBudget <= 0 ||
      duration <= 0
    ) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
        variant: 'destructive'
      })
      return
    }

    if (minBudget > maxBudget) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description:
          isArabic
            ? 'الحد الأدنى للميزانية يجب أن يكون أقل من الحد الأقصى'
            : 'Minimum budget must be less than maximum budget',
        variant: 'destructive'
      })
      return
    }

    if (selectedSkills.length === 0) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'يرجى اختيار مهارة واحدة على الأقل' : 'Please select at least one skill',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleAr,
          titleEn,
          descriptionAr,
          descriptionEn,
          categoryId,
          budgetType,
          minBudget,
          maxBudget,
          duration,
          deadline: deadline || null,
          skills: selectedSkills,
          attachments
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create project')
      }

      const data = await response.json()

      toast({
        title: isArabic ? 'نجح' : 'Success',
        description: isArabic ? 'تم إنشاء المشروع بنجاح' : 'Project created successfully'
      })

      router.push(`/${locale}/dashboard/buyer/projects`)
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description:
          error instanceof Error
            ? error.message
            : (isArabic ? 'فشل إنشاء المشروع' : 'Failed to create project'),
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
          <CardDescription>
            {isArabic ? 'أدخل معلومات المشروع الأساسية' : 'Enter basic project information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titleAr">
                {isArabic ? 'عنوان المشروع بالعربية' : 'Project Title in Arabic'} *
              </Label>
              <Input
                id="titleAr"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder={isArabic ? 'مثال: تصميم موقع إلكتروني' : 'Example: Website Design'}
                required
              />
            </div>

            <div>
              <Label htmlFor="titleEn">
                {isArabic ? 'عنوان المشروع بالإنجليزية' : 'Project Title in English'} *
              </Label>
              <Input
                id="titleEn"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder={isArabic ? 'مثال: Website Design' : 'Example: Website Design'}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="descriptionAr">
                {isArabic ? 'وصف المشروع بالعربية' : 'Project Description in Arabic'} *
              </Label>
              <Textarea
                id="descriptionAr"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder={isArabic ? 'اشرح متطلبات مشروعك بالتفصيل' : 'Explain your project requirements in detail'}
                rows={6}
                required
              />
            </div>

            <div>
              <Label htmlFor="descriptionEn">
                {isArabic ? 'وصف المشروع بالإنجليزية' : 'Project Description in English'} *
              </Label>
              <Textarea
                id="descriptionEn"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder={isArabic ? 'اشرح متطلبات مشروعك بالتفصيل' : 'Explain your project requirements in detail'}
                rows={6}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">{isArabic ? 'التصنيف' : 'Category'} *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? 'اختر التصنيف' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {isArabic ? cat.nameAr : cat.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Budget & Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'الميزانية والجدول الزمني' : 'Budget & Timeline'}</CardTitle>
          <CardDescription>
            {isArabic
              ? 'حدد ميزانية المشروع والمدة المتوقعة'
              : 'Set project budget and expected duration'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{isArabic ? 'نوع الميزانية' : 'Budget Type'} *</Label>
            <RadioGroup value={budgetType} onValueChange={(v) => setBudgetType(v as 'FIXED' | 'HOURLY')}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="FIXED" id="fixed" />
                <Label htmlFor="fixed" className="cursor-pointer">
                  {isArabic ? 'ميزانية ثابتة' : 'Fixed Budget'}
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="HOURLY" id="hourly" />
                <Label htmlFor="hourly" className="cursor-pointer">
                  {isArabic ? 'أجر بالساعة' : 'Hourly Rate'}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minBudget">
                {isArabic ? 'الحد الأدنى للميزانية (ر.س)' : 'Minimum Budget (SAR)'} *
              </Label>
              <Input
                id="minBudget"
                type="number"
                min="1"
                value={minBudget || ''}
                onChange={(e) => setMinBudget(parseFloat(e.target.value) || 0)}
                placeholder="1000"
                required
              />
            </div>

            <div>
              <Label htmlFor="maxBudget">
                {isArabic ? 'الحد الأقصى للميزانية (ر.س)' : 'Maximum Budget (SAR)'} *
              </Label>
              <Input
                id="maxBudget"
                type="number"
                min="1"
                value={maxBudget || ''}
                onChange={(e) => setMaxBudget(parseFloat(e.target.value) || 0)}
                placeholder="5000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">
                {isArabic ? 'المدة المتوقعة (أيام)' : 'Expected Duration (days)'} *
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration || ''}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                placeholder="30"
                required
              />
            </div>

            <div>
              <Label htmlFor="deadline">
                {isArabic ? 'الموعد النهائي (اختياري)' : 'Deadline (optional)'}
              </Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'المهارات المطلوبة' : 'Required Skills'}</CardTitle>
          <CardDescription>
            {isArabic
              ? 'اختر المهارات المطلوبة لإنجاز المشروع'
              : 'Select skills required to complete the project'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="skills">{isArabic ? 'اختر المهارات' : 'Select Skills'} *</Label>
            <Select onValueChange={handleAddSkill}>
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? 'اختر مهارة' : 'Select a skill'} />
              </SelectTrigger>
              <SelectContent>
                {skills
                  .filter((skill) => !selectedSkills.includes(skill.id))
                  .map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {isArabic ? skill.nameAr : skill.nameEn}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skillId) => {
                const skill = skills.find((s) => s.id === skillId)
                if (!skill) return null
                return (
                  <Badge key={skillId} variant="secondary">
                    {isArabic ? skill.nameAr : skill.nameEn}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skillId)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'المرفقات' : 'Attachments'}</CardTitle>
          <CardDescription>
            {isArabic
              ? 'أضف روابط لملفات أو مستندات تساعد في توضيح المشروع'
              : 'Add links to files or documents that help clarify the project'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={attachmentInput}
              onChange={(e) => setAttachmentInput(e.target.value)}
              placeholder={isArabic ? 'رابط المرفق' : 'Attachment URL'}
              type="url"
            />
            <Button type="button" onClick={handleAddAttachment} variant="outline">
              <Upload className="w-4 h-4" />
            </Button>
          </div>

          {attachments.length > 0 && (
            <ul className="space-y-2">
              {attachments.map((attachment, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between bg-muted p-3 rounded"
                >
                  <a
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate flex-1"
                  >
                    {attachment}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="ml-2 text-destructive hover:text-destructive/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          {isArabic ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? (isArabic ? 'جاري النشر...' : 'Publishing...')
            : (isArabic ? 'نشر المشروع' : 'Publish Project')}
        </Button>
      </div>
    </form>
  )
}
