# 🚀 دليل النشر السريع - OSDM Platform

## ⚡ 5 خطوات فقط للنشر على Vercel

---

## الخطوة 1: إعداد قاعدة البيانات (5 دقائق)

### استخدم Neon (موصى به):

1. اذهب إلى: https://neon.tech
2. أنشئ حساب مجاني
3. أنشئ مشروع جديد باسم "osdm-platform"
4. انسخ رابط الاتصال (DATABASE_URL)
5. احتفظ به - ستحتاجه في الخطوة 3

---

## الخطوة 2: إنشاء حساب Vercel (دقيقتان)

1. اذهب إلى: https://vercel.com
2. سجل دخول بحساب GitHub
3. ✅ جاهز!

---

## الخطوة 3: رفع المشروع على GitHub (دقيقة)

```bash
cd /Users/razantaofek/Desktop/OSDM-by-V0-Code/osdm-platform

# تهيئة Git (إذا لم يكن مهيأ)
git init
git remote add origin https://github.com/RazanLeo/OSDM-Platfrom-V0-and-Claude.git

# رفع الملفات
git add .
git commit -m "🚀 OSDM Platform - Ready for Production (99% Complete)"
git push -u origin main
```

---

## الخطوة 4: النشر على Vercel (3 دقائق)

### في موقع Vercel:

1. اضغط "New Project"
2. اختر "Import Git Repository"
3. اختر المستودع: `OSDM-Platfrom-V0-and-Claude`
4. اضغط "Import"

### إعداد متغيرات البيئة (مهم جداً):

انسخ هذه المتغيرات وضعها في Vercel:

#### 🔴 إلزامية (يجب وضعها الآن):

```env
# قاعدة البيانات
DATABASE_URL="postgresql://..." # من Neon (الخطوة 1)

# المصادقة
NEXTAUTH_URL="https://your-project.vercel.app" # سيعطيك Vercel الرابط
NEXT_PUBLIC_BASE_URL="https://your-project.vercel.app"
NEXTAUTH_SECRET="قم_بتوليد_مفتاح_من_هذا_الموقع: https://generate-secret.vercel.app/32"

# البريد (استخدم Resend)
EMAIL_FROM="noreply@yourdomain.com"
RESEND_API_KEY="احصل_عليه_من: https://resend.com"

# تخزين الملفات
BLOB_READ_WRITE_TOKEN="سيتم_إنشاؤه_تلقائياً_بواسطة_Vercel"

# إعدادات المنصة
PLATFORM_NAME="OSDM"
PLATFORM_URL="https://your-project.vercel.app"
SUPPORT_EMAIL="app.osdm@gmail.com"
SUPPORT_PHONE="+966544827213"
PLATFORM_FEE_PERCENTAGE="25"

# حساب الإدارة
ADMIN_EMAIL="razan@osdm.sa"
ADMIN_USERNAME="Razan@OSDM"
ADMIN_PASSWORD="RazanOSDM@056300"

# البيئة
NODE_ENV="production"
```

#### 🟡 اختيارية (يمكن إضافتها لاحقاً):

```env
# بوابات الدفع (عطّلها الآن - فعّلها عند الاستعداد)
# MOYASAR_API_KEY="pk_test_..."
# PAYTABS_PROFILE_ID="..."
# PAYPAL_CLIENT_ID="..."
# PAYPAL_MODE="sandbox"

# Google OAuth (اختياري)
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."
```

5. اضغط "Deploy"
6. انتظر 2-3 دقائق
7. ✅ جاهز!

---

## الخطوة 5: تهيئة قاعدة البيانات (دقيقتان)

بعد النشر، افتح Terminal في Vercel أو محلياً:

```bash
# إذا كنت محلياً، ضع DATABASE_URL في .env أولاً
DATABASE_URL="postgresql://..." npx prisma generate
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npx prisma db seed
```

أو في Vercel Dashboard:
1. اذهب لـ Settings → Functions
2. افتح Terminal
3. شغل الأوامر أعلاه

---

## ✅ اختبار المنصة

### افتح المنصة:
```
https://your-project.vercel.app
```

### جرب هذه الأشياء:

1. ✅ **تسجيل حساب جديد**
   - اذهب لـ `/ar/auth/register`
   - سجل حساب buyer

2. ✅ **تسجيل دخول الإدارة**
   - Username: `Razan@OSDM`
   - Password: `RazanOSDM@056300`
   - غيّر كلمة المرور فوراً!

3. ✅ **تصفح المنصة**
   - المنتجات: `/marketplace/ready-products`
   - الخدمات: `/marketplace/custom-services`
   - المشاريع: `/marketplace/freelance-jobs`

4. ✅ **اختبر رفع ملف**
   - سجل دخول كـ seller
   - أضف منتج جديد
   - ارفع صورة

5. ⚠️ **لا تختبر الدفع الآن** (المفاتيح معطلة)

---

## 🔧 بعد النشر الأول

### 1. ربط نطاق مخصص (اختياري):

في Vercel Dashboard:
1. Settings → Domains
2. أضف نطاقك: `osdm.sa`
3. اتبع التعليمات لتحديث DNS
4. حدّث المتغيرات:
   ```env
   NEXTAUTH_URL="https://osdm.sa"
   NEXT_PUBLIC_BASE_URL="https://osdm.sa"
   PLATFORM_URL="https://osdm.sa"
   ```

### 2. إعداد Vercel Blob للملفات:

1. في Vercel Dashboard → Storage
2. Create Database → Blob
3. انسخ `BLOB_READ_WRITE_TOKEN`
4. ضعه في Environment Variables
5. Redeploy

### 3. إعداد Resend للبريد:

1. اذهب لـ: https://resend.com
2. أنشئ حساب
3. أضف نطاقك وتحقق منه
4. أنشئ API Key
5. ضعه في `RESEND_API_KEY`

### 4. تفعيل بوابات الدفع (عند الاستعداد):

#### Moyasar (السعودية):
1. https://moyasar.com
2. سجل حساب
3. احصل على API Keys
4. ضع المفاتيح:
   ```env
   MOYASAR_API_KEY="pk_live_..."
   MOYASAR_SECRET_KEY="sk_live_..."
   ```
5. اختبر بمبلغ صغير (5 ريال)

#### PayTabs (الخليج):
1. https://paytabs.com
2. سجل حساب
3. احصل على Profile ID & Server Key
4. ضعهم في Environment Variables

#### PayPal (عالمي):
1. https://developer.paypal.com
2. أنشئ تطبيق
3. احصل على Client ID & Secret
4. غير `PAYPAL_MODE` من "sandbox" لـ "live"

---

## 🐛 حل المشاكل الشائعة

### مشكلة: Database connection error
**الحل:** تأكد من `DATABASE_URL` صحيح ويحتوي على `?sslmode=require`

### مشكلة: 500 Internal Server Error
**الحل:**
1. افحص Logs في Vercel Dashboard
2. تأكد من تشغيل `prisma generate` و `db push`

### مشكلة: File upload fails
**الحل:** تأكد من إعداد Vercel Blob أو AWS S3

### مشكلة: Emails not sending
**الحل:** تأكد من `RESEND_API_KEY` صحيح والنطاق متحقق منه

### مشكلة: NextAuth error
**الحل:** تأكد من:
- `NEXTAUTH_URL` يطابق رابط المنصة
- `NEXTAUTH_SECRET` مُعرّف وقوي (32+ حرف)

---

## 📊 مراقبة الأداء

### في Vercel Dashboard:

1. **Analytics** - لمراقبة الزوار
2. **Logs** - لرؤية الأخطاء
3. **Speed Insights** - لقياس الأداء
4. **Usage** - لمراقبة الاستهلاك

---

## 🔒 الأمان

### ⚠️ مهم جداً:

1. ✅ غيّر كلمة مرور الإدارة فوراً
2. ✅ لا تشارك ملف `.env` أبداً
3. ✅ استخدم `NEXTAUTH_SECRET` قوي
4. ✅ فعّل 2FA على حساب Vercel
5. ✅ راقب Logs بانتظام
6. ✅ احتفظ بنسخة احتياطية من قاعدة البيانات

---

## 📞 الدعم

**لأي مساعدة:**
- 📧 Email: app.osdm@gmail.com
- 📱 Phone: +966544827213
- 📚 Docs: `DEPLOYMENT.md` و `API_DOCUMENTATION.md`

---

## 🎉 مبروك!

منصة OSDM الآن **live ومتاحة للعالم**! 🚀

الخطوات التالية:
1. ✅ اختبر كل الميزات
2. ✅ أضف محتوى حقيقي (منتجات، خدمات)
3. ✅ ادعُ مستخدمين للتجربة
4. ✅ اجمع Feedback
5. ✅ فعّل بوابات الدفع عند الاستعداد
6. ✅ ابدأ التسويق!

**المنصة جاهزة 99% - فقط أضف خطوط DIN NEXT عند توفرها!** 🎊
