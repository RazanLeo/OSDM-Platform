# 🗄️ ERD - Entity Relationship Diagram

## نظرة شاملة على قاعدة البيانات

هذا المستند يحتوي على:
1. **Prisma Schema الكامل** - جاهز للاستخدام المباشر
2. **مخططات العلاقات** - لفهم الترابط بين الجداول
3. **التعليقات التفصيلية** - لكل جدول وحقل مهم

---

## 📋 جداول قاعدة البيانات (28 جدول)

### المستخدمين والمصادقة:
1. **User** - الحساب الموحد (بائع + مشتري)
2. **Session** - جلسات تسجيل الدخول
3. **OAuthAccount** - حسابات OAuth (Google, Apple, GitHub)

### الاشتراكات والإيرادات:
4. **Subscription** - اشتراكات شهرية
5. **RevenueSettings** - إعدادات العمولات والرسوم

### السوق الأول: المنتجات الجاهزة
6. **Product** - منتجات رقمية جاهزة
7. **ProductCategory** - تصنيفات المنتجات (300+)
8. **ProductFile** - ملفات المنتجات
9. **ProductReview** - تقييمات المنتجات
10. **ProductOrder** - طلبات شراء المنتجات

### السوق الثاني: الخدمات المخصصة
11. **Service** - الخدمات المخصصة (Gigs)
12. **ServiceCategory** - تصنيفات الخدمات (100+)
13. **ServicePackage** - باقات الخدمة (Basic, Standard, Premium)
14. **ServiceOrder** - طلبات الخدمات
15. **ServiceMilestone** - معالم تسليم الخدمات

### السوق الثالث: العمل الحر
16. **Project** - مشاريع العمل الحر
17. **ProjectCategory** - تصنيفات المشاريع
18. **Proposal** - عروض المستقلين
19. **Contract** - عقود المشاريع
20. **Milestone** - معالم المشاريع

### المدفوعات والضمان:
21. **Payment** - المدفوعات
22. **Escrow** - حساب الضمان
23. **Wallet** - محفظة المستخدم
24. **Withdrawal** - طلبات السحب

### النزاعات والتواصل:
25. **Dispute** - النزاعات
26. **Message** - الرسائل
27. **Notification** - الإشعارات

### العام:
28. **AuditLog** - سجل العمليات (للأمان)

---

## 🔐 Prisma Schema الكامل

```prisma
// ============================================
// OSDM Platform - Complete Prisma Schema
// ============================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS - التعدادات
// ============================================

enum UserRole {
  USER   // مستخدم عادي (بائع + مشتري)
  ADMIN  // مدير المنصة
}

enum UserType {
  INDIVIDUAL  // فرد
  COMPANY     // شركة
}

enum SubscriptionTier {
  INDIVIDUAL  // 100 SAR/month
  SME         // 250 SAR/month
  LARGE       // 500 SAR/month
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  PENDING_PAYMENT
}

enum ProductStatus {
  DRAFT        // مسودة
  PENDING      // في انتظار المراجعة
  APPROVED     // معتمد ومنشور
  REJECTED     // مرفوض
  SUSPENDED    // موقوف
}

enum ServiceStatus {
  ACTIVE       // نشط
  PAUSED       // متوقف مؤقتاً
  PENDING      // في انتظار المراجعة
  REJECTED     // مرفوض
  SUSPENDED    // موقوف
}

enum ProjectStatus {
  OPEN         // مفتوح للعروض
  IN_PROGRESS  // جاري العمل
  COMPLETED    // مكتمل
  CANCELLED    // ملغى
  DISPUTED     // تحت النزاع
}

enum OrderStatus {
  PENDING       // في انتظار الدفع
  PAID          // مدفوع
  IN_PROGRESS   // جاري التنفيذ
  DELIVERED     // تم التسليم
  COMPLETED     // مكتمل
  CANCELLED     // ملغى
  REFUNDED      // مسترد
}

enum PaymentStatus {
  PENDING       // في انتظار المعالجة
  COMPLETED     // مكتمل
  FAILED        // فشل
  REFUNDED      // مسترد
}

enum PaymentMethod {
  MADA
  VISA
  MASTERCARD
  APPLE_PAY
  STC_PAY
  PAYTABS
  MOYASAR
  PAYPAL
  GOOGLE_PAY
}

enum EscrowStatus {
  PENDING       // في انتظار التسليم
  HELD          // محتجز
  RELEASED      // محرر للبائع
  REFUNDED      // مسترد للمشتري
  DISPUTED      // تحت النزاع
}

enum DisputeStatus {
  OPEN          // مفتوح
  UNDER_REVIEW  // قيد المراجعة
  RESOLVED      // محلول
  ESCALATED     // تصعيد للإدارة
  CLOSED        // مغلق
}

enum DisputeReason {
  NOT_DELIVERED          // لم يتم التسليم
  INCOMPLETE_WORK        // عمل غير مكتمل
  POOR_QUALITY           // جودة رديئة
  NOT_AS_DESCRIBED       // غير مطابق للوصف
  BUYER_UNAVAILABLE      // المشتري غير متاح
  PAYMENT_ISSUE          // مشكلة في الدفع
  OTHER                  // أخرى
}

enum WithdrawalStatus {
  PENDING       // في انتظار المعالجة
  APPROVED      // معتمد
  COMPLETED     // مكتمل
  REJECTED      // مرفوض
}

enum NotificationType {
  ORDER           // طلب جديد
  PAYMENT         // دفع
  MESSAGE         // رسالة
  REVIEW          // تقييم
  DISPUTE         // نزاع
  SYSTEM          // إشعار النظام
  MARKETING       // تسويق
}

enum MarketType {
  PRODUCTS    // السوق الأول: المنتجات الجاهزة
  SERVICES    // السوق الثاني: الخدمات المخصصة
  PROJECTS    // السوق الثالث: العمل الحر
}

// ============================================
// USERS & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  username      String    @unique
  email         String    @unique
  password      String?   // nullable for OAuth users
  fullName      String
  phone         String?
  country       String
  role          UserRole  @default(USER)
  userType      UserType  @default(INDIVIDUAL)

  // Profile
  avatar        String?
  bio           String?   @db.Text
  skills        String[]  // للمستقلين
  languages     String[]  // اللغات التي يتحدثها

  // Verification
  emailVerified Boolean   @default(false)
  phoneVerified Boolean   @default(false)

  // OAuth
  oauthAccounts OAuthAccount[]

  // Subscription
  subscription  Subscription?

  // Wallet
  wallet        Wallet?

  // كبائع - السوق الأول: المنتجات الجاهزة
  products      Product[]

  // كبائع - السوق الثاني: الخدمات المخصصة
  services      Service[]

  // كمشتري - طلبات المنتجات
  productOrdersAsBuyer  ProductOrder[] @relation("BuyerProductOrders")

  // كبائع - طلبات المنتجات
  productOrdersAsSeller ProductOrder[] @relation("SellerProductOrders")

  // كمشتري - طلبات الخدمات
  serviceOrdersAsBuyer  ServiceOrder[] @relation("BuyerServiceOrders")

  // كبائع - طلبات الخدمات
  serviceOrdersAsSeller ServiceOrder[] @relation("SellerServiceOrders")

  // كصاحب المشروع (Client)
  projectsAsClient      Project[]      @relation("ClientProjects")

  // كمستقل (Freelancer)
  proposals             Proposal[]
  contractsAsFreelancer Contract[]     @relation("FreelancerContracts")

  // كصاحب المشروع
  contractsAsClient     Contract[]     @relation("ClientContracts")

  // Reviews
  reviewsGiven          ProductReview[] @relation("ReviewerReviews")
  reviewsReceived       ProductReview[] @relation("SellerReviews")

  // Messages
  messagesSent          Message[]       @relation("SenderMessages")
  messagesReceived      Message[]       @relation("RecipientMessages")

  // Disputes
  disputesAsComplainant Dispute[]       @relation("ComplainantDisputes")
  disputesAsRespondent  Dispute[]       @relation("RespondentDisputes")

  // Notifications
  notifications         Notification[]

  // Withdrawals
  withdrawals           Withdrawal[]

  // Sessions
  sessions              Session[]

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?

  @@index([email])
  @@index([username])
  @@index([role])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token        String   @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([token])
}

model OAuthAccount {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider     String   // google, apple, github
  providerId   String   // ID from provider
  accessToken  String?  @db.Text
  refreshToken String?  @db.Text
  expiresAt    DateTime?
  createdAt    DateTime @default(now())

  @@unique([provider, providerId])
  @@index([userId])
}

// ============================================
// SUBSCRIPTIONS & REVENUE
// ============================================

model Subscription {
  id              String              @id @default(cuid())
  userId          String              @unique
  user            User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  tier            SubscriptionTier
  status          SubscriptionStatus  @default(PENDING_PAYMENT)

  // Pricing
  monthlyPrice    Decimal             @db.Decimal(10, 2) // 100, 250, or 500 SAR

  // Billing
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean          @default(false)

  // Payment
  lastPaymentId   String?
  lastPaymentDate DateTime?

  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  @@index([userId])
  @@index([status])
}

model RevenueSettings {
  id                    String   @id @default(cuid())

  // Platform Commission (نسبة عمولة المنصة)
  platformCommission    Decimal  @default(25.00) @db.Decimal(5, 2) // 25%

  // Payment Gateway Fee (رسوم بوابة الدفع)
  paymentGatewayFee     Decimal  @default(5.00)  @db.Decimal(5, 2) // 5%

  // Monthly Subscription Prices
  individualPrice       Decimal  @default(100.00) @db.Decimal(10, 2) // 100 SAR
  smePrice              Decimal  @default(250.00) @db.Decimal(10, 2) // 250 SAR
  largePrice            Decimal  @default(500.00) @db.Decimal(10, 2) // 500 SAR

  // Dispute Window
  disputeWindowDays     Int      @default(7) // 7 days

  // Updated by admin only
  updatedAt             DateTime @updatedAt
  updatedBy             String?  // Admin user ID
}

// ============================================
// MARKET 1: READY-MADE PRODUCTS (منتجات جاهزة)
// ============================================

model ProductCategory {
  id          String    @id @default(cuid())
  nameAr      String
  nameEn      String
  slug        String    @unique
  icon        String?   // Icon name/path
  parentId    String?   // للتصنيفات الفرعية
  parent      ProductCategory? @relation("ProductCategoryHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    ProductCategory[] @relation("ProductCategoryHierarchy")
  products    Product[]
  order       Int       @default(0) // للترتيب
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())

  @@index([slug])
  @@index([parentId])
}

model Product {
  id              String          @id @default(cuid())
  sellerId        String
  seller          User            @relation(fields: [sellerId], references: [id], onDelete: Cascade)

  // Basic Info
  titleAr         String
  titleEn         String
  descriptionAr   String          @db.Text
  descriptionEn   String          @db.Text
  slug            String          @unique

  // Category
  categoryId      String
  category        ProductCategory @relation(fields: [categoryId], references: [id])

  // Pricing
  price           Decimal         @db.Decimal(10, 2)
  originalPrice   Decimal?        @db.Decimal(10, 2) // للتخفيضات

  // Media
  thumbnail       String
  images          String[]        // صور إضافية
  demoUrl         String?         // رابط تجريبي/معاينة

  // Files
  files           ProductFile[]

  // Metadata
  tags            String[]
  downloadCount   Int             @default(0)
  viewCount       Int             @default(0)

  // Status
  status          ProductStatus   @default(DRAFT)
  rejectionReason String?         @db.Text

  // Reviews
  reviews         ProductReview[]
  averageRating   Decimal         @default(0) @db.Decimal(3, 2)
  reviewCount     Int             @default(0)

  // Orders
  orders          ProductOrder[]

  // SEO
  metaTitleAr     String?
  metaTitleEn     String?
  metaDescAr      String?         @db.Text
  metaDescEn      String?         @db.Text

  // AI Generated
  aiGenerated     Boolean         @default(false)
  aiTags          String[]
  aiCategory      String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  publishedAt     DateTime?

  @@index([sellerId])
  @@index([categoryId])
  @@index([status])
  @@index([slug])
}

model ProductFile {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  fileName    String
  fileUrl     String   // S3/MinIO URL
  fileSize    Int      // بالبايتات
  fileType    String   // mime type

  createdAt   DateTime @default(now())

  @@index([productId])
}

model ProductReview {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  reviewerId  String
  reviewer    User     @relation("ReviewerReviews", fields: [reviewerId], references: [id], onDelete: Cascade)

  sellerId    String
  seller      User     @relation("SellerReviews", fields: [sellerId], references: [id], onDelete: Cascade)

  orderId     String   @unique // كل طلب له تقييم واحد

  rating      Int      // 1-5
  comment     String?  @db.Text

  // Seller Response
  sellerResponse String? @db.Text
  respondedAt    DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([productId])
  @@index([reviewerId])
  @@index([sellerId])
}

model ProductOrder {
  id              String        @id @default(cuid())
  orderNumber     String        @unique // PROD-XXXX-XXXX

  // Buyer
  buyerId         String
  buyer           User          @relation("BuyerProductOrders", fields: [buyerId], references: [id])

  // Seller
  sellerId        String
  seller          User          @relation("SellerProductOrders", fields: [sellerId], references: [id])

  // Product
  productId       String
  product         Product       @relation(fields: [productId], references: [id])

  // Pricing
  productPrice    Decimal       @db.Decimal(10, 2)
  platformFee     Decimal       @db.Decimal(10, 2) // 25%
  paymentFee      Decimal       @db.Decimal(10, 2) // 5%
  totalAmount     Decimal       @db.Decimal(10, 2)
  sellerEarning   Decimal       @db.Decimal(10, 2) // المبلغ الصافي

  // Status
  status          OrderStatus   @default(PENDING)

  // Payment
  payment         Payment?

  // Escrow
  escrow          Escrow?

  // Delivery
  downloadUrl     String?       // رابط تحميل مؤقت
  downloadCount   Int           @default(0)
  downloadExpiresAt DateTime?   // صلاحية التحميل

  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  completedAt     DateTime?

  @@index([buyerId])
  @@index([sellerId])
  @@index([productId])
  @@index([status])
  @@index([orderNumber])
}

// ============================================
// MARKET 2: CUSTOM SERVICES (خدمات مخصصة)
// ============================================

model ServiceCategory {
  id          String    @id @default(cuid())
  nameAr      String
  nameEn      String
  slug        String    @unique
  icon        String?
  parentId    String?
  parent      ServiceCategory? @relation("ServiceCategoryHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    ServiceCategory[] @relation("ServiceCategoryHierarchy")
  services    Service[]
  order       Int       @default(0)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())

  @@index([slug])
  @@index([parentId])
}

model Service {
  id              String          @id @default(cuid())
  sellerId        String
  seller          User            @relation(fields: [sellerId], references: [id], onDelete: Cascade)

  // Basic Info
  titleAr         String
  titleEn         String
  descriptionAr   String          @db.Text
  descriptionEn   String          @db.Text
  slug            String          @unique

  // Category
  categoryId      String
  category        ServiceCategory @relation(fields: [categoryId], references: [id])

  // Media
  thumbnail       String
  images          String[]
  videoUrl        String?

  // Packages (Basic, Standard, Premium)
  packages        ServicePackage[]

  // Metadata
  tags            String[]
  viewCount       Int             @default(0)
  orderCount      Int             @default(0)

  // Status
  status          ServiceStatus   @default(PENDING)
  rejectionReason String?         @db.Text

  // Rating
  averageRating   Decimal         @default(0) @db.Decimal(3, 2)
  reviewCount     Int             @default(0)

  // Orders
  orders          ServiceOrder[]

  // SEO
  metaTitleAr     String?
  metaTitleEn     String?
  metaDescAr      String?         @db.Text
  metaDescEn      String?         @db.Text

  // AI
  aiGenerated     Boolean         @default(false)
  aiTags          String[]
  aiCategory      String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  publishedAt     DateTime?

  @@index([sellerId])
  @@index([categoryId])
  @@index([status])
  @@index([slug])
}

model ServicePackage {
  id              String        @id @default(cuid())
  serviceId       String
  service         Service       @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  // Package Type
  type            String        // BASIC, STANDARD, PREMIUM

  // Details
  nameAr          String
  nameEn          String
  descriptionAr   String        @db.Text
  descriptionEn   String        @db.Text

  // Pricing
  price           Decimal       @db.Decimal(10, 2)

  // Delivery
  deliveryDays    Int           // عدد أيام التسليم
  revisions       Int           // عدد التعديلات

  // Features
  features        String[]      // قائمة الميزات

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([serviceId])
}

model ServiceOrder {
  id              String              @id @default(cuid())
  orderNumber     String              @unique // SERV-XXXX-XXXX

  // Buyer
  buyerId         String
  buyer           User                @relation("BuyerServiceOrders", fields: [buyerId], references: [id])

  // Seller
  sellerId        String
  seller          User                @relation("SellerServiceOrders", fields: [sellerId], references: [id])

  // Service
  serviceId       String
  service         Service             @relation(fields: [serviceId], references: [id])

  // Package Selected
  packageType     String              // BASIC, STANDARD, PREMIUM
  packagePrice    Decimal             @db.Decimal(10, 2)
  deliveryDays    Int
  revisions       Int

  // Buyer Requirements
  requirements    String              @db.Text
  attachments     String[]            // ملفات مرفقة من المشتري

  // Pricing
  platformFee     Decimal             @db.Decimal(10, 2) // 25%
  paymentFee      Decimal             @db.Decimal(10, 2) // 5%
  totalAmount     Decimal             @db.Decimal(10, 2)
  sellerEarning   Decimal             @db.Decimal(10, 2)

  // Status
  status          OrderStatus         @default(PENDING)

  // Payment
  payment         Payment?

  // Escrow
  escrow          Escrow?

  // Milestones
  milestones      ServiceMilestone[]

  // Delivery
  deliveredAt     DateTime?
  deliveryFiles   String[]
  deliveryNote    String?             @db.Text

  // Timestamps
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  completedAt     DateTime?
  deadline        DateTime?

  @@index([buyerId])
  @@index([sellerId])
  @@index([serviceId])
  @@index([status])
  @@index([orderNumber])
}

model ServiceMilestone {
  id              String        @id @default(cuid())
  orderId         String
  order           ServiceOrder  @relation(fields: [orderId], references: [id], onDelete: Cascade)

  title           String
  description     String?       @db.Text
  amount          Decimal       @db.Decimal(10, 2)

  status          OrderStatus   @default(PENDING)

  deliveryFiles   String[]
  deliveryNote    String?       @db.Text

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deliveredAt     DateTime?
  acceptedAt      DateTime?

  @@index([orderId])
}

// ============================================
// MARKET 3: FREELANCE PROJECTS (عمل حر)
// ============================================

model ProjectCategory {
  id          String    @id @default(cuid())
  nameAr      String
  nameEn      String
  slug        String    @unique
  icon        String?
  parentId    String?
  parent      ProjectCategory? @relation("ProjectCategoryHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    ProjectCategory[] @relation("ProjectCategoryHierarchy")
  projects    Project[]
  order       Int       @default(0)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())

  @@index([slug])
  @@index([parentId])
}

model Project {
  id              String          @id @default(cuid())
  clientId        String
  client          User            @relation("ClientProjects", fields: [clientId], references: [id], onDelete: Cascade)

  // Basic Info
  titleAr         String
  titleEn         String
  descriptionAr   String          @db.Text
  descriptionEn   String          @db.Text
  slug            String          @unique

  // Category
  categoryId      String
  category        ProjectCategory @relation(fields: [categoryId], references: [id])

  // Budget
  budgetMin       Decimal?        @db.Decimal(10, 2)
  budgetMax       Decimal?        @db.Decimal(10, 2)
  budgetType      String          // FIXED, HOURLY

  // Timeline
  duration        Int?            // عدد الأيام المتوقعة
  deadline        DateTime?

  // Requirements
  skills          String[]
  attachments     String[]

  // Status
  status          ProjectStatus   @default(OPEN)

  // Proposals
  proposals       Proposal[]
  proposalCount   Int             @default(0)

  // Contract (عند القبول)
  contract        Contract?

  // Metadata
  viewCount       Int             @default(0)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  publishedAt     DateTime?
  closedAt        DateTime?

  @@index([clientId])
  @@index([categoryId])
  @@index([status])
  @@index([slug])
}

model Proposal {
  id              String    @id @default(cuid())
  projectId       String
  project         Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  freelancerId    String
  freelancer      User      @relation(fields: [freelancerId], references: [id], onDelete: Cascade)

  // Proposal Details
  coverLetter     String    @db.Text
  proposedAmount  Decimal   @db.Decimal(10, 2)
  deliveryDays    Int

  // Attachments
  attachments     String[]

  // Milestones (optional)
  milestonesJson  String?   @db.Text // JSON array of milestones

  // Status
  status          String    @default("PENDING") // PENDING, ACCEPTED, REJECTED

  // Contract (إذا تم القبول)
  contract        Contract?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([projectId])
  @@index([freelancerId])
}

model Contract {
  id              String      @id @default(cuid())
  contractNumber  String      @unique // PROJ-XXXX-XXXX

  // Project
  projectId       String      @unique
  project         Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // Client (صاحب المشروع)
  clientId        String
  client          User        @relation("ClientContracts", fields: [clientId], references: [id])

  // Freelancer
  freelancerId    String
  freelancer      User        @relation("FreelancerContracts", fields: [freelancerId], references: [id])

  // Proposal
  proposalId      String      @unique
  proposal        Proposal    @relation(fields: [proposalId], references: [id])

  // Contract Terms
  totalAmount     Decimal     @db.Decimal(10, 2)
  platformFee     Decimal     @db.Decimal(10, 2) // 25%
  paymentFee      Decimal     @db.Decimal(10, 2) // 5%
  freelancerEarning Decimal   @db.Decimal(10, 2)

  startDate       DateTime    @default(now())
  deadline        DateTime?

  // Status
  status          ProjectStatus @default(IN_PROGRESS)

  // Payment
  payment         Payment?

  // Escrow
  escrow          Escrow?

  // Milestones
  milestones      Milestone[]

  // Completion
  deliveryFiles   String[]
  deliveryNote    String?     @db.Text
  completedAt     DateTime?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([projectId])
  @@index([clientId])
  @@index([freelancerId])
  @@index([proposalId])
  @@index([status])
}

model Milestone {
  id              String      @id @default(cuid())
  contractId      String
  contract        Contract    @relation(fields: [contractId], references: [id], onDelete: Cascade)

  title           String
  description     String?     @db.Text
  amount          Decimal     @db.Decimal(10, 2)
  deadline        DateTime?

  status          OrderStatus @default(PENDING)

  deliveryFiles   String[]
  deliveryNote    String?     @db.Text

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deliveredAt     DateTime?
  acceptedAt      DateTime?

  @@index([contractId])
}

// ============================================
// PAYMENTS & ESCROW
// ============================================

model Payment {
  id                String          @id @default(cuid())
  paymentNumber     String          @unique // PAY-XXXX-XXXX

  // Payer
  payerId           String

  // Amount
  amount            Decimal         @db.Decimal(10, 2)
  currency          String          @default("SAR")

  // Payment Method
  method            PaymentMethod

  // Status
  status            PaymentStatus   @default(PENDING)

  // Gateway Response
  gatewayTransactionId String?
  gatewayResponse      String?      @db.Text // JSON response

  // Market Type
  marketType        MarketType

  // Relations (one-to-one with orders)
  productOrder      ProductOrder?   @relation(fields: [productOrderId], references: [id])
  productOrderId    String?         @unique

  serviceOrder      ServiceOrder?   @relation(fields: [serviceOrderId], references: [id])
  serviceOrderId    String?         @unique

  contract          Contract?       @relation(fields: [contractId], references: [id])
  contractId        String?         @unique

  // Timestamps
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  completedAt       DateTime?

  @@index([payerId])
  @@index([status])
  @@index([paymentNumber])
}

model Escrow {
  id                String          @id @default(cuid())

  // Amount
  amount            Decimal         @db.Decimal(10, 2)

  // Buyer & Seller
  buyerId           String
  sellerId          String

  // Status
  status            EscrowStatus    @default(PENDING)

  // Market Type
  marketType        MarketType

  // Relations
  productOrder      ProductOrder?   @relation(fields: [productOrderId], references: [id])
  productOrderId    String?         @unique

  serviceOrder      ServiceOrder?   @relation(fields: [serviceOrderId], references: [id])
  serviceOrderId    String?         @unique

  contract          Contract?       @relation(fields: [contractId], references: [id])
  contractId        String?         @unique

  // Release/Refund
  releasedAt        DateTime?
  refundedAt        DateTime?

  // Timestamps
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([buyerId])
  @@index([sellerId])
  @@index([status])
}

model Wallet {
  id              String        @id @default(cuid())
  userId          String        @unique
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Balance
  balance         Decimal       @default(0) @db.Decimal(10, 2)
  pendingBalance  Decimal       @default(0) @db.Decimal(10, 2) // في الضمان

  // Currency
  currency        String        @default("SAR")

  // Withdrawals
  withdrawals     Withdrawal[]

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([userId])
}

model Withdrawal {
  id              String            @id @default(cuid())
  userId          String
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  walletId        String
  wallet          Wallet            @relation(fields: [walletId], references: [id], onDelete: Cascade)

  // Amount
  amount          Decimal           @db.Decimal(10, 2)
  currency        String            @default("SAR")

  // Bank Details (JSON)
  bankDetails     String            @db.Text

  // Status
  status          WithdrawalStatus  @default(PENDING)

  // Admin Review
  reviewedBy      String?
  reviewNote      String?           @db.Text

  // Timestamps
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  completedAt     DateTime?

  @@index([userId])
  @@index([walletId])
  @@index([status])
}

// ============================================
// DISPUTES & MESSAGING
// ============================================

model Dispute {
  id                String          @id @default(cuid())
  disputeNumber     String          @unique // DIS-XXXX-XXXX

  // Parties
  complainantId     String
  complainant       User            @relation("ComplainantDisputes", fields: [complainantId], references: [id])

  respondentId      String
  respondent        User            @relation("RespondentDisputes", fields: [respondentId], references: [id])

  // Order Type
  marketType        MarketType
  orderId           String          // ID of ProductOrder, ServiceOrder, or Contract

  // Dispute Details
  reason            DisputeReason
  description       String          @db.Text
  attachments       String[]

  // Status
  status            DisputeStatus   @default(OPEN)

  // Resolution
  resolution        String?         @db.Text
  resolvedBy        String?         // Admin user ID
  resolvedAt        DateTime?

  // Outcome
  refundAmount      Decimal?        @db.Decimal(10, 2)

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([complainantId])
  @@index([respondentId])
  @@index([status])
  @@index([disputeNumber])
}

model Message {
  id              String    @id @default(cuid())

  // Sender & Recipient
  senderId        String
  sender          User      @relation("SenderMessages", fields: [senderId], references: [id], onDelete: Cascade)

  recipientId     String
  recipient       User      @relation("RecipientMessages", fields: [recipientId], references: [id], onDelete: Cascade)

  // Content
  content         String    @db.Text
  attachments     String[]

  // Context (optional)
  orderId         String?   // لربط المحادثة بطلب معين
  marketType      MarketType?

  // Status
  isRead          Boolean   @default(false)
  readAt          DateTime?

  createdAt       DateTime  @default(now())

  @@index([senderId])
  @@index([recipientId])
  @@index([orderId])
}

model Notification {
  id              String            @id @default(cuid())
  userId          String
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Notification Details
  type            NotificationType
  titleAr         String
  titleEn         String
  messageAr       String            @db.Text
  messageEn       String            @db.Text

  // Link
  link            String?

  // Status
  isRead          Boolean           @default(false)
  readAt          DateTime?

  createdAt       DateTime          @default(now())

  @@index([userId])
  @@index([isRead])
}

// ============================================
// AUDIT LOG (للأمان والمراقبة)
// ============================================

model AuditLog {
  id              String    @id @default(cuid())

  // User
  userId          String?
  userRole        String?

  // Action
  action          String    // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  entity          String    // User, Product, Order, etc.
  entityId        String?

  // Details
  changes         String?   @db.Text // JSON of changes
  ipAddress       String?
  userAgent       String?

  createdAt       DateTime  @default(now())

  @@index([userId])
  @@index([action])
  @@index([entity])
  @@index([createdAt])
}
```

---

## 📊 مخططات العلاقات

### 1. العلاقات الرئيسية للمستخدم (User)

```
User (الحساب الموحد)
├── OAuth Accounts (1:N)
├── Subscription (1:1)
├── Wallet (1:1)
│
├── كبائع في السوق الأول:
│   └── Products (1:N)
│       └── ProductOrders as Seller (1:N)
│
├── كبائع في السوق الثاني:
│   └── Services (1:N)
│       └── ServiceOrders as Seller (1:N)
│
├── كصاحب المشروع في السوق الثالث:
│   └── Projects (1:N)
│       └── Contracts as Client (1:N)
│
├── كمشتري في السوق الأول:
│   └── ProductOrders as Buyer (1:N)
│
├── كمشتري في السوق الثاني:
│   └── ServiceOrders as Buyer (1:N)
│
└── كمستقل في السوق الثالث:
    └── Proposals (1:N)
        └── Contracts as Freelancer (1:N)
```

### 2. علاقات الطلبات والدفع

```
ProductOrder / ServiceOrder / Contract
├── Payment (1:1) - الدفع
├── Escrow (1:1) - الضمان
├── Dispute (1:N) - النزاعات
└── Messages (1:N) - المحادثات
```

### 3. علاقات التصنيفات (Hierarchical)

```
ProductCategory / ServiceCategory / ProjectCategory
├── Parent Category (N:1)
└── Child Categories (1:N)
    └── Products/Services/Projects (1:N)
```

### 4. علاقات المراجعات والتقييمات

```
Product
└── ProductReviews (1:N)
    ├── Reviewer (User)
    └── Seller (User)
```

---

## 🔑 المفاتيح والفهارس

### مفاتيح أساسية (Primary Keys):
- كل جدول: `id` (CUID)

### مفاتيح فريدة (Unique Keys):
- `User`: `username`, `email`
- `Product/Service/Project`: `slug`
- `ProductOrder/ServiceOrder/Contract`: `orderNumber` / `contractNumber`
- `Payment`: `paymentNumber`
- `Dispute`: `disputeNumber`
- `Session`: `token`

### فهارس للأداء (Indexes):
- جميع `userId` - للاستعلامات حسب المستخدم
- جميع `status` - للفلترة حسب الحالة
- جميع `categoryId` - للفلترة حسب التصنيف
- جميع `slug` - لصفحات المنتجات/الخدمات
- `createdAt` في AuditLog - للسجلات الزمنية

---

## 📝 ملاحظات مهمة

### 1. الحساب الموحد:
- **جدول واحد** `User` لكل المستخدمين
- **لا يوجد** جداول منفصلة لـ Buyer/Seller
- المستخدم يمكن أن يكون بائع ومشتري في نفس الوقت
- العلاقات مفصولة باستخدام `@relation` names

### 2. نظام الضمان (Escrow):
- كل طلب له `Payment` واحد
- كل طلب له `Escrow` واحد
- الحالات: `PENDING` → `HELD` → `RELEASED` أو `REFUNDED`

### 3. العمولات والرسوم:
- عمولة المنصة: **25%** (ثابتة)
- رسوم الدفع: **5%** (ثابتة)
- المبالغ مخزنة في `RevenueSettings` للتعديل من الأدمن

### 4. الأسواق الثلاثة:
- **السوق الأول**: `Product` → `ProductOrder`
- **السوق الثاني**: `Service` → `ServiceOrder`
- **السوق الثالث**: `Project` → `Proposal` → `Contract`

### 5. التصنيفات:
- **300+ تصنيف** للمنتجات (`ProductCategory`)
- **100+ تصنيف** للخدمات (`ServiceCategory`)
- **تصنيفات** للمشاريع (`ProjectCategory`)
- يجب ملؤها عبر **Seeder** بـ Arabic + English

### 6. النزاعات:
- فترة النزاع: **7 أيام** (من `RevenueSettings`)
- يمكن للمشتري أو البائع فتح نزاع
- الإدارة تحل النزاعات

### 7. المحفظة:
- كل مستخدم له `Wallet` واحد
- `balance` - الرصيد المتاح
- `pendingBalance` - الرصيد المحجوز في الضمان
- `Withdrawal` - طلبات السحب

---

## ✅ جاهز للتنفيذ

هذا الـ Schema كامل وجاهز للاستخدام في:
1. `/prisma/schema.prisma`
2. تشغيل `npx prisma migrate dev`
3. إنشاء الـ Seeders للتصنيفات

---

**📅 Created:** Phase 0 - ERD
**📝 Next:** API Contract (OpenAPI/Swagger)
