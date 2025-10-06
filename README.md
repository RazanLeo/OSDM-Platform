# 🚀 OSDM - السوق الرقمي ذو المحطة الواحدة
## One Stop Digital Market

<div align="center">

![OSDM Platform](https://img.shields.io/badge/OSDM-Platform-8B5CF6?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.1.0-2D3748?style=for-the-badge&logo=prisma)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css)

**منصة سعودية رائدة تجمع كل المنتجات والخدمات الرقمية وفرص العمل الحر تحت سقف واحد**

[العربية](#ar) • [English](#en) • [التقدم](PROGRESS.md) • [التوثيق](#documentation)

</div>

---

## <a id="ar"></a>🇸🇦 نظرة عامة (بالعربية)

**OSDM** هي منصة رقمية سعودية شاملة تجمع بين:
- 🛍️ **المنتجات الرقمية الجاهزة** (مثل Gumroad + Picalica)
- 🎨 **الخدمات المتخصصة حسب الطلب** (مثل Fiverr + Khamsat)
- 💼 **فرص العمل الحر عن بعد** (مثل Upwork + Mostaql + Bahr)

### ✨ المميزات الرئيسية

- 🇸🇦 **منصة سعودية رائدة** تدعم رؤية 2030
- 🌐 **ثنائية اللغة** (عربي/إنجليزي) مع دعم RTL/LTR كامل
- 💳 **طرق دفع متعددة** (Mada, Visa, Apple Pay, STC Pay, إلخ)
- 🔒 **أمان عالي** مع تشفير وحماية متقدمة
- 📊 **لوحات تحكم احترافية** للبائعين والمشترين والإدارة
- 🤖 **ذكاء اصطناعي** للتوصيات والتحليلات
- 📱 **Responsive** - يعمل على جميع الأجهزة

### 📊 التقدم الحالي: **99% - جاهز للإطلاق!** 🎉

✅ **مكتمل:**
- ✅ قاعدة البيانات الشاملة (30+ نموذج)
- ✅ نظام المصادقة الكامل (NextAuth + OAuth)
- ✅ البوابات الثلاث (المنتجات، الخدمات، فرص العمل)
- ✅ 3 لوحات تحكم كاملة (بائع، مشتري، إدارة)
- ✅ **24+ صفحة احترافية**
- ✅ **4 صفحات تفاصيل متقدمة** (منتج، خدمة، مشروع، بائع)
- ✅ نظام الترجمة الكامل (عربي/إنجليزي)
- ✅ **50+ API Routes** للعمليات
- ✅ **نظام الدفع المتكامل** (Moyasar, PayTabs, PayPal)
- ✅ **نظام رفع الملفات** (Vercel Blob / AWS S3)
- ✅ **نظام المحفظة والسحوبات**
- ✅ **نظام الرسائل والإشعارات**
- ✅ **نظام التقييمات والمراجعات**
- ✅ **وثائق شاملة** (API + Deployment)

⏳ **المتبقي (1%):**
- ⏳ خطوط DIN NEXT (بانتظار الملفات)
- ⏳ اختياري: Pusher للرسائل الفورية

---

## <a id="en"></a>🌍 Overview (English)

**OSDM** is a comprehensive Saudi digital marketplace that combines:
- 🛍️ **Ready-made Digital Products** (like Gumroad + Picalica)
- 🎨 **Custom Services on Demand** (like Fiverr + Khamsat)
- 💼 **Remote Freelance Opportunities** (like Upwork + Mostaql + Bahr)

### ✨ Key Features

- 🇸🇦 **Leading Saudi Platform** supporting Vision 2030
- 🌐 **Bilingual** (Arabic/English) with full RTL/LTR support
- 💳 **Multiple Payment Methods** (Mada, Visa, Apple Pay, STC Pay, etc.)
- 🔒 **High Security** with advanced encryption and protection
- 📊 **Professional Dashboards** for sellers, buyers, and admins
- 🤖 **AI Integration** for recommendations and analytics
- 📱 **Responsive** - works on all devices

### 📊 Current Progress: **80%**

✅ **Completed:**
- Comprehensive database (30+ models)
- Complete authentication system
- Three gateways (Products, Services, Jobs)
- 3 complete dashboards
- 15+ professional pages
- Complete translation system

⏳ **In Development:**
- API Routes for operations
- Payment and commission system
- File upload/download system
- Messaging and notification system

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database (or use Neon/Supabase)
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/osdm-platform.git
cd osdm-platform

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Update .env with your database URL and keys
# DATABASE_URL="postgresql://..."

# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Seed initial data
npx prisma db seed

# Run development server
pnpm dev
```

### Access the Platform

- **Homepage:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/ar/dashboard/admin
- **Default Admin Account:**
  - Username: `Razan@OSDM`
  - Password: `RazanOSDM@056300`

---

## 🏗️ Tech Stack

- **Framework:** Next.js 15.2.4
- **Language:** TypeScript 5
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS 4.1.9
- **UI Components:** Radix UI + shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React
- **Validation:** Zod
- **Forms:** React Hook Form

---

## 📁 Project Structure

```
osdm-platform/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── [locale]/          # Localized pages
│   │   ├── marketplace/   # Three gateways
│   │   ├── dashboard/     # Control panels
│   │   └── auth/          # Authentication
├── components/            # React components
│   ├── ui/               # UI primitives
│   └── ...               # Feature components
├── lib/                   # Utilities
│   ├── prisma.ts         # Database client
│   ├── auth/             # Auth config
│   ├── i18n/             # Translations
│   └── data/             # Static data
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Seed data
├── public/               # Static assets
└── styles/               # Global styles
```

---

## 🎨 Color Palette

```css
/* OSDM Brand Colors */
--osdm-purple: #846F9C;  /* Primary */
--osdm-blue: #4691A9;    /* Secondary */
--osdm-green: #89A58F;   /* Accent */

/* Gradients */
background: linear-gradient(to right, #846F9C, #4691A9, #89A58F);
```

---

## 📖 Documentation

- [تقرير التقدم الشامل](PROGRESS.md)
- [Prisma Schema Documentation](prisma/schema.prisma)
- [API Routes Guide](#) (قريباً)
- [Component Library](#) (قريباً)

---

## 🛣️ Roadmap

### Phase 1: Foundation ✅ (Complete)
- [x] Database schema
- [x] Authentication system
- [x] Basic UI components
- [x] Main pages

### Phase 2: Core Features ⏳ (In Progress - 50%)
- [x] Three gateways
- [x] Dashboards
- [ ] API Routes
- [ ] File upload system
- [ ] Payment integration

### Phase 3: Advanced Features ⏳ (Upcoming)
- [ ] Real-time messaging
- [ ] Notifications
- [ ] AI recommendations
- [ ] Advanced analytics
- [ ] Loyalty programs

### Phase 4: Launch 🎯 (Target: Q1 2026)
- [ ] Security audit
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Testing
- [ ] Deployment

---

## 🤝 Contributing

This is a private project. For questions or support:
- 📧 Email: app.osdm@gmail.com
- 📱 Phone/WhatsApp: +966544827213

---

## 📄 License

Copyright © 2025 OSDM Platform. All rights reserved.

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

<div align="center">

**صُنع بـ ❤️ في المملكة العربية السعودية 🇸🇦**

**Made with ❤️ in Saudi Arabia 🇸🇦**

</div>
