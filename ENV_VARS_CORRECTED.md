# 🔧 تصحيح متغيرات البيئة - OSDM Platform

---

## ❌ الأخطاء في المتغيرات التي أدخلتِها:

### 1. DATABASE_URL
**❌ الخطأ:**
```
DATABASE_URL=psql 'postgresql://neondb_owner:npg_g1mj4PJkLxSl@ep-steep-river-adt8z7u7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
```

**المشكلة:**
- زيادة كلمة `psql` في البداية
- علامات التنصيص الزائدة `'...'`

**✅ الصحيح:**
```
DATABASE_URL=postgresql://neondb_owner:npg_g1mj4PJkLxSl@ep-steep-river-adt8z7u7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

### 2. NEXTAUTH_URL
**❌ الخطأ:**
```
NEXTAUTH_URL=https:app-osdm.vercel.app
```

**المشكلة:**
- ناقص `/` بعد `https:`

**✅ الصحيح:**
```
NEXTAUTH_URL=https://app-osdm.vercel.app
```

---

### 3. NEXT_PUBLIC_BASE_URL
**❌ الخطأ:**
```
NEXT_PUBLIC_BASE_URL=https:app-osdm.vercel.app
```

**المشكلة:**
- نفس المشكلة - ناقص `/` بعد `https:`

**✅ الصحيح:**
```
NEXT_PUBLIC_BASE_URL=https://app-osdm.vercel.app
```

---

## ⚠️ متغيرات مهمة ناقصة:

يجب إضافة هذه المتغيرات في Vercel:

```
PLATFORM_URL=https://app-osdm.vercel.app
SUPPORT_EMAIL=app.osdm@gmail.com
SUPPORT_PHONE=+966544827213
PLATFORM_FEE_PERCENTAGE=25
NODE_ENV=production
```

---

## ✅ القائمة الكاملة المصححة:

انسخي هذه المتغيرات بالضبط إلى Vercel:

### 🔴 إلزامية:

```
DATABASE_URL=postgresql://neondb_owner:npg_g1mj4PJkLxSl@ep-steep-river-adt8z7u7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://app-osdm.vercel.app
NEXT_PUBLIC_BASE_URL=https://app-osdm.vercel.app
NEXTAUTH_SECRET=kPo07q8bRRF6pfFpz4zaDGpzd/Rr9Qv0b6lPSdnHlL8=
EMAIL_FROM=noreply@osdm.sa
RESEND_API_KEY=re_aP5AEJed_A8WjGZS3QhjAT1cTKjfvXLcE
PLATFORM_NAME=OSDM
PLATFORM_URL=https://app-osdm.vercel.app
SUPPORT_EMAIL=app.osdm@gmail.com
SUPPORT_PHONE=+966544827213
PLATFORM_FEE_PERCENTAGE=25
NODE_ENV=production
```

### 🟡 حساب الإدارة:

```
ADMIN_EMAIL=razan@osdm.sa
ADMIN_USERNAME=Razan@OSDM
ADMIN_PASSWORD=RazanOSDM@056300
```

### 🟢 بوابات الدفع (معطلة):

```
MOYASAR_API_KEY=pk_test_placeholder_key
MOYASAR_SECRET_KEY=sk_test_placeholder_key
PAYTABS_PROFILE_ID=placeholder_profile_id
PAYTABS_SERVER_KEY=placeholder_server_key
PAYPAL_CLIENT_ID=placeholder_client_id
PAYPAL_CLIENT_SECRET=placeholder_client_secret
PAYPAL_MODE=sandbox
```

---

## 📋 خطوات التصحيح في Vercel:

### الخطوة 1: احذفي المتغيرات الخاطئة
1. اذهبي لـ: Dashboard → مشروعك → Settings → Environment Variables
2. احذفي المتغيرات الثلاثة الخاطئة:
   - DATABASE_URL
   - NEXTAUTH_URL
   - NEXT_PUBLIC_BASE_URL

### الخطوة 2: أضيفي المتغيرات المصححة
1. اضغطي "Add" لكل متغير
2. انسخي القيم الصحيحة من الأعلى بالضبط
3. تأكدي من عدم وجود مسافات زائدة

### الخطوة 3: أضيفي المتغيرات الناقصة
أضيفي:
- PLATFORM_URL
- SUPPORT_EMAIL
- SUPPORT_PHONE
- PLATFORM_FEE_PERCENTAGE
- NODE_ENV

### الخطوة 4: إعادة النشر
1. اذهبي لـ: Deployments
2. اضغطي "Redeploy" على آخر deployment
3. اختاري "Use existing Build Cache" = **NO** (مهم!)
4. اضغطي "Redeploy"

---

## ✅ نصائح مهمة:

1. **لا تضعي مسافات** قبل أو بعد `=`
   - ❌ خطأ: `DATABASE_URL = postgresql://...`
   - ✅ صحيح: `DATABASE_URL=postgresql://...`

2. **لا تضعي علامات تنصيص** حول القيم في Vercel
   - ❌ خطأ: `"postgresql://..."`
   - ✅ صحيح: `postgresql://...`

3. **تأكدي من الـ URLs** تبدأ بـ `https://` (مع `/` بعد `https:`)

4. **امسحي Build Cache** قبل إعادة النشر

---

## 🎯 بعد التصحيح:

بعد تصحيح المتغيرات وإعادة النشر، المنصة يجب أن تعمل بنجاح! 🚀

إذا واجهتِ أي مشاكل، أرسليلي سجل النشر الجديد.

---

**بالتوفيق! 💜**
