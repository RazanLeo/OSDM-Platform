# ✅ Phase 1 Checklist - Monorepo Scaffold

## المرحلة الأولى: بناء الهيكل الأساسي

---

## 📋 قائمة المهام

### 🏗️ 1. Monorepo Setup

- [ ] **1.1** تثبيت Turborepo
  ```bash
  npx create-turbo@latest
  ```

- [ ] **1.2** إنشاء هيكل المجلدات:
  ```
  osdm-platform/
  ├── apps/
  │   ├── web/
  │   ├── api/
  │   └── admin/
  ├── packages/
  │   ├── ui/
  │   ├── utils/
  │   ├── config/
  │   └── types/
  ├── prisma/
  └── docs/
  ```

- [ ] **1.3** إعداد `turbo.json` للـ Pipeline

---

### 🎨 2. Frontend Setup (Next.js 14)

- [ ] **2.1** إنشاء Next.js App في `apps/web`
  ```bash
  cd apps
  npx create-next-app@latest web --typescript --tailwind --app
  ```

- [ ] **2.2** إعداد TailwindCSS مع الألوان:
  ```js
  // tailwind.config.ts
  colors: {
    primary: '#846F9C',
    secondary: '#4691A9',
    accent: '#89A58F',
  }
  ```

- [ ] **2.3** إعداد الخطوط (DIN NEXT):
  ```css
  /* globals.css */
  @font-face {
    font-family: 'DIN Next Arabic';
    src: url('/fonts/DINNextArabic.woff2');
  }
  @font-face {
    font-family: 'DIN Next Latin';
    src: url('/fonts/DINNextLatin.woff2');
  }
  ```

- [ ] **2.4** إعداد i18n مع next-intl:
  ```bash
  npm install next-intl
  ```

- [ ] **2.5** إنشاء هيكل Routes:
  ```
  app/
  ├── [lang]/
  │   ├── (auth)/
  │   │   ├── login/
  │   │   └── register/
  │   ├── (buyer)/
  │   │   ├── products/
  │   │   ├── services/
  │   │   └── projects/
  │   ├── (seller)/
  │   │   ├── products/
  │   │   ├── services/
  │   │   └── projects/
  │   └── dashboard/
  └── api/
  ```

- [ ] **2.6** إعداد ملفات الترجمة:
  ```
  messages/
  ├── ar.json
  └── en.json
  ```

---

### 🔧 3. Backend Setup (NestJS)

- [ ] **3.1** إنشاء NestJS App في `apps/api`
  ```bash
  cd apps
  npx @nestjs/cli new api
  ```

- [ ] **3.2** تثبيت Dependencies الأساسية:
  ```bash
  npm install @prisma/client
  npm install @nestjs/jwt @nestjs/passport passport passport-jwt
  npm install bcryptjs
  npm install class-validator class-transformer
  ```

- [ ] **3.3** إنشاء Modules الأساسية:
  ```
  src/
  ├── auth/
  ├── users/
  ├── products/
  ├── services/
  ├── projects/
  ├── payments/
  ├── common/
  └── config/
  ```

- [ ] **3.4** إعداد Prisma Module:
  ```bash
  npm install -D prisma
  npm install @prisma/client
  ```

- [ ] **3.5** إعداد Environment Variables:
  ```env
  DATABASE_URL=
  JWT_SECRET=
  PORT=4000
  ```

---

### 🗄️ 4. Database Setup (PostgreSQL + Prisma)

- [ ] **4.1** نسخ Prisma Schema من `/docs/phase-0/erd.md`:
  ```bash
  # ينسخ Schema الكامل (28 جدول + 19 Enum)
  ```

- [ ] **4.2** إنشاء ملف `prisma/schema.prisma`

- [ ] **4.3** تشغيل أول Migration:
  ```bash
  npx prisma migrate dev --name init
  ```

- [ ] **4.4** توليد Prisma Client:
  ```bash
  npx prisma generate
  ```

- [ ] **4.5** فتح Prisma Studio للتحقق:
  ```bash
  npx prisma studio
  ```

---

### 🌱 5. Database Seeding

- [ ] **5.1** إنشاء Seeders:
  ```
  prisma/seeds/
  ├── product-categories.ts    (300+ categories)
  ├── service-categories.ts    (100+ categories)
  ├── project-categories.ts    (50+ categories)
  ├── admin-user.ts            (Razan@OSDM)
  └── revenue-settings.ts      (25%, 5%)
  ```

- [ ] **5.2** تنفيذ Seeder للتصنيفات:
  - [ ] **Product Categories** (AR + EN)
  - [ ] **Service Categories** (AR + EN)
  - [ ] **Project Categories** (AR + EN)

- [ ] **5.3** تنفيذ Seeder للأدمن:
  ```typescript
  {
    username: 'Razan@OSDM',
    password: await bcrypt.hash('RazanOSDM@056300', 10),
    email: 'admin@osdm.com',
    fullName: 'Razan OSDM Admin',
    role: 'ADMIN',
    userType: 'INDIVIDUAL',
    country: 'Saudi Arabia',
  }
  ```

- [ ] **5.4** تنفيذ Seeder للإعدادات:
  ```typescript
  {
    platformCommission: 25.00,
    paymentGatewayFee: 5.00,
    individualPrice: 100.00,
    smePrice: 250.00,
    largePrice: 500.00,
    disputeWindowDays: 7,
  }
  ```

- [ ] **5.5** تشغيل كل الـ Seeders:
  ```bash
  npx prisma db seed
  ```

---

### 🐳 6. Docker Setup

- [ ] **6.1** إنشاء `docker-compose.yml`:
  ```yaml
  services:
    postgres:
      image: postgres:15
      ports:
        - "5432:5432"
      environment:
        POSTGRES_USER: osdm
        POSTGRES_PASSWORD: osdm123
        POSTGRES_DB: osdm_db

    redis:
      image: redis:7
      ports:
        - "6379:6379"

    minio:
      image: minio/minio
      ports:
        - "9000:9000"
        - "9001:9001"
      environment:
        MINIO_ROOT_USER: osdm
        MINIO_ROOT_PASSWORD: osdm123456
      command: server /data --console-address ":9001"
  ```

- [ ] **6.2** تشغيل Docker Containers:
  ```bash
  docker-compose up -d
  ```

- [ ] **6.3** التحقق من الاتصال:
  - PostgreSQL: `psql -h localhost -U osdm -d osdm_db`
  - Redis: `redis-cli ping`
  - MinIO: `http://localhost:9001`

---

### 📦 7. Shared Packages

- [ ] **7.1** `packages/types/` - TypeScript Types:
  ```typescript
  // Shared types from Prisma
  export * from '@prisma/client'

  // Custom types
  export type { ApiResponse, PaginatedResponse }
  ```

- [ ] **7.2** `packages/ui/` - Shared UI Components:
  ```typescript
  // Button, Input, Card, Modal, etc.
  ```

- [ ] **7.3** `packages/utils/` - Shared Utilities:
  ```typescript
  // formatCurrency, formatDate, etc.
  ```

- [ ] **7.4** `packages/config/` - Shared Config:
  ```typescript
  // Constants, ENV validation
  ```

---

### 🔐 8. Environment Variables

- [ ] **8.1** إنشاء `.env` في `apps/web`:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:4000
  ```

- [ ] **8.2** إنشاء `.env` في `apps/api`:
  ```env
  DATABASE_URL=postgresql://osdm:osdm123@localhost:5432/osdm_db
  DIRECT_URL=postgresql://osdm:osdm123@localhost:5432/osdm_db

  JWT_SECRET=your-super-secret-jwt-key-change-in-production
  JWT_EXPIRES_IN=15m
  REFRESH_TOKEN_SECRET=your-refresh-secret
  REFRESH_TOKEN_EXPIRES_IN=7d

  REDIS_HOST=localhost
  REDIS_PORT=6379

  MINIO_ENDPOINT=localhost
  MINIO_PORT=9000
  MINIO_ACCESS_KEY=osdm
  MINIO_SECRET_KEY=osdm123456
  MINIO_USE_SSL=false

  PORT=4000
  ```

- [ ] **8.3** إنشاء `.env.example` لكل app

---

### ✅ 9. Testing & Verification

- [ ] **9.1** تشغيل Frontend:
  ```bash
  cd apps/web
  npm run dev
  # يجب أن يعمل على http://localhost:3000
  ```

- [ ] **9.2** تشغيل Backend:
  ```bash
  cd apps/api
  npm run start:dev
  # يجب أن يعمل على http://localhost:4000
  ```

- [ ] **9.3** التحقق من Database:
  ```bash
  npx prisma studio
  # يجب أن يعرض الجداول والـ Seeded Data
  ```

- [ ] **9.4** اختبار API:
  ```bash
  curl http://localhost:4000/health
  # يجب أن يرد: { "status": "ok" }
  ```

- [ ] **9.5** اختبار Turbo Build:
  ```bash
  npm run build
  # يجب أن يبني كل الـ Apps بنجاح
  ```

---

### 📚 10. Documentation

- [ ] **10.1** تحديث README.md الرئيسي:
  - Installation Instructions
  - Development Setup
  - Running the Project
  - Environment Variables

- [ ] **10.2** إنشاء CONTRIBUTING.md

- [ ] **10.3** تحديث RTM:
  - تعليم المتطلبات المنجزة في Phase 1 بـ ✅

---

## 🎯 Definition of Done (Phase 1)

### ✅ يُعتبر Phase 1 مكتملاً عندما:

1. ✅ Monorepo يعمل بنجاح (Turborepo)
2. ✅ Next.js 14 App يعمل على `localhost:3000`
3. ✅ NestJS API يعمل على `localhost:4000`
4. ✅ PostgreSQL متصلة وجاهزة
5. ✅ Prisma Migrations منفذة بنجاح (28 جدول)
6. ✅ Seeders منفذة بنجاح:
   - 300+ Product Categories
   - 100+ Service Categories
   - 50+ Project Categories
   - 1 Admin User (Razan@OSDM)
   - 1 Revenue Settings
7. ✅ Docker Compose يعمل (PostgreSQL + Redis + MinIO)
8. ✅ TailwindCSS مُعد مع الألوان الصحيحة
9. ✅ i18n (next-intl) مُعد ويعمل
10. ✅ Shared Packages تعمل
11. ✅ Environment Variables مُعدة
12. ✅ `npm run build` ينجح لكل الـ Apps
13. ✅ Prisma Studio يعرض البيانات
14. ✅ Documentation محدثة

---

## 📊 التقدم

### الحالة الحالية:
- Phase 0: ✅ **مكتمل**
- Phase 1: ⏳ **في الانتظار**

### المتوقع:
- عدد الملفات المُنشأة: 50+
- عدد الـ Dependencies: 40+
- مدة التنفيذ المتوقعة: 2-3 ساعات عمل

---

## 🚀 جاهز للبدء!

**الأولوية الآن:**
1. تشغيل `npx create-turbo@latest`
2. Setup Docker Compose
3. Setup Prisma
4. Run Migrations
5. Run Seeders

---

**📝 ملاحظات:**

- اتبع الـ Checklist بالترتيب
- عَلّم كل مهمة بـ ✅ عند الانتهاء
- في نهاية Phase 1، حدّث RTM

**🎯 الهدف:** Monorepo كامل وجاهز للتطوير في Phase 2 (Auth & Roles)
