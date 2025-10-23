# 📱 دليل الوصول للوحات التحكم - OSDM Platform

## ✅ لوحات التحكم الموجودة والجاهزة

### 🎯 لوحة التحكم الموحدة الرئيسية (7 لوحات)

#### المسار الأساسي:
```
http://localhost:3000/ar/dashboard/unified
```

#### الهيكل الكامل:

**Level 1 - لوحة الملخص العام:**
```
/ar/dashboard/unified/overview
/en/dashboard/unified/overview
```

**Level 2 - لوحات البائع (3 لوحات):**
```
1. منتجات جاهزة:
   /ar/dashboard/unified/seller/products
   /en/dashboard/unified/seller/products

2. خدمات مخصصة:
   /ar/dashboard/unified/seller/services
   /en/dashboard/unified/seller/services

3. مشاريع عمل حر:
   /ar/dashboard/unified/seller/projects
   /en/dashboard/unified/seller/projects
```

**Level 3 - لوحات المشتري (3 لوحات):**
```
1. مشتريات منتجات:
   /ar/dashboard/unified/buyer/products
   /en/dashboard/unified/buyer/products

2. طلبات خدمات:
   /ar/dashboard/unified/buyer/services
   /en/dashboard/unified/buyer/services

3. مشاريع منشورة:
   /ar/dashboard/unified/buyer/projects
   /en/dashboard/unified/buyer/projects
```

---

### 🔧 لوحة تحكم الإدارة

```
المسار: /ar/admin/dashboard
المسار بالإنجليزية: /en/admin/dashboard
```

**الأقسام:**
- Dashboard (الرئيسية)
- Users (المستخدمين)
- Products (المنتجات)
- Services (الخدمات)
- Projects (المشاريع)
- Orders (الطلبات)
- Payments (المدفوعات)
- Reports (التقارير)
- Disputes (النزاعات)
- Content (المحتوى)
- Settings (الإعدادات)

---

## 🔐 تسجيل الدخول

### الحسابات المتاحة:

**1. حساب المالك (صلاحيات كاملة):**
```
Email: razan@osdm.sa
Password: RazanOSDM@056300
```

**2. حساب الإدارة:**
```
Email: admin@osdm.sa
Password: admin@123456
```

**3. حساب الضيف (بائع + مشتري):**
```
Email: guest@osdm.sa
Password: guest@123456
```

---

## 🚀 التشغيل السريع

### 1. تشغيل السيرفر:
```bash
cd /Users/razantaofek/Desktop/OSDM-by-V0-Code/osdm-platform
npm run dev
```

### 2. فتح المنصة:
```
http://localhost:3000/ar
```

### 3. تسجيل الدخول:
```
http://localhost:3000/ar/auth/login
```

### 4. الوصول للوحة التحكم الموحدة:
```
http://localhost:3000/ar/dashboard/unified/overview
```

### 5. الوصول للوحة الإدارة (للأدمن فقط):
```
http://localhost:3000/ar/admin/dashboard
```

---

## 📊 المميزات في اللوحات

### ✅ لوحة الملخص العام:
- إحصائيات شاملة لكل الأسواق
- رسوم بيانية تفاعلية (Line, Doughnut Charts)
- تبديل بين وضع البائع/المشتري
- فلاتر للأسواق والفترات الزمنية
- روابط سريعة للوحات الفرعية

### ✅ لوحة المنتجات (Gumroad + Picalica):
- إدارة المنتجات الرقمية
- جدول المنتجات مع الصور
- إحصائيات المبيعات والتحميلات
- أكواد الخصم (Discount Codes)
- إدارة العملاء (CRM)
- برنامج الأفلييت
- التحليلات التفصيلية

### ✅ لوحة الخدمات (Fiverr + Khamsat):
- إدارة الخدمات المخصصة
- 3 حزم (Basic, Standard, Premium)
- إدارة الطلبات
- Gig Extras
- متطلبات الخدمة
- مستويات البائع (NEW, L1, L2, TOP_RATED)

### ✅ لوحة المشاريع (Upwork + Mostaql + Bahr):
- إدارة المشاريع والعروض
- نظام Connects
- المزايدات (Bids)
- العقود والمعالم الزمنية
- تتبع الوقت
- معرض الأعمال

---

## 🎨 التصميم والألوان

### الألوان المستخدمة:
- **Violet**: `#8B5CF6` - المنتجات الجاهزة
- **Purple**: `#A855F7` - الخدمات المتخصصة
- **Fuchsia**: `#D946EF` - فرص العمل الحر
- **Gradient**: `from-violet-600 via-purple-600 to-fuchsia-600`

### المميزات البصرية:
- ✅ Backdrop blur effects
- ✅ Gradient backgrounds
- ✅ Smooth transitions
- ✅ RTL/LTR support
- ✅ Dark mode ready
- ✅ Responsive design

---

## 🔄 التنقل بين اللوحات

### من أي لوحة يمكنك:

1. **التبديل بين البائع/المشتري:**
   - زر في الـ Top Bar

2. **التبديل بين الأسواق:**
   - Market Tabs Bar (منتجات، خدمات، مشاريع)

3. **العودة للملخص:**
   - زر Overview في Market Tabs

4. **العودة للصفحة الرئيسية:**
   - زر Home أو شعار OSDM

5. **أزرار Scroll:**
   - أزرار عائمة للأعلى/الأسفل (fixed bottom-right)

---

## ✅ الملفات الموجودة

### Layout الموحد:
```
app/[locale]/dashboard/unified/layout.tsx ✅
```

### الصفحات (7 صفحات):
```
1. app/[locale]/dashboard/unified/overview/page.tsx ✅
2. app/[locale]/dashboard/unified/seller/products/page.tsx ✅
3. app/[locale]/dashboard/unified/seller/services/page.tsx ✅
4. app/[locale]/dashboard/unified/seller/projects/page.tsx ✅
5. app/[locale]/dashboard/unified/buyer/products/page.tsx ✅
6. app/[locale]/dashboard/unified/buyer/services/page.tsx ✅
7. app/[locale]/dashboard/unified/buyer/projects/page.tsx ✅
```

### لوحة الإدارة:
```
app/[locale]/admin/layout.tsx ✅
app/[locale]/admin/dashboard/page.tsx ✅
```

---

## 📝 ملاحظات هامة

1. **اللوحات موجودة وجاهزة بالفعل**
2. **التصميم احترافي ومكتمل**
3. **دعم كامل للعربية والإنجليزية**
4. **Charts تفاعلية (Chart.js)**
5. **Tabs متعددة في كل لوحة**
6. **Tables مع Actions menu**
7. **Dialogs للإجراءات السريعة**

---

## 🎯 الخطوة التالية

ما عليك سوى:
1. تشغيل السيرفر: `npm run dev`
2. الدخول: `http://localhost:3000/ar`
3. تسجيل الدخول بأي حساب أعلاه
4. الذهاب لـ: `/ar/dashboard/unified/overview`

**اللوحات كلها جاهزة ومبنية بشكل احترافي كامل! ✅**
