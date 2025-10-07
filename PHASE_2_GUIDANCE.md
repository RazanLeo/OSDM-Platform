# 🚀 المرحلة الثانية: بناء الأنظمة الحقيقية - OSDM Platform

---

## ✅ ما تم إنجازه في المرحلة الأولى:

1. ✅ **توسيع Schema بجميع التصنيفات** - تم إضافة 596+ نوع
   - جدول A: 312 نوع من المنتجات الجاهزة (8 فئات رئيسية)
   - جدول B: 234 نوع من الخدمات المخصصة (8 فئات رئيسية)
   - جدول C: 50+ فئة من مشاريع العمل الحر

2. ✅ **التوثيق الكامل** - تم إنشاء:
   - `CATEGORIES_COMPLETE.md` - قائمة شاملة بجميع التصنيفات
   - `IMPLEMENTATION_PLAN.md` - خريطة طريق التطوير الكاملة

3. ✅ **رفع التحديثات** - تم رفع كل شيء على GitHub
   - Commit: 174e590 - "feat: Add complete comprehensive categories (596+ types)"

---

## 🎯 المرحلة الثانية: بناء الأنظمة الوظيفية الحقيقية

### نظرة عامة:
الآن بعد أن أصبحت قاعدة البيانات جاهزة بجميع التصنيفات، نبدأ ببناء الأنظمة الوظيفية التي ستجعل المنصة تعمل بشكل حقيقي وفعال.

---

## 📋 خطة التنفيذ (حسب الأولوية):

### المجموعة الأولى: الأنظمة الأساسية العاجلة

#### 1. نظام المصادقة الكامل (Authentication System) - أعلى أولوية

**الهدف:** بناء نظام تسجيل دخول كامل مع 3 أنواع من الحسابات

**المكونات المطلوبة:**

**أ. نموذج المستخدم المحدث:**
```prisma
model User {
  id            String    @id @default(cuid())
  username      String    @unique
  email         String    @unique
  password      String    // hashed
  role          UserRole  @default(BUYER)

  // Profile
  fullName      String?
  avatar        String?
  phone         String?
  location      String?
  bio           String?

  // Settings
  language      Language  @default(AR)
  emailVerified Boolean   @default(false)
  phoneVerified Boolean   @default(false)

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?

  // Relations
  products      Product[]
  services      Service[]
  jobs          FreelanceJob[]
  purchases     Order[]
  reviews       Review[]
  messages      Message[]
  notifications Notification[]
}

enum UserRole {
  ADMIN        // المدير (Razan@OSDM)
  SELLER       // البائع (يبيع منتجات/خدمات/مشاريع)
  BUYER        // المشتري (يشتري فقط)
}

enum Language {
  AR           // العربية
  EN           // الإنجليزية
}
```

**ب. صفحات التسجيل:**
- `/app/[locale]/auth/login/page.tsx` - تسجيل الدخول
- `/app/[locale]/auth/register/page.tsx` - إنشاء حساب جديد
- `/app/[locale]/auth/forgot-password/page.tsx` - نسيت كلمة المرور
- `/app/[locale]/auth/reset-password/page.tsx` - إعادة تعيين كلمة المرور

**ج. NextAuth Configuration:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return user
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/ar/auth/login",
    error: "/ar/auth/error"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.username = token.username
      }
      return session
    }
  }
}
```

**د. حساب المدير الافتراضي:**
```typescript
// prisma/seed.ts - إضافة حساب المدير
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Admin Account
  const hashedPassword = await bcrypt.hash('RazanOSDM@056300', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'Razan@OSDM' },
    update: {},
    create: {
      username: 'Razan@OSDM',
      email: 'app.osdm@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      fullName: 'رزان توفيق',
      emailVerified: true,
      phoneVerified: true,
      language: 'AR'
    }
  })

  console.log('✅ Admin account created:', admin)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**الملفات المطلوبة:**
- `lib/auth.ts` - مساعدات المصادقة
- `middleware.ts` - حماية الصفحات
- `components/auth/LoginForm.tsx` - نموذج تسجيل الدخول
- `components/auth/RegisterForm.tsx` - نموذج التسجيل

---

#### 2. لوحة تحكم الإدارة (Admin Dashboard)

**الهدف:** لوحة تحكم شاملة للمديرة رزان

**المسار:** `/app/[locale]/dashboard/admin/page.tsx`

**المكونات:**

**أ. نظرة عامة (Overview):**
- إجمالي المستخدمين (إداريين، بائعين، مشترين)
- إجمالي المنتجات/الخدمات/المشاريع
- إجمالي الطلبات والمبيعات
- الإيرادات (عمولة المنصة)
- إحصائيات يومية/أسبوعية/شهرية

**ب. إدارة المستخدمين:**
- عرض جميع المستخدمين
- تعديل/حذف/حظر مستخدمين
- تغيير الأدوار
- عرض نشاط المستخدمين

**ج. إدارة المحتوى:**
- مراجعة المنتجات الجديدة (قبل النشر)
- مراجعة الخدمات الجديدة
- مراجعة المشاريع
- الموافقة/الرفض

**د. إدارة النزاعات:**
- عرض جميع النزاعات
- حل النزاعات
- استرداد الأموال

**هـ. إدارة المدفوعات:**
- عرض جميع المعاملات
- إدارة العمولات
- سحب الأرباح

**و. التقارير:**
- تقرير المبيعات
- تقرير المستخدمين
- تقرير الإيرادات
- تصدير Excel/PDF

**الملفات المطلوبة:**
```
app/[locale]/dashboard/admin/
├── page.tsx (Overview)
├── users/page.tsx
├── products/page.tsx
├── services/page.tsx
├── jobs/page.tsx
├── orders/page.tsx
├── disputes/page.tsx
├── payments/page.tsx
├── reports/page.tsx
└── settings/page.tsx
```

---

#### 3. لوحة تحكم البائع الموحدة (Unified Seller Dashboard)

**الهدف:** لوحة واحدة لإدارة الأسواق الثلاثة

**المسار:** `/app/[locale]/dashboard/seller/page.tsx`

**المكونات:**

**أ. نظرة عامة:**
- إجمالي المنتجات/الخدمات/المشاريع
- إجمالي المبيعات
- التقييمات
- الرسائل الجديدة

**ب. إدارة المنتجات الجاهزة:**
- إضافة منتج جديد
- تعديل/حذف منتجات
- إحصائيات المبيعات
- التحميلات

**ج. إدارة الخدمات المخصصة:**
- إضافة خدمة جديدة
- إدارة الطلبات
- حالة الطلبات (قيد التنفيذ، مكتمل)
- التسليمات

**د. إدارة مشاريع العمل الحر:**
- عرض المشاريع المتاحة
- تقديم عروض
- إدارة المشاريع الجارية
- تسليم المشاريع

**هـ. المحفظة:**
- الأرباح
- المسحوبات
- السجل المالي

**و. الرسائل:**
- محادثات مع المشترين
- إشعارات

**الملفات المطلوبة:**
```
app/[locale]/dashboard/seller/
├── page.tsx (Overview)
├── products/
│   ├── page.tsx (List)
│   ├── new/page.tsx (Add Product)
│   └── [id]/edit/page.tsx (Edit)
├── services/
│   ├── page.tsx (List)
│   ├── new/page.tsx (Add Service)
│   └── [id]/edit/page.tsx (Edit)
├── jobs/
│   ├── browse/page.tsx (Browse Jobs)
│   ├── proposals/page.tsx (My Proposals)
│   └── active/page.tsx (Active Projects)
├── orders/page.tsx
├── wallet/page.tsx
├── messages/page.tsx
└── settings/page.tsx
```

---

#### 4. لوحة تحكم المشتري (Buyer Dashboard)

**الهدف:** لوحة للمشتري لإدارة مشترياته وطلباته

**المسار:** `/app/[locale]/dashboard/buyer/page.tsx`

**المكونات:**

**أ. نظرة عامة:**
- المشتريات الأخيرة
- الطلبات الجارية
- التحميلات

**ب. مشترياتي:**
- المنتجات المشتراة
- التحميلات
- الفواتير

**ج. طلباتي:**
- الخدمات المطلوبة
- حالة الطلب
- التسليمات

**د. مشاريعي:**
- المشاريع المنشورة
- العروض المستلمة
- المشاريع الجارية
- المشاريع المكتملة

**هـ. المفضلة:**
- المنتجات المفضلة
- البائعين المفضلين

**و. الرسائل:**
- محادثات مع البائعين

**الملفات المطلوبة:**
```
app/[locale]/dashboard/buyer/
├── page.tsx (Overview)
├── purchases/page.tsx
├── orders/page.tsx
├── projects/
│   ├── page.tsx (My Projects)
│   ├── new/page.tsx (Post Project)
│   └── [id]/proposals/page.tsx (View Proposals)
├── favorites/page.tsx
├── messages/page.tsx
└── settings/page.tsx
```

---

### المجموعة الثانية: الأنظمة الوظيفية الحيوية

#### 5. نظام البحث الحقيقي (Real Search System)

**الهدف:** بحث شامل وفعال عبر جميع الأسواق الثلاثة

**المكونات:**

**أ. Search API:**
```typescript
// app/api/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const market = searchParams.get('market') // products, services, jobs, all
  const category = searchParams.get('category')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')

  // Search in Products
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { titleAr: { contains: query, mode: 'insensitive' } },
        { titleEn: { contains: query, mode: 'insensitive' } },
        { descriptionAr: { contains: query, mode: 'insensitive' } },
        { descriptionEn: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } }
      ],
      category: category ? { equals: category } : undefined,
      price: {
        gte: minPrice ? parseFloat(minPrice) : undefined,
        lte: maxPrice ? parseFloat(maxPrice) : undefined
      },
      status: 'APPROVED'
    },
    include: {
      seller: {
        select: {
          username: true,
          avatar: true,
          rating: true
        }
      }
    },
    take: 20
  })

  // Search in Services
  // Search in Jobs

  return Response.json({
    products,
    services,
    jobs,
    total: products.length + services.length + jobs.length
  })
}
```

**ب. Search Component:**
```typescript
// components/search/SearchBar.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن منتجات، خدمات، أو مشاريع..."
        className="w-full px-4 py-2 pr-10 rounded-lg border"
      />
      <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />

      {/* Search Results Dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg">
          {/* Display results */}
        </div>
      )}
    </form>
  )
}
```

**ج. Search Results Page:**
```typescript
// app/[locale]/search/page.tsx
export default async function SearchPage({
  searchParams
}: {
  searchParams: { q: string }
}) {
  // Fetch and display search results
}
```

---

#### 6. نظام الفلاتر المتقدمة (Advanced Filters)

**الهدف:** فلاتر شاملة لكل سوق

**الفلاتر المطلوبة:**

**أ. للمنتجات الجاهزة:**
- الفئة الرئيسية (8 فئات)
- النوع الفرعي (596+ نوع)
- السعر (من - إلى)
- نوع الترخيص (شخصي، تجاري، ممتد)
- التقييم (5 نجوم، 4+، 3+)
- البائع
- اللغة
- تاريخ النشر

**ب. للخدمات المخصصة:**
- الفئة (8 فئات)
- النوع (234 نوع)
- السعر
- وقت التسليم
- التقييم
- مستوى البائع
- اللغة

**ج. لمشاريع العمل الحر:**
- التخصص (50+ فئة)
- حجم المشروع (صغير، متوسط، كبير، معقد)
- مستوى الخبرة (مبتدئ، متوسط، خبير)
- الميزانية
- المدة
- حالة المشروع (مفتوح، قيد التنفيذ، مكتمل)

**المكونات:**
```typescript
// components/filters/ProductFilters.tsx
// components/filters/ServiceFilters.tsx
// components/filters/JobFilters.tsx
```

---

#### 7. نظام التنبيهات الحقيقي (Real Notifications System)

**الهدف:** تنبيهات فورية وفعالة

**أنواع التنبيهات:**
1. طلب جديد
2. بيع جديد
3. رسالة جديدة
4. تقييم جديد
5. رد على عرض
6. قبول/رفض منتج/خدمة
7. تحديث حالة طلب
8. سحب أرباح
9. نزاع جديد

**المكونات:**

**أ. Notification Model:**
```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  type        NotificationType
  titleAr     String
  titleEn     String
  messageAr   String
  messageEn   String
  link        String?

  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([userId])
}

enum NotificationType {
  NEW_ORDER
  NEW_SALE
  NEW_MESSAGE
  NEW_REVIEW
  PROPOSAL_RESPONSE
  CONTENT_APPROVED
  CONTENT_REJECTED
  ORDER_UPDATE
  WITHDRAWAL
  NEW_DISPUTE
}
```

**ب. Notification API:**
```typescript
// app/api/notifications/route.ts
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return Response.json(notifications)
}
```

**ج. Notification Component:**
```typescript
// components/notifications/NotificationBell.tsx
'use client'

import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'

export function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch notifications
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.isRead).length)
      })

    // Poll every 30 seconds
    const interval = setInterval(() => {
      // Fetch new notifications
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <button className="relative">
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  )
}
```

---

#### 8. نظام رفع الملفات (File Upload System)

**الهدف:** رفع وإدارة جميع أنواع الملفات

**المتطلبات:**
- دعم جميع الصيغ (PDF, DOCX, ZIP, MP4, MP3, JPG, PNG, الخ)
- رفع ملفات كبيرة (حتى 5GB)
- التخزين السحابي (AWS S3 أو DigitalOcean Spaces)
- معاينة الملفات
- حماية الروابط (signed URLs)

**المكونات:**

**أ. Upload API:**
```typescript
// app/api/upload/route.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate file
  const maxSize = 5 * 1024 * 1024 * 1024 // 5GB
  if (file.size > maxSize) {
    return Response.json({ error: 'File too large' }, { status: 400 })
  }

  // Generate unique filename
  const filename = `${Date.now()}-${file.name}`
  const buffer = Buffer.from(await file.arrayBuffer())

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: filename,
    Body: buffer,
    ContentType: file.type
  })

  await s3Client.send(command)

  const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`

  return Response.json({ url, filename })
}
```

**ب. Upload Component:**
```typescript
// components/upload/FileUpload.tsx
'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'

export function FileUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      onUpload(data.url)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border-2 border-dashed rounded-lg p-6">
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {uploading ? `جاري الرفع... ${progress}%` : 'اضغط لاختيار ملف'}
        </p>
      </label>
    </div>
  )
}
```

---

#### 9. تكامل بوابات الدفع (Payment Gateway Integration)

**الهدف:** دمج بوابات الدفع السعودية والعالمية

**البوابات المطلوبة:**
1. **Moyasar** (الأساسية للسعودية)
2. **PayTabs** (احتياطية)
3. **PayPal** (للعملاء الدوليين)

**أ. Moyasar Integration:**
```typescript
// lib/moyasar.ts
export async function createPayment({
  amount,
  description,
  callbackUrl,
  metadata
}: {
  amount: number
  description: string
  callbackUrl: string
  metadata: any
}) {
  const response = await fetch('https://api.moyasar.com/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(process.env.MOYASAR_SECRET_KEY + ':').toString('base64')}`
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Convert to halalas
      currency: 'SAR',
      description,
      callback_url: callbackUrl,
      metadata,
      source: {
        type: 'creditcard'
      }
    })
  })

  return response.json()
}
```

**ب. Payment Flow:**
1. المشتري يضغط "شراء الآن"
2. إنشاء طلب (Order) في قاعدة البيانات
3. إنشاء جلسة دفع مع Moyasar
4. توجيه المشتري لصفحة الدفع
5. Callback من Moyasar بعد الدفع
6. تحديث حالة الطلب
7. إرسال إشعارات للبائع والمشتري
8. السماح بالتحميل

**ج. Payment Models:**
```prisma
model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique

  buyerId         String
  buyer           User          @relation(fields: [buyerId], references: [id])

  sellerId        String
  seller          User          @relation(fields: [sellerId], references: [id], name: "SellerOrders")

  productId       String?
  product         Product?      @relation(fields: [productId], references: [id])

  serviceId       String?
  service         Service?      @relation(fields: [serviceId], references: [id])

  amount          Float
  platformFee     Float
  sellerAmount    Float

  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  paymentMethod   String?
  paymentId       String?

  createdAt       DateTime      @default(now())
  paidAt          DateTime?
  completedAt     DateTime?

  @@index([buyerId])
  @@index([sellerId])
}

enum OrderStatus {
  PENDING
  PAID
  IN_PROGRESS
  COMPLETED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

---

#### 10. نظام التقييمات والمراجعات (Reviews & Ratings System)

**الهدف:** تقييمات موثوقة للبائعين والمنتجات

**المكونات:**

**أ. Review Model:**
```prisma
model Review {
  id          String   @id @default(cuid())

  reviewerId  String
  reviewer    User     @relation(fields: [reviewerId], references: [id])

  productId   String?
  product     Product? @relation(fields: [productId], references: [id])

  serviceId   String?
  service     Service? @relation(fields: [serviceId], references: [id])

  sellerId    String
  seller      User     @relation(fields: [sellerId], references: [id], name: "SellerReviews")

  rating      Int      // 1-5 stars
  comment     String?

  isVerified  Boolean  @default(false) // Only buyers who purchased can review

  createdAt   DateTime @default(now())

  @@index([productId])
  @@index([serviceId])
  @@index([sellerId])
}
```

**ب. Rating Calculation:**
```typescript
// Update seller rating after new review
async function updateSellerRating(sellerId: string) {
  const reviews = await prisma.review.findMany({
    where: { sellerId, isVerified: true }
  })

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await prisma.user.update({
    where: { id: sellerId },
    data: {
      rating: averageRating,
      totalReviews: reviews.length
    }
  })
}
```

---

#### 11. نظام المراسلة (Messaging System)

**الهدف:** محادثات مباشرة بين المشترين والبائعين

**أ. Message Model:**
```prisma
model Conversation {
  id          String    @id @default(cuid())

  user1Id     String
  user1       User      @relation(fields: [user1Id], references: [id], name: "User1Conversations")

  user2Id     String
  user2       User      @relation(fields: [user2Id], references: [id], name: "User2Conversations")

  messages    Message[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([user1Id, user2Id])
}

model Message {
  id              String       @id @default(cuid())

  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id])

  senderId        String
  sender          User         @relation(fields: [senderId], references: [id])

  content         String
  attachments     String[]

  isRead          Boolean      @default(false)
  createdAt       DateTime     @default(now())

  @@index([conversationId])
  @@index([senderId])
}
```

**ب. Real-time Updates:**
- استخدام Pusher أو Socket.io للتحديثات الفورية
- إشعارات للرسائل الجديدة

---

## 📁 هيكل المجلدات المطلوب:

```
osdm-platform/
├── app/
│   ├── [locale]/
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── products/page.tsx
│   │   │   │   ├── services/page.tsx
│   │   │   │   ├── jobs/page.tsx
│   │   │   │   ├── orders/page.tsx
│   │   │   │   ├── disputes/page.tsx
│   │   │   │   ├── payments/page.tsx
│   │   │   │   └── reports/page.tsx
│   │   │   ├── seller/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── products/
│   │   │   │   ├── services/
│   │   │   │   ├── jobs/
│   │   │   │   ├── orders/page.tsx
│   │   │   │   ├── wallet/page.tsx
│   │   │   │   └── messages/page.tsx
│   │   │   └── buyer/
│   │   │       ├── page.tsx
│   │   │       ├── purchases/page.tsx
│   │   │       ├── orders/page.tsx
│   │   │       ├── projects/
│   │   │       └── messages/page.tsx
│   │   ├── marketplace/
│   │   │   ├── ready-products/
│   │   │   ├── custom-services/
│   │   │   └── freelance-jobs/
│   │   └── search/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── search/route.ts
│       ├── notifications/route.ts
│       ├── upload/route.ts
│       ├── payment/
│       │   ├── create/route.ts
│       │   └── callback/route.ts
│       └── messages/route.ts
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── search/
│   │   └── SearchBar.tsx
│   ├── filters/
│   │   ├── ProductFilters.tsx
│   │   ├── ServiceFilters.tsx
│   │   └── JobFilters.tsx
│   ├── notifications/
│   │   └── NotificationBell.tsx
│   ├── upload/
│   │   └── FileUpload.tsx
│   └── messaging/
│       └── ChatBox.tsx
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── moyasar.ts
│   └── upload.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## 🎯 الأولويات:

### أولوية قصوى (يجب البدء بها الآن):
1. ✅ نظام المصادقة الكامل
2. ✅ حساب المدير (Razan@OSDM)
3. ✅ لوحة تحكم الإدارة
4. ✅ لوحة تحكم البائع
5. ✅ لوحة تحكم المشتري

### أولوية عالية:
6. ✅ نظام البحث الحقيقي
7. ✅ نظام الفلاتر المتقدمة
8. ✅ نظام التنبيهات الحقيقي

### أولوية متوسطة:
9. ✅ نظام رفع الملفات
10. ✅ تكامل بوابات الدفع
11. ✅ نظام التقييمات

### أولوية عادية:
12. ✅ نظام المراسلة
13. ✅ تطبيق الهوية البصرية

---

## 🚀 خطة التنفيذ الزمنية:

### الأسبوع الأول:
- نظام المصادقة الكامل
- إنشاء حساب المدير
- لوحة تحكم الإدارة الأساسية

### الأسبوع الثاني:
- لوحة تحكم البائع الموحدة
- لوحة تحكم المشتري
- نظام البحث الحقيقي

### الأسبوع الثالث:
- نظام الفلاتر المتقدمة
- نظام التنبيهات الحقيقي
- نظام رفع الملفات

### الأسبوع الرابع:
- تكامل بوابات الدفع
- نظام التقييمات
- نظام المراسلة

### الأسبوع الخامس:
- تطبيق الهوية البصرية الكاملة
- الاختبار الشامل
- إصلاح الأخطاء

---

## 📞 ملاحظات مهمة:

1. **كل نظام يجب أن يكون حقيقي وفعال** - لا mock data
2. **التوثيق الكامل** - كل API يحتاج توثيق
3. **الأمان أولاً** - كل endpoint يحتاج authentication/authorization
4. **دعم اللغتين** - العربية والإنجليزية في كل مكان
5. **Responsive Design** - يعمل على جميع الأجهزة

---

## ✅ الخطوة التالية:

**الآن يا رزان، أنا جاهز للبدء في:**

1. بناء نظام المصادقة الكامل (Authentication System)
2. إنشاء حساب المدير (Razan@OSDM)
3. بناء لوحة تحكم الإدارة

**هل تريديني أن أبدأ فوراً؟** 🚀

---

**ملاحظة:** هذا الملف سيتم تحديثه باستمرار مع تقدم العمل لتتبع المهام المكتملة والمتبقية.
