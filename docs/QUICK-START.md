# 🚀 OSDM Platform - Quick Start Guide

**Last Updated:** 2025-10-09
**Status:** Database Ready - API Development Starting

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database (471 categories + admin + settings)
npm run db:seed

# Start development server
npm run dev

# Open Prisma Studio (database viewer)
npm run db:studio

# Build for production
npm run build
```

---

## 🗄️ Database Setup

### 1. Create Database
```bash
# Option 1: Local PostgreSQL
createdb osdm_db

# Option 2: Use Neon/Supabase (cloud)
# Get connection string from dashboard
```

### 2. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your DATABASE_URL
DATABASE_URL="postgresql://user:password@localhost:5432/osdm_db"
```

### 3. Run Migrations
```bash
# This creates all 28 tables
npx prisma migrate dev --name init
```

### 4. Seed Database
```bash
# This adds 471 categories + admin + settings
npm run db:seed
```

**Expected Output:**
```
🌱 Starting database seeding...
==================================================

📦 Seeding Product Categories...
✅ 310 Product Categories seeded

🛠️  Seeding Service Categories...
✅ 110 Service Categories seeded

🚀 Seeding Project Categories...
✅ 51 Project Categories seeded

🔐 Seeding Admin User...
✅ Admin User created: { username: 'Razan@OSDM', email: 'admin@osdm.com', role: 'ADMIN' }

💰 Seeding Revenue Settings...
✅ Revenue Settings created: { platformCommission: '25%', paymentGatewayFee: '5%', ... }

==================================================
🎉 Database seeding completed successfully!
==================================================

📊 Summary:
   - Product Categories: 310
   - Service Categories: 110
   - Project Categories: 51
   - Admin User: 1
   - Revenue Settings: 1
   - Total Records: 473
```

---

## 👤 Admin Login

After seeding, you can login as admin:

```
Username: Razan@OSDM
Email: admin@osdm.com
Password: RazanOSDM@056300
```

**Admin Capabilities:**
- Approve/reject products, services, projects
- Manage users and disputes
- View platform analytics
- Configure revenue settings
- Moderate content

---

## 📊 Database Schema Overview

### 28 Tables Created:
1. **User** - Unified account (buyer + seller)
2. **Session** - Auth sessions
3. **OAuthAccount** - Google/Apple/GitHub login
4. **Subscription** - Monthly subscriptions (100/250/500 SAR)
5. **RevenueSettings** - Platform fees and commissions

**Market 1 - Products (6 tables):**
6. ProductCategory
7. Product
8. ProductFile
9. ProductReview
10. ProductOrder

**Market 2 - Services (5 tables):**
11. ServiceCategory
12. Service
13. ServicePackage
14. ServiceOrder
15. ServiceMilestone

**Market 3 - Projects (5 tables):**
16. ProjectCategory
17. Project
18. Proposal
19. Contract
20. Milestone

**Payments & Escrow (4 tables):**
21. Payment (9 gateways supported)
22. Escrow (fund holding)
23. Wallet (user balance)
24. Withdrawal (payout requests)

**Support (3 tables):**
25. Dispute (7-day window)
26. Message (real-time chat)
27. Notification (in-app alerts)

**Audit:**
28. AuditLog (all actions tracked)

---

## 🎨 Brand Colors

```css
Primary:   #846F9C (Purple)
Secondary: #4691A9 (Teal)
Accent:    #89A58F (Sage Green)
```

---

## 🌐 API Endpoints

**Base URL (Development):** `http://localhost:3000/api`

### Available Routes:
```
/api/auth/*          - Authentication
/api/products/*      - Product marketplace
/api/services/*      - Service marketplace
/api/projects/*      - Project/freelance marketplace
/api/orders/*        - Order management
/api/payments/*      - Payment processing
/api/disputes/*      - Dispute resolution
/api/messages/*      - Messaging
/api/notifications/* - Notifications
/api/admin/*         - Admin panel
/api/buyer/*         - Buyer operations
/api/seller/*        - Seller operations
```

**⚠️ Note:** APIs are being updated to match the new 28-table schema.

---

## 📁 Project Structure

```
osdm-platform/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API Routes
│   ├── (buyer)/           # Buyer pages
│   ├── (seller)/          # Seller pages
│   └── (admin)/           # Admin pages
├── components/            # React components
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client
│   └── auth/             # NextAuth config
├── prisma/               # Database
│   ├── schema.prisma     # 28 tables
│   ├── seed.ts           # Main seeder
│   └── seeds/            # Individual seeders
├── docs/                 # Documentation
│   ├── phase-0/          # Planning docs
│   ├── PROGRESS.md       # Current status
│   └── SESSION-*.md      # Session summaries
└── public/               # Static assets
```

---

## 🔥 Hot Tips

### View Database
```bash
# Open Prisma Studio (visual database browser)
npm run db:studio
# Navigate to http://localhost:5555
```

### Reset Database
```bash
# Warning: This deletes all data!
npx prisma migrate reset

# Then re-seed
npm run db:seed
```

### Check Database Status
```bash
# View migration status
npx prisma migrate status

# View database structure
npx prisma db pull
```

### Generate TypeScript Types
```bash
# After schema changes
npx prisma generate

# This updates @prisma/client types
```

---

## 📝 What's Seeded?

### Product Categories (310)
- E-Books (28 types)
- Design templates, images, print designs
- Audio content (music, sound effects)
- Video content (footage, templates)
- Interactive content (games, apps)
- Code & tech (scripts, plugins, websites)
- 3D assets, VR/AR, NFTs
- SaaS subscriptions
- Professional content (medical, legal, etc.)

### Service Categories (110)
- Design (logo, UI/UX, video)
- Writing & content creation
- Programming & web development
- Digital marketing (SEO, social media)
- Business services (VA, consulting)
- Voice over & audio editing

### Project Categories (51)
- Software development (web, mobile, SaaS)
- Design projects (brand identity, UI/UX)
- Marketing campaigns
- Content creation (courses, e-books)
- Business consulting
- Data analysis & AI

---

## 🆘 Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### "Database does not exist"
```bash
createdb osdm_db
# Or use your cloud database
```

### "Migration failed"
```bash
# Reset and try again
npx prisma migrate reset
npx prisma migrate dev
```

### "Seeder fails"
```bash
# Check your DATABASE_URL is correct
# Make sure migrations ran first
npx prisma migrate dev
npm run db:seed
```

---

## 📞 Need Help?

- **Documentation:** `/docs/` folder
- **Progress Report:** `/docs/PROGRESS.md`
- **API Contract:** `/docs/phase-0/api-contract.yaml`
- **Database Schema:** `/prisma/schema.prisma`
- **Session Summaries:** `/docs/SESSION-*.md`

---

## 🎯 Next Steps

1. ✅ **Database is ready!** (28 tables, 471 categories)
2. ⏳ **API Development** - Updating routes to match new schema
3. ⏳ **Dashboard UI** - Building 6 dashboards + overview
4. ⏳ **Payment Integration** - 9 payment gateways
5. ⏳ **Testing** - End-to-end functionality

---

**🤖 Generated with Claude Code**
**Platform:** OSDM - One Stop Digital Market
**Version:** 1.0.0
