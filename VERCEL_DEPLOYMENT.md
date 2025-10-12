# نشر المنصة على Vercel - Deployment Guide

## المتطلبات الأساسية Required

### 1. قاعدة البيانات Database

يجب إضافة متغيرات البيئة التالية في Vercel:

```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

**ملاحظة مهمة:** تأكد أن الرابط يبدأ بـ `postgresql://` أو `postgres://`

### 2. NextAuth Configuration

```env
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-32-character-random-secret"
```

لإنشاء NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. بوابات الدفع Payment Gateways (اختياري)

```env
# Moyasar
MOYASAR_API_KEY="your_moyasar_key"

# PayTabs
PAYTABS_SERVER_KEY="your_paytabs_server_key"
PAYTABS_PROFILE_ID="your_paytabs_profile_id"

# PayPal
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_client_secret"
```

### 4. Vercel Blob للملفات File Storage (اختياري)

```env
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
```

## خطوات النشر Deployment Steps

### 1. إعداد Vercel Project

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. انقر على "Add New Project"
3. اختر مستودع GitHub الخاص بك
4. اختر Framework Preset: **Next.js**
5. Root Directory: `osdm-platform` (إذا كان المشروع في مجلد فرعي)

### 2. إضافة Environment Variables

في صفحة إعدادات المشروع:

1. اذهب إلى **Settings → Environment Variables**
2. أضف جميع المتغيرات المذكورة أعلاه
3. اختر Environment: **Production, Preview, Development**
4. احفظ التغييرات

### 3. Deploy

1. انقر على "Deploy"
2. انتظر حتى ينتهي البناء (Build)
3. إذا فشل، راجع سجلات الأخطاء (Build Logs)

## إصلاح الأخطاء الشائعة Common Errors

### خطأ: "the URL must start with the protocol `postgresql://`"

**السبب:** `DATABASE_URL` غير موجود أو خاطئ

**الحل:**
1. تأكد من إضافة `DATABASE_URL` في Environment Variables
2. تأكد أن الرابط صحيح ويبدأ بـ `postgresql://`
3. أعد النشر (Redeploy)

### خطأ: "Route used `params.locale` should be awaited"

**السبب:** تم حله بالفعل في آخر commit

**الحل:** اسحب آخر تحديثات من main branch

### خطأ: Database Connection Timeout

**السبب:** Neon database في وضع Sleep

**الحل:**
1. الاتصال تلقائياً عند أول طلب
2. أو استخدم Neon Paid Plan لاتصال دائم

## التحقق من النشر Verification

بعد النشر الناجح، تحقق من:

1. ✅ الصفحة الرئيسية تفتح بدون أخطاء
2. ✅ تسجيل الدخول يعمل
3. ✅ Dashboard يفتح
4. ✅ اللغة العربية (RTL) تعمل بشكل صحيح
5. ✅ اللغة الإنجليزية (LTR) تعمل بشكل صحيح

## Credentials للاختبار Test Accounts

**IMPORTANT:** Before testing, you MUST run the database seed command:

```bash
npx tsx prisma/seed.ts
```

This will create all test accounts with correct passwords:

```
Admin:
Email: admin@osdm.sa
Password: admin@123456

Guest:
Email: Guest@osdm.sa
Password: guest@123456

Owner:
Email: razan@osdm.sa
Password: RazanOSDM@056300
```

The seed script creates:
- ✅ 310 Product Categories (المنتجات الرقمية الجاهزة)
- ✅ 110 Service Categories (الخدمات الرقمية المتخصصة حسب الطلب)
- ✅ 51 Project Categories (فرص العمل الرقمي الحر عن بعد)
- ✅ 3 Test Users with correct passwords
- ✅ Wallets for all users
- ✅ Revenue settings (25% + 5%)

## الميزات المنفذة Implemented Features

✅ 3 أسواق رقمية بالأسماء الصحيحة:
   - المنتجات الرقمية الجاهزة (Ready Made Digital Products)
   - الخدمات الرقمية المتخصصة حسب الطلب (Custom Digital Products & Services by Order)
   - فرص العمل الرقمي الحر عن بعد (Remote Work Opportunities for Freelancers)
✅ 7 لوحات تحكم (Main + 3 Seller + 3 Buyer)
✅ نظام المصادقة الكامل
✅ نظام الدفع (معطّل مؤقتاً حتى إضافة API Keys)
✅ نظام الضمان (Escrow)
✅ نظام المراجعات والتقييمات
✅ نظام الرسائل
✅ نظام الإشعارات
✅ 471 تصنيف (310 منتج + 110 خدمة + 51 مشروع)
✅ دعم كامل للغتين العربية والإنجليزية
✅ RTL/LTR support

## الدعم Support

إذا واجهت مشاكل في النشر:
1. تحقق من Build Logs في Vercel
2. تأكد من إضافة جميع Environment Variables
3. تأكد من اتصال قاعدة البيانات

---
آخر تحديث: 2025-10-12
