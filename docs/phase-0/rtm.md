# 📊 RTM - Requirements Traceability Matrix

## مصفوفة تتبع المتطلبات

هذا المستند يتتبع **كل متطلب** من البرومبت وربطه بـ:
- المرحلة (Phase)
- المستند (Document)
- ملف API (API Endpoint)
- جدول قاعدة البيانات (Database Table)
- الحالة (Status)

---

## 📋 كيفية استخدام RTM

### رموز الحالة:
- ✅ **Done** - منتهي
- 🔄 **In Progress** - جاري العمل
- ⏳ **Pending** - في الانتظار
- ❌ **Blocked** - محظور/معطل

### المراحل:
- **P0** - Phase 0: Planning & Architecture
- **P1** - Phase 1: Monorepo Scaffold
- **P2** - Phase 2: Auth & Roles
- **P3** - Phase 3: Ready-made Marketplace
- **P4** - Phase 4: Custom Services
- **P5** - Phase 5: Freelance Marketplace
- **P6** - Phase 6: Payments & Escrow
- **P7** - Phase 7: Disputes & Messaging
- **P8** - Phase 8: AI Integration
- **P9** - Phase 9: Admin Panel
- **P10** - Phase 10: Security & Monitoring

---

## 1️⃣ المتطلبات الأساسية للمنصة

| ID | المتطلب | Phase | Status | Document | DB Table | API Endpoint |
|----|---------|-------|--------|----------|----------|--------------|
| REQ-001 | اسم المنصة: OSDM | P0 | ✅ | architecture.md | - | - |
| REQ-002 | دعم اللغتين (AR RTL / EN LTR) | P1 | ⏳ | i18n config | - | All endpoints |
| REQ-003 | 3 أسواق متكاملة | P0 | ✅ | architecture.md | - | - |
| REQ-004 | حساب موحد (بائع + مشتري) | P0 | ✅ | erd.md | User | /users/me |
| REQ-005 | 6 لوحات تحكم منفصلة | P1 | ⏳ | architecture.md | - | Frontend |
| REQ-006 | لوحة Overview واحدة | P1 | ⏳ | architecture.md | - | Frontend |
| REQ-007 | التنقل السريع بين الأسواق | P1 | ⏳ | architecture.md | - | Frontend |
| REQ-008 | التبديل بين بائع/مشتري | P1 | ⏳ | architecture.md | - | Frontend |

---

## 2️⃣ التقنيات المطلوبة

| ID | المتطلب | Phase | Status | Document | Notes |
|----|---------|-------|--------|----------|-------|
| TECH-001 | Next.js 14 (App Router) | P1 | ⏳ | package.json | Frontend |
| TECH-002 | TypeScript | P1 | ⏳ | tsconfig.json | Full Stack |
| TECH-003 | TailwindCSS | P1 | ⏳ | tailwind.config | Styling |
| TECH-004 | NestJS | P1 | ⏳ | apps/api | Backend |
| TECH-005 | PostgreSQL | P1 | ⏳ | docker-compose | Database |
| TECH-006 | Prisma ORM | P1 | ⏳ | schema.prisma | ORM |
| TECH-007 | Redis | P6 | ⏳ | docker-compose | Cache/Sessions |
| TECH-008 | AWS S3 / MinIO | P3 | ⏳ | storage config | Files |
| TECH-009 | Docker Compose | P1 | ⏳ | docker-compose.yml | Deployment |
| TECH-010 | GitHub Actions | P10 | ⏳ | .github/workflows | CI/CD |

---

## 3️⃣ نموذج الإيرادات (Revenue Model)

| ID | المتطلب | Phase | Status | DB Table | API Endpoint |
|----|---------|-------|--------|----------|--------------|
| REV-001 | عمولة المنصة: 25% (ثابتة) | P0 | ✅ | RevenueSettings | /admin/revenue-settings |
| REV-002 | رسوم الدفع: 5% | P0 | ✅ | RevenueSettings | /admin/revenue-settings |
| REV-003 | اشتراك فرد: 100 SAR | P0 | ✅ | Subscription | /users/me/subscription |
| REV-004 | اشتراك SME: 250 SAR | P0 | ✅ | Subscription | /users/me/subscription |
| REV-005 | اشتراك شركات: 500 SAR | P0 | ✅ | Subscription | /users/me/subscription |
| REV-006 | حساب العمولة تلقائياً | P6 | ⏳ | Orders | Backend Logic |

---

## 4️⃣ المصادقة والمستخدمين (Auth & Users)

| ID | المتطلب | Phase | Status | DB Table | API Endpoint |
|----|---------|-------|--------|----------|--------------|
| AUTH-001 | تسجيل جديد | P2 | ⏳ | User | POST /auth/register |
| AUTH-002 | تسجيل دخول | P2 | ⏳ | User, Session | POST /auth/login |
| AUTH-003 | OAuth Google | P2 | ⏳ | OAuthAccount | GET /auth/oauth/google/callback |
| AUTH-004 | OAuth Apple | P2 | ⏳ | OAuthAccount | GET /auth/oauth/apple/callback |
| AUTH-005 | OAuth GitHub | P2 | ⏳ | OAuthAccount | GET /auth/oauth/github/callback |
| AUTH-006 | JWT Token | P2 | ⏳ | Session | Middleware |
| AUTH-007 | تحديث Token | P2 | ⏳ | Session | POST /auth/refresh |
| AUTH-008 | تسجيل خروج | P2 | ⏳ | Session | POST /auth/logout |
| AUTH-009 | تأكيد البريد | P2 | ⏳ | User | POST /auth/verify-email |
| AUTH-010 | تأكيد الهاتف | P2 | ⏳ | User | POST /auth/verify-phone |
| USER-001 | ملف شخصي | P2 | ⏳ | User | GET /users/me |
| USER-002 | تحديث الملف | P2 | ⏳ | User | PATCH /users/me |
| USER-003 | الصورة الشخصية | P2 | ⏳ | User | Upload |
| USER-004 | حقول المستقل (skills, languages) | P2 | ⏳ | User | PATCH /users/me |

---

## 5️⃣ السوق الأول: المنتجات الجاهزة (Ready-made Products)

| ID | المتطلب | Phase | Status | DB Table | API Endpoint |
|----|---------|-------|--------|----------|--------------|
| PROD-001 | إنشاء منتج | P3 | ⏳ | Product | POST /products |
| PROD-002 | تعديل منتج | P3 | ⏳ | Product | PATCH /products/{id} |
| PROD-003 | حذف منتج | P3 | ⏳ | Product | DELETE /products/{id} |
| PROD-004 | عرض منتج | P3 | ⏳ | Product | GET /products/{id} |
| PROD-005 | قائمة المنتجات | P3 | ⏳ | Product | GET /products |
| PROD-006 | بحث في المنتجات | P3 | ⏳ | Product | GET /products?search= |
| PROD-007 | تصفية حسب السعر | P3 | ⏳ | Product | GET /products?minPrice= |
| PROD-008 | تصفية حسب التصنيف | P3 | ⏳ | Product | GET /products?categoryId= |
| PROD-009 | ترتيب (newest, price, popular) | P3 | ⏳ | Product | GET /products?sortBy= |
| PROD-010 | رفع ملفات المنتج | P3 | ⏳ | ProductFile | Upload |
| PROD-011 | صور المنتج (متعددة) | P3 | ⏳ | Product | images[] |
| PROD-012 | رابط تجريبي | P3 | ⏳ | Product | demoUrl |
| PROD-013 | مراجعة الأدمن | P9 | ⏳ | Product | POST /admin/products/{id}/approve |
| PROD-014 | رفض المنتج | P9 | ⏳ | Product | POST /admin/products/{id}/reject |
| PROD-015 | التقييمات | P3 | ⏳ | ProductReview | GET /products/{id}/reviews |
| PROD-016 | إضافة تقييم | P3 | ⏳ | ProductReview | POST /orders/products/{id}/review |
| PROD-017 | رد البائع على التقييم | P3 | ⏳ | ProductReview | sellerResponse |
| PROD-018 | شراء منتج | P6 | ⏳ | ProductOrder | POST /products/{id}/purchase |
| PROD-019 | تحميل المنتج | P6 | ⏳ | ProductOrder | downloadUrl |
| PROD-020 | عداد التحميلات | P3 | ⏳ | Product | downloadCount |
| PROD-021 | عداد المشاهدات | P3 | ⏳ | Product | viewCount |

---

## 6️⃣ تصنيفات المنتجات (300+)

| ID | المتطلب | Phase | Status | DB Table | Seeder |
|----|---------|-------|--------|----------|--------|
| CAT-PROD-001 | تصنيفات المنتجات (300+) | P3 | ⏳ | ProductCategory | seeds/product-categories.ts |
| CAT-PROD-002 | دعم الهيراركي (Parent/Child) | P3 | ⏳ | ProductCategory | parentId |
| CAT-PROD-003 | ترجمة AR/EN لكل تصنيف | P3 | ⏳ | ProductCategory | nameAr, nameEn |
| CAT-PROD-004 | أيقونات التصنيفات | P3 | ⏳ | ProductCategory | icon |
| CAT-PROD-005 | Slug فريد | P3 | ⏳ | ProductCategory | slug |
| CAT-PROD-006 | API للتصنيفات | P3 | ⏳ | ProductCategory | GET /products/categories |

**ملاحظة:** يجب طباعة كل الـ 300+ تصنيف وإضافتها عبر Seeder كما في البرومبت.

---

## 7️⃣ السوق الثاني: الخدمات المخصصة (Custom Services)

| ID | المتطلب | Phase | Status | DB Table | API Endpoint |
|----|---------|-------|--------|----------|--------------|
| SERV-001 | إنشاء خدمة (Gig) | P4 | ⏳ | Service | POST /services |
| SERV-002 | تعديل خدمة | P4 | ⏳ | Service | PATCH /services/{id} |
| SERV-003 | حذف خدمة | P4 | ⏳ | Service | DELETE /services/{id} |
| SERV-004 | عرض خدمة | P4 | ⏳ | Service | GET /services/{id} |
| SERV-005 | قائمة الخدمات | P4 | ⏳ | Service | GET /services |
| SERV-006 | بحث في الخدمات | P4 | ⏳ | Service | GET /services?search= |
| SERV-007 | تصنيفات الخدمات (100+) | P4 | ⏳ | ServiceCategory | seeds/service-categories.ts |
| SERV-008 | 3 باقات (Basic, Standard, Premium) | P4 | ⏳ | ServicePackage | packages[] |
| SERV-009 | تفاصيل كل باقة | P4 | ⏳ | ServicePackage | price, deliveryDays, revisions |
| SERV-010 | ميزات كل باقة | P4 | ⏳ | ServicePackage | features[] |
| SERV-011 | طلب خدمة | P6 | ⏳ | ServiceOrder | POST /services/{id}/order |
| SERV-012 | متطلبات المشتري | P6 | ⏳ | ServiceOrder | requirements |
| SERV-013 | مرفقات المشتري | P6 | ⏳ | ServiceOrder | attachments[] |
| SERV-014 | تسليم الخدمة | P6 | ⏳ | ServiceOrder | POST /orders/services/{id}/deliver |
| SERV-015 | ملفات التسليم | P6 | ⏳ | ServiceOrder | deliveryFiles[] |
| SERV-016 | ملاحظات التسليم | P6 | ⏳ | ServiceOrder | deliveryNote |
| SERV-017 | قبول التسليم | P6 | ⏳ | ServiceOrder | POST /orders/services/{id}/accept |
| SERV-018 | معالم التسليم (Milestones) | P6 | ⏳ | ServiceMilestone | milestones[] |
| SERV-019 | التعديلات (Revisions) | P6 | ⏳ | ServiceOrder | revisions count |
| SERV-020 | مراجعة الأدمن | P9 | ⏳ | Service | POST /admin/services/{id}/approve |

---

## 8️⃣ السوق الثالث: العمل الحر (Freelance Projects)

| ID | المتطلب | Phase | Status | DB Table | API Endpoint |
|----|---------|-------|--------|----------|--------------|
| PROJ-001 | إنشاء مشروع | P5 | ⏳ | Project | POST /projects |
| PROJ-002 | تعديل مشروع | P5 | ⏳ | Project | PATCH /projects/{id} |
| PROJ-003 | حذف مشروع | P5 | ⏳ | Project | DELETE /projects/{id} |
| PROJ-004 | عرض مشروع | P5 | ⏳ | Project | GET /projects/{id} |
| PROJ-005 | قائمة المشاريع | P5 | ⏳ | Project | GET /projects |
| PROJ-006 | بحث في المشاريع | P5 | ⏳ | Project | GET /projects?search= |
| PROJ-007 | تصنيفات المشاريع | P5 | ⏳ | ProjectCategory | seeds/project-categories.ts |
| PROJ-008 | ميزانية (FIXED / HOURLY) | P5 | ⏳ | Project | budgetType |
| PROJ-009 | نطاق الميزانية (min/max) | P5 | ⏳ | Project | budgetMin, budgetMax |
| PROJ-010 | مدة المشروع | P5 | ⏳ | Project | duration, deadline |
| PROJ-011 | المهارات المطلوبة | P5 | ⏳ | Project | skills[] |
| PROJ-012 | إرسال عرض (Proposal) | P5 | ⏳ | Proposal | POST /projects/{id}/proposals |
| PROJ-013 | تفاصيل العرض | P5 | ⏳ | Proposal | coverLetter, proposedAmount, deliveryDays |
| PROJ-014 | معالم العرض | P5 | ⏳ | Proposal | milestonesJson |
| PROJ-015 | قبول العرض | P5 | ⏳ | Contract | POST /projects/{id}/proposals/{id}/accept |
| PROJ-016 | إنشاء عقد | P5 | ⏳ | Contract | Contract created |
| PROJ-017 | معالم العقد | P5 | ⏳ | Milestone | milestones[] |
| PROJ-018 | تسليم معلم | P5 | ⏳ | Milestone | deliveryFiles[], deliveryNote |
| PROJ-019 | قبول معلم | P5 | ⏳ | Milestone | acceptedAt |
| PROJ-020 | إكمال المشروع | P5 | ⏳ | Contract | status: COMPLETED |

---

## 9️⃣ الدفع والضمان (Payments & Escrow)

| ID | المتطلب | Phase | Status | DB Table | API Endpoint |
|----|---------|-------|--------|----------|--------------|
| PAY-001 | بوابة Mada | P6 | ⏳ | Payment | Payment Gateway |
| PAY-002 | بوابة Visa | P6 | ⏳ | Payment | Payment Gateway |
| PAY-003 | بوابة Mastercard | P6 | ⏳ | Payment | Payment Gateway |
| PAY-004 | Apple Pay | P6 | ⏳ | Payment | Payment Gateway |
| PAY-005 | STC Pay | P6 | ⏳ | Payment | Payment Gateway |
| PAY-006 | PayTabs | P6 | ⏳ | Payment | Provider |
| PAY-007 | Moyasar | P6 | ⏳ | Payment | Provider |
| PAY-008 | PayPal | P6 | ⏳ | Payment | Provider |
| PAY-009 | Google Pay | P6 | ⏳ | Payment | Payment Gateway |
| ESC-001 | نظام الضمان (Escrow) | P6 | ⏳ | Escrow | Auto-created |
| ESC-002 | حالة: PENDING | P6 | ⏳ | Escrow | status |
| ESC-003 | حالة: HELD | P6 | ⏳ | Escrow | status |
| ESC-004 | حالة: RELEASED | P6 | ⏳ | Escrow | status |
| ESC-005 | حالة: REFUNDED | P6 | ⏳ | Escrow | status |
| ESC-006 | حالة: DISPUTED | P6 | ⏳ | Escrow | status |
| ESC-007 | تحرير للبائع | P6 | ⏳ | Escrow | Release Logic |
| ESC-008 | استرداد للمشتري | P6 | ⏳ | Escrow | Refund Logic |
| WAL-001 | محفظة المستخدم | P6 | ⏳ | Wallet | GET /users/me/wallet |
| WAL-002 | الرصيد المتاح | P6 | ⏳ | Wallet | balance |
| WAL-003 | الرصيد المحجوز | P6 | ⏳ | Wallet | pendingBalance |
| WAL-004 | طلب سحب | P6 | ⏳ | Withdrawal | POST /users/me/wallet/withdraw |
| WAL-005 | مراجعة السحب | P9 | ⏳ | Withdrawal | Admin approval |

---

## 🔟 النزاعات والتواصل (Disputes & Messaging)

| ID | المتطلب | Phase | Status | DB Table | API Endpoint |
|----|---------|-------|--------|----------|--------------|
| DIS-001 | فتح نزاع | P7 | ⏳ | Dispute | POST /disputes |
| DIS-002 | فترة النزاع: 7 أيام | P7 | ⏳ | RevenueSettings | disputeWindowDays |
| DIS-003 | أسباب النزاع | P7 | ⏳ | Dispute | reason enum |
| DIS-004 | وصف النزاع | P7 | ⏳ | Dispute | description |
| DIS-005 | مرفقات النزاع | P7 | ⏳ | Dispute | attachments[] |
| DIS-006 | حل النزاع (Admin) | P7 | ⏳ | Dispute | POST /admin/disputes/{id}/resolve |
| DIS-007 | نتيجة النزاع | P7 | ⏳ | Dispute | resolution |
| DIS-008 | استرداد جزئي | P7 | ⏳ | Dispute | refundAmount |
| MSG-001 | إرسال رسالة | P7 | ⏳ | Message | POST /messages/conversations/{userId} |
| MSG-002 | قائمة المحادثات | P7 | ⏳ | Message | GET /messages/conversations |
| MSG-003 | الرسائل مع مستخدم | P7 | ⏳ | Message | GET /messages/conversations/{userId} |
| MSG-004 | مرفقات الرسائل | P7 | ⏳ | Message | attachments[] |
| MSG-005 | ربط بطلب (context) | P7 | ⏳ | Message | orderId |
| MSG-006 | حالة القراءة | P7 | ⏳ | Message | isRead, readAt |
| NOT-001 | إشعارات | P7 | ⏳ | Notification | GET /notifications |
| NOT-002 | أنواع الإشعارات | P7 | ⏳ | Notification | type enum |
| NOT-003 | تعليم كمقروء | P7 | ⏳ | Notification | POST /notifications/{id}/read |
| NOT-004 | تعليم الكل | P7 | ⏳ | Notification | POST /notifications/read-all |

---

## 1️⃣1️⃣ الذكاء الاصطناعي (AI Integration)

| ID | المتطلب | Phase | Status | Integration | Usage |
|----|---------|-------|--------|-------------|-------|
| AI-001 | تصنيف تلقائي للمنتجات | P8 | ⏳ | OpenAI / Claude | Auto-categorize |
| AI-002 | تصنيف تلقائي للخدمات | P8 | ⏳ | OpenAI / Claude | Auto-categorize |
| AI-003 | اقتراحات ذكية | P8 | ⏳ | ML Model | Recommendations |
| AI-004 | مراجعة المحتوى | P8 | ⏳ | Content Moderation | Filter |
| AI-005 | توليد ملخصات | P8 | ⏳ | OpenAI | Summaries |
| AI-006 | وسوم تلقائية | P8 | ⏳ | NLP | Auto-tagging |
| AI-007 | شات بوت | P8 | ⏳ | OpenAI | Support |

---

## 1️⃣2️⃣ لوحة الإدارة (Admin Panel)

| ID | المتطلب | Phase | Status | DB Table | API Endpoint |
|----|---------|-------|--------|----------|--------------|
| ADM-001 | قائمة المستخدمين | P9 | ⏳ | User | GET /admin/users |
| ADM-002 | بحث المستخدمين | P9 | ⏳ | User | GET /admin/users?search= |
| ADM-003 | حظر مستخدم | P9 | ⏳ | User | POST /admin/users/{id}/suspend |
| ADM-004 | مراجعة المنتجات | P9 | ⏳ | Product | GET /admin/products?status=PENDING |
| ADM-005 | الموافقة على منتج | P9 | ⏳ | Product | POST /admin/products/{id}/approve |
| ADM-006 | رفض منتج | P9 | ⏳ | Product | POST /admin/products/{id}/reject |
| ADM-007 | مراجعة الخدمات | P9 | ⏳ | Service | GET /admin/services?status=PENDING |
| ADM-008 | حل النزاعات | P9 | ⏳ | Dispute | POST /admin/disputes/{id}/resolve |
| ADM-009 | إعدادات الإيرادات | P9 | ⏳ | RevenueSettings | GET/PATCH /admin/revenue-settings |
| ADM-010 | التحليلات (Analytics) | P9 | ⏳ | - | GET /admin/analytics/overview |
| ADM-011 | التقارير المالية | P9 | ⏳ | - | GET /admin/reports/revenue |
| ADM-012 | سجل العمليات | P9 | ⏳ | AuditLog | GET /admin/audit-logs |
| ADM-013 | طلبات السحب | P9 | ⏳ | Withdrawal | GET /admin/withdrawals |
| ADM-014 | الموافقة على السحب | P9 | ⏳ | Withdrawal | POST /admin/withdrawals/{id}/approve |

---

## 1️⃣3️⃣ الأمان والمراقبة (Security & Monitoring)

| ID | المتطلب | Phase | Status | Tool | Integration |
|----|---------|-------|--------|------|-------------|
| SEC-001 | JWT Authentication | P2 | ⏳ | NestJS | Auth Module |
| SEC-002 | RBAC (Role-Based Access) | P2 | ⏳ | NestJS | Guards |
| SEC-003 | تشفير كلمات المرور | P2 | ⏳ | bcryptjs | Hash |
| SEC-004 | Rate Limiting | P10 | ⏳ | Redis | Throttler |
| SEC-005 | CORS | P10 | ⏳ | NestJS | Config |
| SEC-006 | XSS Protection | P10 | ⏳ | Helmet | Middleware |
| SEC-007 | CSRF Protection | P10 | ⏳ | NestJS | CSRF |
| SEC-008 | SQL Injection Protection | P10 | ⏳ | Prisma | ORM |
| MON-001 | Sentry Error Tracking | P10 | ⏳ | Sentry | SDK |
| MON-002 | Prometheus Metrics | P10 | ⏳ | Prometheus | Exporter |
| MON-003 | Grafana Dashboards | P10 | ⏳ | Grafana | UI |
| MON-004 | Logging | P10 | ⏳ | Winston | Logger |
| AUD-001 | سجل العمليات | P9 | ⏳ | AuditLog | All mutations |

---

## 1️⃣4️⃣ الهوية البصرية (Brand Identity)

| ID | المتطلب | Phase | Status | File | Usage |
|----|---------|-------|--------|------|-------|
| BRD-001 | اللون الأساسي: #846F9C | P1 | ⏳ | tailwind.config | primary |
| BRD-002 | اللون الثانوي: #4691A9 | P1 | ⏳ | tailwind.config | secondary |
| BRD-003 | اللون الثالث: #89A58F | P1 | ⏳ | tailwind.config | accent |
| BRD-004 | خط عربي: DIN NEXT ARABIC | P1 | ⏳ | globals.css | font-arabic |
| BRD-005 | خط إنجليزي: DIN NEXT LATIN | P1 | ⏳ | globals.css | font-latin |
| BRD-006 | الشعار | P1 | ⏳ | public/logo.png | Header |

---

## 1️⃣5️⃣ حساب الأدمن الأولي

| ID | المتطلب | Phase | Status | Credentials |
|----|---------|-------|--------|-------------|
| ADMIN-001 | Username: Razan@OSDM | P2 | ⏳ | Seeder |
| ADMIN-002 | Password: RazanOSDM@056300 | P2 | ⏳ | Seeder |
| ADMIN-003 | Email: admin@osdm.com | P2 | ⏳ | Seeder |
| ADMIN-004 | Role: ADMIN | P2 | ⏳ | Seeder |

---

## 📊 ملخص الحالة

### Phase 0: Planning (Current)
- ✅ Architecture Document
- ✅ ERD + Prisma Schema
- ✅ API Contract (OpenAPI)
- 🔄 RTM (This document)

### Phases 1-10: To Be Done
- ⏳ 165 متطلب إجمالي
- ⏳ 28 جدول قاعدة بيانات
- ⏳ 80+ API Endpoint
- ⏳ 300+ تصنيف منتج
- ⏳ 100+ تصنيف خدمة

---

## 📝 التحديثات

سيتم تحديث هذا المستند في نهاية كل Phase بتعليم المتطلبات المنجزة.

**آخر تحديث:** Phase 0
**المتطلبات المنجزة:** 4/169 (2.4%)
