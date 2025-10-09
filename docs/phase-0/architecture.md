# 🏗️ OSDM Platform - المخطط المعماري الكامل

## نظرة عامة (Overview)

منصة OSDM هي منصة رقمية سحابية متكاملة (Cloud SaaS Marketplace) تجمع 3 أسواق رقمية تحت سقف واحد:

1. **سوق المنتجات والخدمات الرقمية الجاهزة** (Gumroad + Picalica)
2. **سوق الخدمات الرقمية المتخصصة حسب الطلب** (Fiverr + Khamsat)
3. **سوق فرص العمل الحر الرقمي عن بعد** (Upwork + Mostaql + Bahr)

---

## 🎯 المبادئ المعمارية الأساسية

### 1. Monorepo Architecture
```
osdm-platform/
├── apps/
│   ├── web/          # Next.js 14 Frontend (App Router)
│   ├── api/          # NestJS Backend API
│   └── admin/        # Admin Dashboard (Next.js)
├── packages/
│   ├── ui/           # Shared UI Components
│   ├── utils/        # Shared Utilities
│   ├── config/       # Shared Configuration
│   └── types/        # Shared TypeScript Types
├── prisma/
│   ├── schema.prisma
│   └── seeds/
└── docs/
```

### 2. حساب موحد (Unified Account)
- **مستخدم واحد** = بائع + مشتري
- **6 لوحات تحكم منفصلة:**
  - 3 للبائع (واحدة لكل سوق)
  - 3 للمشتري (واحدة لكل سوق)
- **صفحة ملخص عام** تجمع كل الأنشطة

### 3. نموذج الإيرادات الموحد
- عمولة المنصة: **25%** ثابتة
- عمولة الدفع: **5%** من بوابات الدفع
- اشتراكات شهرية:
  - أفراد: **100 ريال**
  - شركات صغيرة/متوسطة: **250 ريال**
  - شركات كبيرة: **500 ريال**

---

## 🔧 المكونات التقنية (Tech Stack)

### Frontend Layer
```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 14 (App Router)              │
│  ┌────────────┬────────────────┬─────────────────────┐  │
│  │ TypeScript │ TailwindCSS    │ i18n (AR/EN)       │  │
│  │            │ + Radix UI     │ RTL/LTR Support    │  │
│  └────────────┴────────────────┴─────────────────────┘  │
│                                                          │
│  Components:                                             │
│  • Persistent Sidebar Navigation                        │
│  • Dynamic Topbar (Role Switcher)                       │
│  • 6 Dashboard Views                                     │
│  • Overview Dashboard                                    │
│  • Charts & Analytics (Chart.js/Recharts)              │
│  • Real-time Notifications                              │
│  • Global Search with Filters                           │
└─────────────────────────────────────────────────────────┘
```

### Backend Layer
```
┌─────────────────────────────────────────────────────────┐
│                    NestJS (TypeScript)                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Core Modules                          │  │
│  │  • Users & Auth (JWT + OAuth2)                    │  │
│  │  • Products & Services (Ready-made)               │  │
│  │  • Custom Services (Gigs & Projects)              │  │
│  │  • Freelance (Jobs & Contracts)                   │  │
│  │  • Orders & Transactions                          │  │
│  │  • Payments & Escrow                              │  │
│  │  • Categories & Tags                              │  │
│  │  • Reviews & Ratings                              │  │
│  │  • Notifications & Messaging                      │  │
│  │  • Disputes & Resolution                          │  │
│  │  • Reports & Analytics                            │  │
│  │  • AI & Automation                                │  │
│  │  • Admin Panel                                    │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Database Layer
```
┌─────────────────────────────────────────────────────────┐
│            PostgreSQL + Prisma ORM                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Main Entities:                                    │  │
│  │  • users (unified account)                         │  │
│  │  • profiles (bio, skills, rating)                  │  │
│  │  • products (ready-made marketplace)               │  │
│  │  • services (custom services)                      │  │
│  │  • projects (freelance jobs)                       │  │
│  │  • orders (all transactions)                       │  │
│  │  • payments (gateway integration)                  │  │
│  │  • escrow (secure funds holding)                   │  │
│  │  • disputes (resolution system)                    │  │
│  │  • categories (300+ types AR/EN)                   │  │
│  │  • subscriptions (premium features)                │  │
│  │  • revenue_settings (commission config)            │  │
│  │  • reviews, notifications, messages                │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Infrastructure Layer
```
┌─────────────────────────────────────────────────────────┐
│                    Cloud Infrastructure                  │
│  ┌────────────┬──────────────┬───────────────────────┐  │
│  │ Docker     │ Redis Cache  │ AWS S3 / MinIO       │  │
│  │ Compose    │ (Sessions)   │ (File Storage)       │  │
│  ├────────────┼──────────────┼───────────────────────┤  │
│  │ GitHub     │ Prometheus   │ Sentry               │  │
│  │ Actions    │ + Grafana    │ (Error Tracking)     │  │
│  │ (CI/CD)    │ (Monitoring) │                      │  │
│  └────────────┴──────────────┴───────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 نظام المصادقة والأدوار (Authentication & Authorization)

### User Roles
```typescript
enum UserRole {
  USER,   // حساب موحد (بائع + مشتري)
  ADMIN   // إدارة المنصة
}

enum UserType {
  INDIVIDUAL,  // فرد
  COMPANY      // شركة
}
```

### Authentication Flow
```
1. التسجيل (Register)
   ↓
   [اختيار النوع: فرد / شركة]
   ↓
   [إنشاء حساب USER موحد]
   ↓
   [إنشاء Seller Profile تلقائياً]

2. تسجيل الدخول (Login)
   ↓
   [Email/Password أو OAuth2]
   ↓
   [JWT Token]
   ↓
   [Dashboard الرئيسي]
   ↓
   [التبديل بين البائع/المشتري]
```

---

## 🎨 بنية واجهة المستخدم (UI Architecture)

### Layout Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  Level 1: Top Bar (Persistent)                              │
│  • Logo OSDM                                                 │
│  • Role Switcher: بائع ⇄ مشتري                             │
│  • Language: AR | EN                                         │
│  • User Menu + Notifications                                 │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Level 2: Market Tabs (Dynamic based on role)               │
│  [المنتجات الجاهزة] [الخدمات المتخصصة] [فرص العمل الحر]  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Level 3: Overview Dashboard (Main Landing)                 │
│  • إجمالي المبيعات/المشتريات                               │
│  • الإيرادات الصافية                                        │
│  • الطلبات الجارية                                          │
│  • رسوم بيانية للأداء                                       │
│  • إشعارات + Quick Actions                                  │
└─────────────────────────────────────────────────────────────┘
```

### 6 لوحات التحكم الفرعية

| الوضع   | السوق                    | الوظائف الأساسية                                      |
|---------|--------------------------|-------------------------------------------------------|
| **بائع** | المنتجات الجاهزة        | إدارة المنتجات، الإصدارات، الأسعار، التنزيلات، المبيعات |
| **بائع** | الخدمات المتخصصة        | إدارة العروض، المشاريع، العقود، التسليمات             |
| **بائع** | فرص العمل الحر          | التقديم على وظائف، متابعة العطاءات، إدارة العقود      |
| **مشتري** | المنتجات الجاهزة       | السلة، التنزيلات، الفواتير، التقييمات                |
| **مشتري** | الخدمات المتخصصة       | الطلبات المفتوحة، متابعة المشاريع، التواصل            |
| **مشتري** | فرص العمل الحر         | العقود الجارية، الدفعات، التقييمات                   |

---

## 💳 نظام الدفع والضمان (Payment & Escrow System)

### Payment Flow

```
1. المشتري يختار منتج/خدمة
   ↓
2. يدفع عبر بوابة الدفع
   [Mada, Visa, Mastercard, Apple Pay, STC Pay, PayPal]
   ↓
3. المبلغ يُودع في Escrow
   [حالة: محتجز]
   ↓
4. البائع يسلم المنتج/الخدمة
   ↓
5. المشتري يراجع ويقبل
   ↓
6. تحرير المبلغ:
   - خصم عمولة المنصة (25%)
   - خصم عمولة الدفع (5%)
   - تحويل الصافي لمحفظة البائع
   ↓
7. البائع يسحب إلى حسابه البنكي
```

### Escrow States

```typescript
enum EscrowStatus {
  PENDING,      // في انتظار التسليم
  HELD,         // محتجز
  RELEASED,     // محرر للبائع
  REFUNDED,     // مسترد للمشتري
  DISPUTED      // تحت النزاع
}
```

### Dispute Flow

```
1. طرف يفتح نزاع (خلال 7 أيام)
   ↓
2. تقديم الأدلة والمرفقات
   ↓
3. رد الطرف الآخر
   ↓
4. تدخل وسيط المنصة
   ↓
5. قرار الإدارة النهائي
   ↓
6. تحرير أو استرداد المبلغ
```

---

## 🤖 الذكاء الاصطناعي والأتمتة (AI & Automation)

### AI Modules

1. **تصنيف تلقائي** - Auto-categorization
2. **كشف الانتهاكات** - Content moderation
3. **توصيات ذكية** - Smart recommendations
4. **تلخيص العروض** - Summary generation
5. **توليد الوسوم** - Auto-tagging
6. **مساعد دردشة** - AI Chatbot

### Automation Tasks

- إشعارات تلقائية
- تحديث التحليلات لحظياً
- كشف الاحتيال (Fraud Detection)
- نسخ احتياطي مجدول
- تنظيف البيانات المؤقتة

---

## 📊 التحليلات والتقارير (Analytics & Reports)

### Dashboard Analytics

**للبائع:**
- إجمالي المبيعات
- الإيرادات الصافية
- المنتجات الأكثر مبيعاً
- معدل التحويل
- التقييمات والمراجعات

**للمشتري:**
- إجمالي المشتريات
- الطلبات الجارية
- المنفق الشهري
- المنتجات المفضلة

**للإدارة:**
- إيرادات المنصة
- عدد المستخدمين النشطين
- حجم المعاملات
- نسب العمولات
- النزاعات والحلول

---

## 🔒 الأمان والحماية (Security)

### Security Measures

1. **Authentication & Authorization**
   - JWT tokens
   - OAuth2 (Google, Apple, GitHub)
   - Role-based access control (RBAC)

2. **Data Protection**
   - HTTPS enforced
   - Password hashing (bcrypt)
   - CSRF protection
   - XSS prevention
   - SQL injection prevention

3. **API Security**
   - Rate limiting (Redis)
   - API key authentication
   - Request validation (Zod)
   - Helmet.js middleware

4. **Monitoring & Logging**
   - Sentry for error tracking
   - Winston for logging
   - Prometheus + Grafana
   - OpenTelemetry

---

## 🌍 البنية السحابية (Cloud Infrastructure)

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
┌───────▼────────┐                 ┌────────▼───────┐
│  Web App       │                 │  API Server    │
│  (Next.js)     │                 │  (NestJS)      │
│  Containers    │◄────────────────►  Containers    │
└────────────────┘                 └────────────────┘
        │                                   │
        └─────────────────┬─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼────────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  PostgreSQL    │ │   Redis     │ │  AWS S3     │
│  (Primary DB)  │ │   (Cache)   │ │  (Storage)  │
└────────────────┘ └─────────────┘ └─────────────┘
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/osdm

# Authentication
JWT_SECRET=your-secret-key
NEXTAUTH_URL=https://osdm.sa
NEXTAUTH_SECRET=your-nextauth-secret

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=

# Payment Gateways
MOYASAR_API_KEY=
MOYASAR_SECRET_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYTABS_MERCHANT_ID=
PAYTABS_SERVER_KEY=

# File Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Redis Cache
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
- Mobile:  < 640px
- Tablet:  640px - 1024px
- Desktop: > 1024px
```

### RTL/LTR Support

```typescript
// Automatic direction based on locale
locale === 'ar' ? 'rtl' : 'ltr'

// TailwindCSS with RTL plugin
plugins: [
  require('@tailwindcss/rtl'),
]
```

---

## 🎯 Performance Optimization

### Frontend
- Code splitting (Next.js automatic)
- Image optimization (next/image)
- Font optimization (next/font)
- Static generation where possible
- Client-side caching (SWR/React Query)

### Backend
- Database indexing (Prisma)
- Query optimization
- Redis caching
- CDN for static assets
- Lazy loading

### Database
- Connection pooling
- Query optimization
- Proper indexing
- Materialized views for analytics

---

## 📦 Monorepo Structure (Detailed)

```
osdm-platform/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── apps/
│   ├── web/                      # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/              # App Router
│   │   │   │   ├── [locale]/
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   └── marketplace/
│   │   │   │   └── api/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── marketplace/
│   │   │   │   └── ui/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   ├── api/                      # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── users/
│   │   │   │   ├── auth/
│   │   │   │   ├── products/
│   │   │   │   ├── services/
│   │   │   │   ├── projects/
│   │   │   │   ├── orders/
│   │   │   │   ├── payments/
│   │   │   │   ├── escrow/
│   │   │   │   ├── disputes/
│   │   │   │   ├── categories/
│   │   │   │   ├── reviews/
│   │   │   │   ├── notifications/
│   │   │   │   ├── messaging/
│   │   │   │   ├── analytics/
│   │   │   │   ├── ai/
│   │   │   │   └── admin/
│   │   │   ├── common/
│   │   │   ├── config/
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── nest-cli.json
│   │   └── package.json
│   │
│   └── admin/                    # Admin Dashboard
│       └── (similar structure to web)
│
├── packages/
│   ├── ui/                       # Shared UI Components
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── utils/                    # Shared Utilities
│   │   ├── src/
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── helpers.ts
│   │   └── package.json
│   │
│   ├── config/                   # Shared Configuration
│   │   ├── eslint-config/
│   │   ├── typescript-config/
│   │   └── tailwind-config/
│   │
│   └── types/                    # Shared TypeScript Types
│       ├── src/
│       │   ├── user.ts
│       │   ├── product.ts
│       │   ├── order.ts
│       │   └── ...
│       └── package.json
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seeds/
│       ├── categories.ts
│       ├── users.ts
│       └── index.ts
│
├── config/
│   ├── revenue.json
│   └── payment.json
│
├── docs/
│   ├── phase-0/
│   │   ├── architecture.md
│   │   ├── erd.md
│   │   ├── api-contract.yaml
│   │   └── rtm.md
│   ├── phase-1/
│   └── ...
│
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── Dockerfile.admin
│
├── docker-compose.yml
├── .gitignore
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## 🚀 Next Steps

هذا المخطط المعماري يوفر الأساس الكامل لبناء المنصة. التالي:

1. ✅ ERD - مخطط قاعدة البيانات التفصيلي
2. ✅ API Contract (OpenAPI/Swagger)
3. ✅ RTM - مصفوفة تتبع المتطلبات

---

**آخر تحديث:** 2025-10-09
**الحالة:** ✅ Phase 0 - Architecture Complete
