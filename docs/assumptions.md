# 📝 Assumptions & Decisions

## افتراضات وقرارات تقنية للمنصة

هذا المستند يوثق جميع القرارات والافتراضات التي تم اتخاذها أثناء التطوير بدون سؤال المستخدم، كما طلب البرومبت.

---

## 🎯 قاعدة العمل

> **من البرومبت:**
> "لا تسأل أسئلة، اتخذ القرارات المنطقية ووثقها في `docs/assumptions.md`"

---

## 1️⃣ القرارات المعمارية (Architecture Decisions)

### AD-001: استخدام Monorepo
**القرار:**
استخدام Monorepo واحد بدلاً من Polyrepo

**السبب:**
- سهولة مشاركة الكود بين Frontend و Backend
- إدارة أسهل للـ Types المشتركة
- Deployment موحد

**البدائل المرفوضة:**
- Polyrepo (مستودعات منفصلة)

---

### AD-002: Next.js App Router بدلاً من Pages Router
**القرار:**
استخدام Next.js 14 مع App Router (الجيل الجديد)

**السبب:**
- Server Components (أداء أفضل)
- Nested Layouts (تخطيطات متداخلة)
- Route Groups (لتنظيم `/[lang]/(buyer|seller)/(products|services|projects)`)
- Streaming & Suspense

**البدائل المرفوضة:**
- Next.js Pages Router (قديم)

---

### AD-003: NestJS للـ Backend
**القرار:**
استخدام NestJS (TypeScript) بدلاً من Express.js العادي

**السبب:**
- Modular Architecture (منظمة)
- Dependency Injection (سهولة Testing)
- Built-in Validation (Pipes)
- Decorators (Clean Code)

**البدائل المرفوضة:**
- Express.js (بسيط لكن غير منظم)
- Fastify (سريع لكن أقل شهرة)

---

### AD-004: Prisma بدلاً من TypeORM
**القرار:**
Prisma ORM

**السبب:**
- Type-safe بالكامل
- Schema سهل القراءة
- Migrations تلقائية
- Prisma Studio (UI للـ Database)

**البدائل المرفوضة:**
- TypeORM (معقد)
- Drizzle (جديد جداً)

---

## 2️⃣ قرارات قاعدة البيانات (Database Decisions)

### DB-001: استخدام CUID بدلاً من UUID
**القرار:**
`id String @id @default(cuid())`

**السبب:**
- أقصر من UUID (25 حرف مقابل 36)
- Collision-resistant
- URL-safe
- مرتب زمنياً (مثل ULID)

**البدائل المرفوضة:**
- UUID (أطول)
- Auto-increment Integer (غير آمن للـ API)

---

### DB-002: فصل جداول الطلبات للأسواق الثلاثة
**القرار:**
3 جداول منفصلة:
- `ProductOrder`
- `ServiceOrder`
- `Contract` (للـ Projects)

**السبب:**
- كل سوق له حقول مختلفة
- `ProductOrder` → downloadUrl
- `ServiceOrder` → requirements, milestones
- `Contract` → freelancer, client, proposal

**البدائل المرفوضة:**
- جدول واحد `Order` (معقد مع NULL fields كثيرة)
- Polymorphic Relations (غير مدعومة بشكل جيد في Prisma)

---

### DB-003: Soft Delete vs Hard Delete
**القرار:**
Hard Delete (حذف نهائي) مع Cascade

**السبب:**
- GDPR Compliance (المستخدم له الحق في حذف بياناته)
- تقليل تعقيد الاستعلامات (لا نحتاج `where: { deleted: false }` في كل مكان)

**التنفيذ:**
- Cascade على علاقات معينة فقط
- AuditLog يحتفظ بالسجلات

**البدائل المرفوضة:**
- Soft Delete مع `deletedAt` (تعقيد إضافي)

---

### DB-004: استخدام Decimal للمبالغ المالية
**القرار:**
`price Decimal @db.Decimal(10, 2)`

**السبب:**
- دقة عالية (لا تستخدم Float أبداً للمال!)
- 10 أرقام إجمالاً، 2 بعد الفاصلة
- يدعم حتى 99,999,999.99 SAR

**البدائل المرفوضة:**
- Float/Double (خطأ في الحسابات المالية!)
- Integer (cents) (غير عملي مع Prisma)

---

### DB-005: تخزين Tags كـ Array
**القرار:**
`tags String[]`

**السبب:**
- بساطة (لا نحتاج جدول منفصل)
- PostgreSQL يدعم Arrays بشكل ممتاز
- سهولة البحث مع `array_contains`

**البدائل المرفوضة:**
- جدول `Tag` منفصل مع Many-to-Many (Over-engineering)

---

## 3️⃣ قرارات المصادقة (Authentication Decisions)

### AUTH-001: JWT بدلاً من Sessions
**القرار:**
JWT Tokens (Access + Refresh)

**السبب:**
- Stateless (لا نحتاج تخزين Sessions في DB)
- Scalable (يعمل مع Load Balancer)
- مناسب للـ API

**التنفيذ:**
- Access Token: 15 دقيقة
- Refresh Token: 7 أيام
- تخزين Refresh Token في جدول `Session`

**البدائل المرفوضة:**
- Session-based (يحتاج Redis دائماً)

---

### AUTH-002: bcryptjs بدلاً من bcrypt
**القرار:**
استخدام `bcryptjs`

**السبب:**
- Pure JavaScript (لا يحتاج Native Binaries)
- يعمل على Vercel/Netlify بدون مشاكل
- نفس الأمان

**البدائل المرفوضة:**
- bcrypt (يحتاج Native compilation)
- argon2 (صعب النشر على Serverless)

---

### AUTH-003: OAuth مع Providers منفصلين
**القرار:**
جدول `OAuthAccount` منفصل

**السبب:**
- المستخدم يمكن أن يربط أكثر من OAuth (Google + GitHub)
- `User.password` nullable (للمستخدمين الذين يسجلون عبر OAuth فقط)

---

## 4️⃣ قرارات الملفات والتخزين (Storage Decisions)

### STOR-001: S3-Compatible Storage
**القرار:**
دعم AWS S3 و MinIO (متوافق مع S3)

**السبب:**
- Development: MinIO (مجاني، محلي)
- Production: AWS S3 (موثوق)
- نفس الـ SDK (`@aws-sdk/client-s3`)

---

### STOR-002: تخزين URLs بدلاً من Binary
**القرار:**
تخزين `fileUrl` (String) في الـ Database

**السبب:**
- لا نخزن الملفات في DB (Database Bloat)
- الملفات على S3/MinIO
- URLs موقعة (Signed URLs) للأمان

---

### STOR-003: أسماء الملفات
**القرار:**
`{userId}/{type}/{timestamp}-{random}.{ext}`

**مثال:**
```
clx1234567/products/1704067200000-a7b3c9.pdf
```

**السبب:**
- فصل حسب المستخدم
- فصل حسب النوع (products, services, avatars)
- Timestamp + Random لمنع التضارب

---

## 5️⃣ قرارات الدفع (Payment Decisions)

### PAY-001: دعم Providers متعددة
**القرار:**
Strategy Pattern لكل Payment Gateway

**Providers:**
- **Local:** Moyasar (السعودية)
- **Local:** PayTabs (السعودية)
- **International:** PayPal
- **International:** Stripe (احتياطي)

**السبب:**
- Moyasar سعودية ورسوم منخفضة
- PayPal للدفع الدولي
- Fallback إذا فشل أحدهم

---

### PAY-002: Payment Gateway Fee يُحسب على المشتري
**القرار:**
```typescript
totalAmount = productPrice + (productPrice * 0.05)
sellerEarning = productPrice - (productPrice * 0.25)
```

**السبب:**
- المشتري يدفع رسوم الدفع (5%)
- البائع يدفع عمولة المنصة (25%)
- شفاف للطرفين

---

### PAY-003: Escrow يُنشأ تلقائياً
**القرار:**
عند نجاح الدفع، يُنشأ Escrow تلقائياً بحالة `HELD`

**Flow:**
```
Payment SUCCESS
  ↓
Create Escrow (status: HELD)
  ↓
Buyer accepts delivery
  ↓
Escrow status: RELEASED
  ↓
Transfer to Seller Wallet
```

---

## 6️⃣ قرارات النزاعات (Dispute Decisions)

### DIS-001: فترة النزاع 7 أيام
**القرار:**
يمكن فتح نزاع خلال 7 أيام من التسليم

**السبب:**
- من البرومبت: "7-day dispute window"
- يعطي المشتري وقتاً كافياً للمراجعة
- يحمي البائع من نزاعات متأخرة

---

### DIS-002: Dispute يوقف Escrow Release
**القرار:**
عند فتح نزاع، `Escrow.status` يتحول لـ `DISPUTED`

**السبب:**
- منع تحرير المبلغ تلقائياً
- انتظار قرار الأدمن

---

## 7️⃣ قرارات الـ i18n (Internationalization)

### I18N-001: استخدام next-intl
**القرار:**
مكتبة `next-intl` للترجمة

**السبب:**
- مدعومة من Next.js 14 App Router
- دعم RTL/LTR تلقائي
- Server Components Support

**البدائل المرفوضة:**
- react-i18next (للـ Pages Router)
- next-translate (أقل شهرة)

---

### I18N-002: هيكل الـ Routes
**القرار:**
`/[lang]/(buyer|seller)/(products|services|projects)`

**مثال:**
```
/ar/buyer/products
/en/seller/services
/ar/buyer/projects
```

**السبب:**
- اللغة في الـ URL (SEO)
- فصل Buyer/Seller dashboards
- فصل الأسواق الثلاثة

---

### I18N-003: تخزين الترجمات في JSON
**القرار:**
```
messages/
  ar.json
  en.json
```

**السبب:**
- بساطة
- سهولة التحرير
- دعم Nested keys

---

## 8️⃣ قرارات الـ SEO

### SEO-001: استخدام Slug بدلاً من ID
**القرار:**
`/products/{slug}` بدلاً من `/products/{id}`

**السبب:**
- SEO-friendly
- Human-readable
- `/products/web-design-course` أفضل من `/products/clx123456`

---

### SEO-002: Meta Tags منفصلة للغتين
**القرار:**
```prisma
metaTitleAr  String?
metaTitleEn  String?
metaDescAr   String?
metaDescEn   String?
```

**السبب:**
- SEO لكل لغة على حدة
- Google يفهرهم بشكل منفصل

---

## 9️⃣ قرارات الأداء (Performance)

### PERF-001: Pagination بدلاً من Infinite Scroll
**القرار:**
`page` & `limit` في كل قائمة

**السبب:**
- أفضل للـ SEO
- أقل استهلاك للـ Memory
- مناسب للجداول في Admin Panel

**Default:**
```
limit: 20
page: 1
```

---

### PERF-002: Redis للـ Cache
**القرار:**
استخدام Redis لـ:
- Session Storage
- Rate Limiting
- Cache للتصنيفات (تُقرأ كثيراً، تُكتب قليلاً)

---

### PERF-003: Database Indexes
**القرار:**
إضافة Indexes على:
- `userId` (كل الجداول)
- `status` (للفلترة)
- `categoryId` (للفلترة)
- `slug` (للبحث)
- `createdAt` (للترتيب)

---

## 🔟 قرارات الأمان (Security)

### SEC-001: Rate Limiting
**القرار:**
```
Auth Endpoints: 5 requests/min
API Endpoints: 100 requests/min
Public Endpoints: 200 requests/min
```

**السبب:**
- منع Brute Force على Login
- منع API Abuse

---

### SEC-002: Input Validation
**القرار:**
استخدام `class-validator` مع NestJS DTOs

**السبب:**
- Type-safe
- Automatic Validation
- Clean Error Messages

---

### SEC-003: File Upload Validation
**القرار:**
```typescript
Max File Size: 50 MB
Allowed Extensions: .pdf, .zip, .jpg, .png, .mp4
Virus Scan: ClamAV (Production)
```

---

## 1️⃣1️⃣ قرارات الـ Testing

### TEST-001: Jest للـ Unit Tests
**القرار:**
Jest + Supertest لـ NestJS

**السبب:**
- مدمج في NestJS
- سريع
- Coverage Reports

---

### TEST-002: E2E Tests مع Playwright
**القرار:**
Playwright بدلاً من Cypress

**السبب:**
- أسرع
- دعم متعدد المتصفحات
- Auto-wait

---

## 1️⃣2️⃣ قرارات الـ Deployment

### DEPLOY-001: Vercel للـ Frontend
**القرار:**
Next.js على Vercel

**السبب:**
- Zero Config
- Edge Functions
- Automatic HTTPS
- Preview Deployments

---

### DEPLOY-002: Railway/Render للـ Backend
**القرار:**
NestJS على Railway أو Render

**السبب:**
- دعم Docker
- PostgreSQL مدمجة
- Auto-scaling

**البدائل:**
- AWS ECS (معقد للمشاريع الصغيرة)
- Heroku (مدفوع)

---

### DEPLOY-003: Supabase للـ Database (بديل)
**القرار:**
دعم Supabase كبديل لـ PostgreSQL + Auth

**السبب:**
- PostgreSQL مُدار
- Realtime Subscriptions
- Storage مدمج
- Auth مدمج

**ملاحظة:** قرار نهائي بعد اختبار الأداء

---

## 1️⃣3️⃣ قرارات الـ AI Integration

### AI-001: OpenAI GPT-4 للتصنيف التلقائي
**القرار:**
استخدام GPT-4 Turbo API

**Flow:**
```
User creates Product
  ↓
Send titleAr + descriptionAr to GPT-4
  ↓
GPT-4 returns suggested categoryId
  ↓
Auto-fill category (user can override)
```

---

### AI-002: Content Moderation
**القرار:**
OpenAI Moderation API

**السبب:**
- كشف المحتوى غير اللائق
- دعم العربية
- مجاني (حتى حد معين)

---

## 1️⃣4️⃣ قرارات الـ Notifications

### NOT-001: Notification Channels
**القرار:**
دعم 3 قنوات:
1. **In-App** (دائماً)
2. **Email** (اختياري)
3. **SMS** (للعمليات الحرجة فقط)

---

### NOT-002: Email Provider
**القرار:**
Resend.com للـ Transactional Emails

**السبب:**
- سهل الاستخدام
- Templates بـ React
- دعم Arabic (RTL)

**البدائل:**
- SendGrid (معقد)
- Mailgun (قديم)

---

## 1️⃣5️⃣ قرارات العملة (Currency)

### CURR-001: SAR فقط في المرحلة الأولى
**القرار:**
العملة الافتراضية: SAR (ريال سعودي)

**السبب:**
- السوق المستهدف: السعودية
- Multi-currency في Phase 11 (مستقبلاً)

---

## 1️⃣6️⃣ قرارات الـ Categories

### CAT-001: Seeders للتصنيفات
**القرار:**
إنشاء 3 ملفات Seeder:
```
prisma/seeds/
  product-categories.ts    (300+ categories)
  service-categories.ts    (100+ categories)
  project-categories.ts    (50+ categories)
```

**السبب:**
- من البرومبت: "يجب طباعة كل التصنيفات وإضافتها عبر Seeder"
- لن نستخدم Admin UI لإضافتهم يدوياً

---

### CAT-002: تنظيم التصنيفات
**القرار:**
Hierarchical (Parent → Children)

**مثال:**
```
تصميم وإبداع (Parent)
  ├── تصميم شعارات (Child)
  ├── تصميم مواقع (Child)
  └── تصميم تطبيقات (Child)
```

---

## 1️⃣7️⃣ قرارات الـ Timezone

### TZ-001: استخدام UTC دائماً
**القرار:**
كل التواريخ في DB تُخزن بـ UTC

**السبب:**
- تجنب Timezone Issues
- التحويل يحدث في Frontend حسب `user.timezone`

---

## 📊 ملخص القرارات

| الفئة | عدد القرارات | الحالة |
|------|--------------|---------|
| Architecture | 4 | ✅ |
| Database | 5 | ✅ |
| Authentication | 3 | ✅ |
| Storage | 3 | ✅ |
| Payments | 3 | ✅ |
| Disputes | 2 | ✅ |
| i18n | 3 | ✅ |
| SEO | 2 | ✅ |
| Performance | 3 | ✅ |
| Security | 3 | ✅ |
| Testing | 2 | ✅ |
| Deployment | 3 | ✅ |
| AI | 2 | ✅ |
| Notifications | 2 | ✅ |
| Currency | 1 | ✅ |
| Categories | 2 | ✅ |
| Timezone | 1 | ✅ |
| **إجمالي** | **44** | **✅** |

---

## 📝 ملاحظات

1. **كل القرارات منطقية** ومبنية على Best Practices
2. **لا تتعارض** مع البرومبت الأصلي
3. **قابلة للتعديل** في المراحل المتقدمة إذا لزم الأمر
4. **موثقة بالكامل** للرجوع إليها

---

**آخر تحديث:** Phase 0
**القرارات الموثقة:** 44
**القرارات المعلقة:** 0
