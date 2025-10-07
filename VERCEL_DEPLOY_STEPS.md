# 🚀 خطوات النشر على Vercel - دليل مبسط

---

## قبل البدء - تجهيز المتطلبات (10 دقائق)

### 1️⃣ إنشاء قاعدة بيانات على Neon (5 دقائق)

1. اذهبي إلى: https://neon.tech
2. سجلي دخول بحساب Google أو GitHub
3. اضغطي "Create Project"
4. اختاري اسم: `osdm-platform`
5. اختاري المنطقة الأقرب: `AWS - Middle East (Bahrain)`
6. اضغطي "Create Project"
7. **انسخي Connection String** (سيظهر مباشرة)
   - يبدأ بـ: `postgresql://...`
   - **احتفظي به - ستحتاجينه!**

---

### 2️⃣ إنشاء حساب Resend للبريد (3 دقائق)

1. اذهبي إلى: https://resend.com
2. سجلي حساب جديد
3. اذهبي لـ "API Keys"
4. اضغطي "Create API Key"
5. **انسخي المفتاح** (يبدأ بـ `re_...`)
6. **احتفظي به!**

---

### 3️⃣ توليد NEXTAUTH_SECRET (دقيقة)

1. اذهبي إلى: https://generate-secret.vercel.app/32
2. **انسخي المفتاح المولد**
3. **احتفظي به!**

---

## ✅ الآن جاهزة للنشر!

---

## خطوات النشر على Vercel (5 دقائق)

### الخطوة 1: الدخول إلى Vercel

1. اذهبي إلى: https://vercel.com
2. اضغطي "Sign Up" أو "Log In"
3. سجلي دخول بحساب GitHub (نفس الحساب اللي فيه المشروع)
4. ✅ تم!

---

### الخطوة 2: استيراد المشروع

1. في صفحة Dashboard، اضغطي "Add New..."
2. اختاري "Project"
3. اختاري "Import Git Repository"
4. ابحثي عن: `OSDM-Platfrom-V0-and-Claude`
5. اضغطي "Import"
6. ✅ سيفتح صفحة الإعدادات

---

### الخطوة 3: إضافة متغيرات البيئة (المهم!)

في صفحة الإعدادات:
1. انزلي لقسم "Environment Variables"
2. افتحي ملف `VERCEL_ENV_VARS.txt` (في مجلد المشروع)
3. انسخي **كل متغير** وأضيفيه واحد واحد:

#### أ) المتغيرات الإلزامية (يجب إضافتها):

**DATABASE_URL:**
```
Key: DATABASE_URL
Value: [الصقي الرابط من Neon]
```

**NEXTAUTH_URL:** (غيري your-project-name باسم مشروعك)
```
Key: NEXTAUTH_URL
Value: https://your-project-name.vercel.app
```

**NEXT_PUBLIC_BASE_URL:**
```
Key: NEXT_PUBLIC_BASE_URL
Value: https://your-project-name.vercel.app
```

**NEXTAUTH_SECRET:**
```
Key: NEXTAUTH_SECRET
Value: [الصقي المفتاح المولد]
```

**EMAIL_FROM:**
```
Key: EMAIL_FROM
Value: noreply@yourdomain.com
```
*(غيري yourdomain.com بنطاقك أو ضعي أي إيميل مؤقتاً)*

**RESEND_API_KEY:**
```
Key: RESEND_API_KEY
Value: [الصقي المفتاح من Resend]
```

**PLATFORM_NAME:**
```
Key: PLATFORM_NAME
Value: OSDM
```

**PLATFORM_URL:** (نفس NEXTAUTH_URL)
```
Key: PLATFORM_URL
Value: https://your-project-name.vercel.app
```

**SUPPORT_EMAIL:**
```
Key: SUPPORT_EMAIL
Value: app.osdm@gmail.com
```

**SUPPORT_PHONE:**
```
Key: SUPPORT_PHONE
Value: +966544827213
```

**PLATFORM_FEE_PERCENTAGE:**
```
Key: PLATFORM_FEE_PERCENTAGE
Value: 25
```

**NODE_ENV:**
```
Key: NODE_ENV
Value: production
```

---

#### ب) بوابات الدفع (معطلة مؤقتاً - ضعي قيم placeholder):

**MOYASAR_API_KEY:**
```
Key: MOYASAR_API_KEY
Value: pk_test_placeholder
```

**MOYASAR_SECRET_KEY:**
```
Key: MOYASAR_SECRET_KEY
Value: sk_test_placeholder
```

**PAYTABS_PROFILE_ID:**
```
Key: PAYTABS_PROFILE_ID
Value: placeholder
```

**PAYTABS_SERVER_KEY:**
```
Key: PAYTABS_SERVER_KEY
Value: placeholder
```

**PAYPAL_CLIENT_ID:**
```
Key: PAYPAL_CLIENT_ID
Value: placeholder
```

**PAYPAL_CLIENT_SECRET:**
```
Key: PAYPAL_CLIENT_SECRET
Value: placeholder
```

**PAYPAL_MODE:**
```
Key: PAYPAL_MODE
Value: sandbox
```

---

#### ج) حساب الإدارة:

**ADMIN_EMAIL:**
```
Key: ADMIN_EMAIL
Value: razan@osdm.sa
```

**ADMIN_USERNAME:**
```
Key: ADMIN_USERNAME
Value: Razan@OSDM
```

**ADMIN_PASSWORD:**
```
Key: ADMIN_PASSWORD
Value: RazanOSDM@056300
```

---

### الخطوة 4: النشر!

1. بعد إضافة كل المتغيرات
2. اضغطي "Deploy" (الزر الأزرق الكبير)
3. انتظري 2-3 دقائق ☕
4. ✅ تم النشر!

---

### الخطوة 5: إعداد Vercel Blob (لرفع الملفات)

1. بعد النشر، اذهبي لـ Dashboard
2. اختاري مشروعك
3. اذهبي لـ "Storage" (في القائمة العلوية)
4. اضغطي "Create Database"
5. اختاري "Blob"
6. اضغطي "Create"
7. بعد الإنشاء، اضغطي "Connect"
8. **انسخي BLOB_READ_WRITE_TOKEN**
9. ارجعي لـ "Settings" → "Environment Variables"
10. أضيفي متغير جديد:
```
Key: BLOB_READ_WRITE_TOKEN
Value: [الصقي التوكن]
```
11. اضغطي "Redeploy" لإعادة النشر بالتوكن الجديد

---

### الخطوة 6: تهيئة قاعدة البيانات

#### الطريقة 1 - من جهازك (الأسهل):

افتحي Terminal في مجلد المشروع:

```bash
# اذهبي لمجلد المشروع
cd /Users/razantaofek/Desktop/OSDM-by-V0-Code/osdm-platform

# أنشئي ملف .env مؤقت
echo 'DATABASE_URL="[الصقي_رابط_Neon_هنا]"' > .env

# شغلي الأوامر
npx prisma generate
npx prisma db push
npx prisma db seed

# احذفي ملف .env (مهم!)
rm .env
```

#### الطريقة 2 - من Vercel Console:

1. في Dashboard، اذهبي لمشروعك
2. اذهبي لـ "Settings" → "General"
3. انزلي لـ "Command Override"
4. شغلي هذه الأوامر واحد واحد في الـ Console

---

## ✅ تم! المنصة الآن Live!

رابط منصتك:
```
https://your-project-name.vercel.app
```

---

## 🧪 اختبار المنصة

### 1. افتحي المنصة:
```
https://your-project-name.vercel.app
```

### 2. تسجيل دخول الإدارة:
- اذهبي لـ: `/ar/auth/login`
- Username: `Razan@OSDM`
- Password: `RazanOSDM@056300`
- ⚠️ **غيري كلمة المرور فوراً!**

### 3. جربي:
- ✅ التسجيل بحساب عادي
- ✅ تصفح المنتجات
- ✅ تصفح الخدمات
- ✅ تصفح المشاريع
- ✅ إضافة منتج (كـ seller)
- ✅ رفع صورة

### 4. ⚠️ لا تختبري الدفع:
المفاتيح معطلة - اختبري الدفع لاحقاً بعد إضافة المفاتيح الحقيقية

---

## 🔧 بعد النشر

### ربط نطاق مخصص (اختياري):

1. في Vercel Dashboard
2. اذهبي لـ "Settings" → "Domains"
3. اضغطي "Add"
4. أدخلي نطاقك: `osdm.sa`
5. اتبعي التعليمات لتحديث DNS
6. بعد الربط، حدّثي المتغيرات:
   - `NEXTAUTH_URL` → `https://osdm.sa`
   - `NEXT_PUBLIC_BASE_URL` → `https://osdm.sa`
   - `PLATFORM_URL` → `https://osdm.sa`

---

## 🐛 حل المشاكل

### مشكلة: Database connection error
**الحل:** تأكدي من `DATABASE_URL` صحيح ويحتوي على `?sslmode=require`

### مشكلة: 500 Error
**الحل:**
1. افحصي Logs في Vercel Dashboard
2. تأكدي من تشغيل `prisma generate` و `db push`

### مشكلة: Authentication not working
**الحل:** تأكدي من:
- `NEXTAUTH_URL` يطابق رابط المنصة بالضبط
- `NEXTAUTH_SECRET` مُعرّف وقوي

---

## 📞 تحتاجين مساعدة؟

- 📧 Email: app.osdm@gmail.com
- 📱 Phone: +966544827213

---

## 🎉 مبروك!

منصة OSDM الآن **live ومتاحة للعالم**! 🚀🇸🇦

**بالتوفيق يا رزان!** 💜
