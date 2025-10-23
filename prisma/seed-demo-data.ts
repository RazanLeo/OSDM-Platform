import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Adding demo data for all 3 markets...')

  // ==========================================
  // CREATE DEMO SELLERS
  // ==========================================

  const seller1 = await prisma.user.upsert({
    where: { email: 'ahmed.designer@osdm.sa' },
    update: {},
    create: {
      id: 'demo-seller-001',
      username: 'ahmed_designer',
      email: 'ahmed.designer@osdm.sa',
      password: await bcrypt.hash('demo123', 12),
      fullName: 'أحمد المصمم',
      country: 'SA',
      role: 'USER',
      userType: 'INDIVIDUAL',
      emailVerified: true,
      sellerLevel: 'LEVEL_2',
      bio: 'مصمم جرافيك محترف مع خبرة 5 سنوات',
      skills: ['Photoshop', 'Illustrator', 'Figma'],
      languages: ['العربية', 'English'],
      updatedAt: new Date(),
    },
  })

  const seller2 = await prisma.user.upsert({
    where: { email: 'sara.developer@osdm.sa' },
    update: {},
    create: {
      id: 'demo-seller-002',
      username: 'sara_dev',
      email: 'sara.developer@osdm.sa',
      password: await bcrypt.hash('demo123', 12),
      fullName: 'سارة المطورة',
      country: 'SA',
      role: 'USER',
      userType: 'INDIVIDUAL',
      emailVerified: true,
      sellerLevel: 'TOP_RATED',
      bio: 'مطورة ويب متخصصة في React و Next.js',
      skills: ['React', 'Next.js', 'TypeScript'],
      languages: ['العربية', 'English'],
      updatedAt: new Date(),
    },
  })

  const seller3 = await prisma.user.upsert({
    where: { email: 'khalid.writer@osdm.sa' },
    update: {},
    create: {
      id: 'demo-seller-003',
      username: 'khalid_writer',
      email: 'khalid.writer@osdm.sa',
      password: await bcrypt.hash('demo123', 12),
      fullName: 'خالد الكاتب',
      country: 'SA',
      role: 'USER',
      userType: 'INDIVIDUAL',
      emailVerified: true,
      sellerLevel: 'LEVEL_1',
      bio: 'كاتب محتوى ومترجم محترف',
      skills: ['Content Writing', 'Translation', 'SEO'],
      languages: ['العربية', 'English'],
      updatedAt: new Date(),
    },
  })

  console.log('✅ Created 3 demo sellers')

  // ==========================================
  // MARKET 1: READY DIGITAL PRODUCTS
  // ==========================================

  const products = [
    {
      id: 'demo-product-001',
      sellerId: seller1.id,
      titleAr: 'دليل شامل للتصميم الجرافيكي',
      titleEn: 'Complete Graphic Design Guide',
      descriptionAr: 'كتاب إلكتروني شامل يحتوي على كل ما تحتاجه لتعلم التصميم الجرافيكي من الصفر حتى الاحتراف. يتضمن أمثلة عملية، تمارين تطبيقية، ونصائح من محترفين.',
      descriptionEn: 'Comprehensive e-book containing everything you need to learn graphic design from scratch to professional level. Includes practical examples, exercises, and tips from professionals.',
      slug: 'complete-graphic-design-guide-ar',
      categoryId: 'prod-cat-ebooks',
      price: 99.00,
      originalPrice: 149.00,
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
      images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d', 'https://images.unsplash.com/photo-1611162616305-c69b3037c3e1'],
      tags: ['design', 'graphic-design', 'ebook', 'arabic', 'تصميم'],
      status: 'APPROVED',
      isExclusive: true,
      productType: 'ebook',
      averageRating: 4.8,
      reviewCount: 24,
      downloadCount: 156,
      viewCount: 892,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'demo-product-002',
      sellerId: seller2.id,
      titleAr: 'دورة تطوير المواقع بـ Next.js',
      titleEn: 'Next.js Web Development Course',
      descriptionAr: 'دورة فيديو كاملة لتعلم بناء تطبيقات ويب حديثة باستخدام Next.js و React. تشمل 50 درس فيديو + ملفات المشروع + دعم مباشر',
      descriptionEn: 'Complete video course to learn building modern web applications using Next.js and React. Includes 50 video lessons + project files + direct support',
      slug: 'nextjs-web-development-course',
      categoryId: 'prod-cat-courses',
      price: 299.00,
      originalPrice: 499.00,
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      images: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6'],
      tags: ['nextjs', 'react', 'web-development', 'course', 'برمجة'],
      status: 'APPROVED',
      isExclusive: false,
      productType: 'video-course',
      averageRating: 4.9,
      reviewCount: 67,
      downloadCount: 234,
      viewCount: 1456,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'demo-product-003',
      sellerId: seller1.id,
      titleAr: 'مجموعة قوالب تصميم السوشيال ميديا',
      titleEn: 'Social Media Design Templates Pack',
      descriptionAr: '100+ قالب جاهز لمنصات التواصل الاجتماعي. Instagram, Facebook, Twitter, LinkedIn. قابلة للتعديل بالكامل في Photoshop و Canva',
      descriptionEn: '100+ ready-to-use templates for social media platforms. Instagram, Facebook, Twitter, LinkedIn. Fully editable in Photoshop & Canva',
      slug: 'social-media-templates-pack',
      categoryId: 'prod-cat-templates',
      price: 149.00,
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113',
      images: ['https://images.unsplash.com/photo-1611162616475-46b635cb6868', 'https://images.unsplash.com/photo-1611162616305-c69b3037c3e1'],
      tags: ['templates', 'social-media', 'instagram', 'facebook', 'قوالب'],
      status: 'APPROVED',
      isExclusive: true,
      productType: 'template',
      averageRating: 4.7,
      reviewCount: 89,
      downloadCount: 445,
      viewCount: 2134,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'demo-product-004',
      sellerId: seller3.id,
      titleAr: 'مجموعة أصوات وموسيقى خالية من حقوق الملكية',
      titleEn: 'Royalty-Free Audio & Music Pack',
      descriptionAr: '50 مقطوعة موسيقية وأصوات احترافية لمشاريعك. مناسبة للفيديوهات، البودكاست، المحتوى التسويقي',
      descriptionEn: '50 professional music tracks and sound effects for your projects. Perfect for videos, podcasts, marketing content',
      slug: 'royalty-free-audio-pack',
      categoryId: 'prod-cat-audio',
      price: 79.00,
      thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
      images: ['https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae'],
      tags: ['audio', 'music', 'royalty-free', 'sound-effects', 'موسيقى'],
      status: 'APPROVED',
      isExclusive: false,
      productType: 'audio',
      averageRating: 4.6,
      reviewCount: 34,
      downloadCount: 178,
      viewCount: 756,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'demo-product-005',
      sellerId: seller2.id,
      titleAr: 'إضافة WordPress متقدمة لإدارة المحتوى',
      titleEn: 'Advanced WordPress Content Management Plugin',
      descriptionAr: 'إضافة قوية لإدارة المحتوى بميزات متقدمة. تشمل محرر مرئي، جدولة منشورات، تحليلات، وأكثر',
      descriptionEn: 'Powerful content management plugin with advanced features. Includes visual editor, post scheduling, analytics, and more',
      slug: 'wordpress-content-plugin',
      categoryId: 'prod-cat-software',
      price: 199.00,
      originalPrice: 299.00,
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
      images: ['https://images.unsplash.com/photo-1587620962725-abab7fe55159'],
      tags: ['wordpress', 'plugin', 'cms', 'software', 'ووردبريس'],
      status: 'APPROVED',
      isExclusive: true,
      productType: 'software',
      averageRating: 4.9,
      reviewCount: 123,
      downloadCount: 567,
      viewCount: 3421,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }

  console.log('✅ Created 5 demo products (Gumroad + Picalica style)')

  // ==========================================
  // MARKET 2: CUSTOM SERVICES
  // ==========================================

  const services = [
    {
      id: 'demo-service-001',
      sellerId: seller1.id,
      titleAr: 'تصميم شعار احترافي مع هوية بصرية كاملة',
      titleEn: 'Professional Logo Design with Complete Brand Identity',
      descriptionAr: 'سأصمم لك شعاراً احترافياً فريداً مع هوية بصرية متكاملة تشمل: الشعار، الألوان، الخطوط، نماذج الأعمال، دليل الهوية البصرية. خبرة 5+ سنوات في التصميم.',
      descriptionEn: 'I will design a unique professional logo with complete brand identity including: logo, colors, fonts, business templates, brand guidelines. 5+ years experience in design.',
      slug: 'professional-logo-brand-identity',
      categoryId: 'serv-cat-design',
      thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d',
      images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d', 'https://images.unsplash.com/photo-1561070791-2526d30994b5'],
      tags: ['logo', 'branding', 'identity', 'graphic-design', 'شعار'],
      status: 'ACTIVE',
      averageRating: 4.9,
      reviewCount: 145,
      orderCount: 234,
      viewCount: 2876,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'demo-service-002',
      sellerId: seller2.id,
      titleAr: 'تطوير موقع متجر إلكتروني متكامل',
      titleEn: 'Full E-commerce Website Development',
      descriptionAr: 'سأطور لك متجراً إلكترونياً احترافياً بأحدث التقنيات (Next.js, React). يشمل: لوحة تحكم كاملة، نظام دفع آمن، إدارة المنتجات، تقارير مبيعات، تطبيق جوال.',
      descriptionEn: 'I will develop a professional e-commerce website with latest technologies (Next.js, React). Includes: complete admin panel, secure payment gateway, product management, sales reports, mobile app.',
      slug: 'ecommerce-website-development',
      categoryId: 'serv-cat-programming',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
      images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085'],
      tags: ['ecommerce', 'website', 'development', 'nextjs', 'متجر'],
      status: 'ACTIVE',
      averageRating: 5.0,
      reviewCount: 89,
      orderCount: 134,
      viewCount: 1987,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'demo-service-003',
      sellerId: seller3.id,
      titleAr: 'كتابة محتوى تسويقي احترافي',
      titleEn: 'Professional Marketing Content Writing',
      descriptionAr: 'سأكتب لك محتوى تسويقياً مقنعاً يجذب العملاء ويزيد المبيعات. متخصص في: مدونات، مقالات، وصف منتجات، محتوى سوشيال ميديا، إعلانات.',
      descriptionEn: 'I will write compelling marketing content that attracts customers and increases sales. Specialized in: blogs, articles, product descriptions, social media content, ads.',
      slug: 'marketing-content-writing',
      categoryId: 'serv-cat-writing',
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
      images: ['https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e'],
      tags: ['content', 'writing', 'marketing', 'copywriting', 'كتابة'],
      status: 'ACTIVE',
      averageRating: 4.8,
      reviewCount: 167,
      orderCount: 298,
      viewCount: 3456,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'demo-service-004',
      sellerId: seller1.id,
      titleAr: 'إنتاج فيديو دعائي متحرك احترافي',
      titleEn: 'Professional Animated Promotional Video',
      descriptionAr: 'سأنتج لك فيديو دعائي متحرك احترافي لمنتجك أو خدمتك بجودة 4K. يشمل: سيناريو، تصميم شخصيات، رسوم متحركة، تعليق صوتي، موسيقى.',
      descriptionEn: 'I will produce a professional animated promotional video for your product or service in 4K quality. Includes: script, character design, animation, voice-over, music.',
      slug: 'animated-promo-video',
      categoryId: 'serv-cat-video',
      thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb',
      images: ['https://images.unsplash.com/photo-1536240478700-b869070f9279'],
      tags: ['video', 'animation', 'motion-graphics', 'promo', 'فيديو'],
      status: 'ACTIVE',
      averageRating: 4.7,
      reviewCount: 78,
      orderCount: 123,
      viewCount: 1876,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'demo-service-005',
      sellerId: seller2.id,
      titleAr: 'إدارة حملات إعلانية على جوجل وفيسبوك',
      titleEn: 'Google & Facebook Ads Campaign Management',
      descriptionAr: 'سأدير حملاتك الإعلانية بشكل احترافي على Google Ads و Facebook Ads. خدمة شاملة: تحليل، استهداف، تحسين، تقارير يومية.',
      descriptionEn: 'I will manage your advertising campaigns professionally on Google Ads & Facebook Ads. Complete service: analysis, targeting, optimization, daily reports.',
      slug: 'google-facebook-ads-management',
      categoryId: 'serv-cat-marketing',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
      images: ['https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07'],
      tags: ['ads', 'google-ads', 'facebook-ads', 'marketing', 'إعلانات'],
      status: 'ACTIVE',
      averageRating: 4.9,
      reviewCount: 201,
      orderCount: 345,
      viewCount: 4567,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    })
  }

  // Add Service Packages (3-tier: Basic, Standard, Premium)
  const servicePackages = [
    // Service 1 packages
    { id: 'pkg-s1-basic', serviceId: 'demo-service-001', tier: 'BASIC', nameAr: 'باقة أساسية', nameEn: 'Basic', descriptionAr: 'شعار واحد + 2 تعديل', descriptionEn: '1 logo + 2 revisions', price: 250.00, deliveryDays: 3, revisions: 2, features: ['1 Logo', '2 Revisions', 'Source Files'], updatedAt: new Date() },
    { id: 'pkg-s1-standard', serviceId: 'demo-service-001', tier: 'STANDARD', nameAr: 'باقة متقدمة', nameEn: 'Standard', descriptionAr: '3 شعارات + 4 تعديلات + بطاقة عمل', descriptionEn: '3 logos + 4 revisions + business card', price: 500.00, deliveryDays: 5, revisions: 4, features: ['3 Logos', '4 Revisions', 'Business Card', 'Social Kit'], updatedAt: new Date() },
    { id: 'pkg-s1-premium', serviceId: 'demo-service-001', tier: 'PREMIUM', nameAr: 'باقة شاملة', nameEn: 'Premium', descriptionAr: 'هوية كاملة + تعديلات غير محدودة', descriptionEn: 'Full identity + unlimited revisions', price: 1200.00, deliveryDays: 10, revisions: -1, isUnlimited: true, features: ['5 Logos', 'Unlimited Revisions', 'Full Identity', 'Guidelines'], updatedAt: new Date() },

    // Service 2 packages
    { id: 'pkg-s2-basic', serviceId: 'demo-service-002', tier: 'BASIC', nameAr: 'متجر بسيط', nameEn: 'Simple Store', descriptionAr: 'متجر بـ 10 منتجات', descriptionEn: '10 products store', price: 1500.00, deliveryDays: 7, revisions: 2, features: ['10 Products', 'Basic Design', 'Payment Gateway'], updatedAt: new Date() },
    { id: 'pkg-s2-standard', serviceId: 'demo-service-002', tier: 'STANDARD', nameAr: 'متجر متقدم', nameEn: 'Advanced Store', descriptionAr: '50 منتج + لوحة تحكم', descriptionEn: '50 products + admin panel', price: 3500.00, deliveryDays: 14, revisions: 4, features: ['50 Products', 'Admin Panel', 'SEO', 'Analytics'], updatedAt: new Date() },
    { id: 'pkg-s2-premium', serviceId: 'demo-service-002', tier: 'PREMIUM', nameAr: 'متجر احترافي', nameEn: 'Professional Store', descriptionAr: 'منتجات غير محدودة + تطبيق جوال', descriptionEn: 'Unlimited products + mobile app', price: 7500.00, deliveryDays: 30, revisions: -1, isUnlimited: true, features: ['Unlimited Products', 'Mobile App', 'Multi-vendor', 'Support'], updatedAt: new Date() },
  ]

  for (const pkg of servicePackages) {
    await prisma.servicePackage.upsert({
      where: { id: pkg.id },
      update: {},
      create: pkg,
    })
  }

  console.log('✅ Created 5 demo services with packages (Fiverr + Khamsat style)')

  // ==========================================
  // MARKET 3: FREELANCE PROJECTS
  // ==========================================

  const client = await prisma.user.upsert({
    where: { email: 'tech.company@osdm.sa' },
    update: {},
    create: {
      id: 'demo-client-001',
      username: 'tech_company',
      email: 'tech.company@osdm.sa',
      password: await bcrypt.hash('demo123', 12),
      fullName: 'شركة التقنية المتقدمة',
      country: 'SA',
      role: 'USER',
      userType: 'COMPANY',
      emailVerified: true,
      updatedAt: new Date(),
    },
  })

  const projects = [
    {
      id: 'demo-project-001',
      clientId: client.id,
      titleAr: 'تطوير تطبيق جوال للتجارة الإلكترونية',
      titleEn: 'E-commerce Mobile App Development',
      descriptionAr: 'نبحث عن مطور محترف لبناء تطبيق جوال متكامل للتجارة الإلكترونية يعمل على iOS و Android. المتطلبات: React Native أو Flutter، ربط مع API، نظام دفع، إشعارات، لوحة تحكم.',
      descriptionEn: 'Looking for professional developer to build complete e-commerce mobile app for iOS & Android. Requirements: React Native or Flutter, API integration, payment system, notifications, admin panel.',
      slug: 'ecommerce-mobile-app-dev-001',
      categoryId: 'proj-cat-mobile-dev',
      budgetMin: 15000.00,
      budgetMax: 25000.00,
      budgetType: 'FIXED',
      duration: 60,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      skills: ['React Native', 'Flutter', 'Firebase', 'Payment Integration', 'تطوير تطبيقات'],
      status: 'OPEN',
      proposalCount: 12,
      viewCount: 234,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'demo-project-002',
      clientId: client.id,
      titleAr: 'تصميم واجهة مستخدم لمنصة تعليمية',
      titleEn: 'UI/UX Design for Educational Platform',
      descriptionAr: 'مطلوب مصمم UI/UX متمرس لتصميم واجهة مستخدم حديثة وسهلة الاستخدام لمنصة تعليمية. التصميم يجب أن يكون متجاوب، يدعم الوضع الداكن، ثنائي اللغة.',
      descriptionEn: 'Experienced UI/UX designer needed to design modern and user-friendly interface for educational platform. Design must be responsive, support dark mode, bilingual.',
      slug: 'educational-platform-ui-design-001',
      categoryId: 'proj-cat-design',
      budgetMin: 5000.00,
      budgetMax: 10000.00,
      budgetType: 'FIXED',
      duration: 21,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping', 'تصميم'],
      status: 'OPEN',
      proposalCount: 18,
      viewCount: 345,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'demo-project-003',
      clientId: client.id,
      titleAr: 'كتابة محتوى تقني لموقع شركة',
      titleEn: 'Technical Content Writing for Company Website',
      descriptionAr: 'نحتاج كاتب محتوى متخصص في المجال التقني لكتابة صفحات الموقع الإلكتروني والمدونة. يجب أن يكون الكاتب متمكن من اللغتين العربية والإنجليزية، لديه معرفة بالـ SEO.',
      descriptionEn: 'Need specialized technical content writer for website pages and blog. Writer must be fluent in Arabic and English, have SEO knowledge.',
      slug: 'technical-content-writing-001',
      categoryId: 'proj-cat-content',
      budgetMin: 2000.00,
      budgetMax: 5000.00,
      budgetType: 'HOURLY',
      duration: 30,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      skills: ['Content Writing', 'Technical Writing', 'SEO', 'Arabic', 'English', 'كتابة'],
      status: 'OPEN',
      proposalCount: 24,
      viewCount: 456,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'demo-project-004',
      clientId: client.id,
      titleAr: 'تحليل بيانات وإنشاء تقارير ذكاء أعمال',
      titleEn: 'Data Analysis and Business Intelligence Reporting',
      descriptionAr: 'مطلوب محلل بيانات محترف لتحليل بيانات المبيعات وإنشاء تقارير BI تفاعلية. الخبرة المطلوبة: Python, SQL, Power BI أو Tableau.',
      descriptionEn: 'Professional data analyst needed to analyze sales data and create interactive BI reports. Required experience: Python, SQL, Power BI or Tableau.',
      slug: 'data-analysis-bi-reports-001',
      categoryId: 'proj-cat-data',
      budgetMin: 8000.00,
      budgetMax: 15000.00,
      budgetType: 'FIXED',
      duration: 45,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      skills: ['Python', 'SQL', 'Power BI', 'Tableau', 'Data Analysis', 'تحليل بيانات'],
      status: 'OPEN',
      proposalCount: 15,
      viewCount: 289,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'demo-project-005',
      clientId: client.id,
      titleAr: 'بناء نظام إدارة علاقات العملاء CRM',
      titleEn: 'Custom CRM System Development',
      descriptionAr: 'نبحث عن فريق تطوير متكامل لبناء نظام CRM مخصص لإدارة عملائنا. النظام يجب أن يشمل: إدارة جهات الاتصال، تتبع الفرص، إدارة المهام، تقارير، تكامل مع البريد.',
      descriptionEn: 'Looking for complete development team to build custom CRM system for managing our clients. System must include: contact management, opportunity tracking, task management, reports, email integration.',
      slug: 'custom-crm-development-001',
      categoryId: 'proj-cat-web-dev',
      budgetMin: 30000.00,
      budgetMax: 50000.00,
      budgetType: 'FIXED',
      duration: 90,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      skills: ['Full Stack', 'React', 'Node.js', 'PostgreSQL', 'API Development', 'برمجة'],
      status: 'OPEN',
      proposalCount: 8,
      viewCount: 567,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: project,
    })
  }

  console.log('✅ Created 5 demo projects (Upwork + Mostaql + Bahr style)')

  console.log('\n🎉 Demo data added successfully!')
  console.log('\n📊 Summary:')
  console.log('- 4 Demo Users (3 sellers + 1 client)')
  console.log('- 5 Ready Digital Products')
  console.log('- 5 Custom Services (with packages)')
  console.log('- 5 Freelance Projects')
  console.log('\nAll markets now have demo data!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
