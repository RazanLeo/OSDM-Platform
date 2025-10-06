# 🚀 OSDM Platform - Deployment Guide

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure you have:

- [ ] PostgreSQL database (Neon, Supabase, or self-hosted)
- [ ] Domain name configured
- [ ] SSL certificate (automatically handled by Vercel)
- [ ] Payment gateway accounts (Moyasar, PayTabs, PayPal)
- [ ] File storage setup (Vercel Blob recommended)
- [ ] Email service (Resend recommended)
- [ ] OAuth providers configured (Google, etc.)

---

## 🗄️ Database Setup

### Option 1: Neon (Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env`:
```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/osdm_db?sslmode=require"
```

### Option 2: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (Transaction mode)
5. Add to `.env`:
```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

### Option 3: Railway

1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Add to `.env`

### Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data (admin user + settings)
npx prisma db seed

# Optional: Open Prisma Studio to view data
npx prisma studio
```

---

## 🌐 Deployment on Vercel (Recommended)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Link Project

```bash
vercel link
```

### Step 4: Set Environment Variables

You have two options:

#### Option A: Via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from `.env.example`

#### Option B: Via CLI

```bash
# Set each variable
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... repeat for all variables
```

### Step 5: Deploy

```bash
# Deploy to production
vercel --prod
```

### Step 6: Configure Domain

1. Go to your project on Vercel
2. Settings → Domains
3. Add your custom domain (e.g., osdm.sa)
4. Update DNS records as instructed
5. Update `.env`:
```env
NEXTAUTH_URL="https://osdm.sa"
NEXT_PUBLIC_BASE_URL="https://osdm.sa"
```

---

## 📁 File Storage Setup

### Option 1: Vercel Blob (Recommended)

1. Go to your project on Vercel
2. Storage → Create Database → Blob
3. Copy the `BLOB_READ_WRITE_TOKEN`
4. Add to environment variables

### Option 2: AWS S3

1. Create an S3 bucket
2. Create IAM user with S3 permissions
3. Add credentials to `.env`:
```env
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_key"
AWS_SECRET_ACCESS_KEY="your_secret"
AWS_S3_BUCKET="osdm-files"
```

---

## 💳 Payment Gateway Setup

### Moyasar (Saudi Arabia)

1. Register at [moyasar.com](https://moyasar.com)
2. Get API keys from Dashboard
3. Add to `.env`:
```env
MOYASAR_API_KEY="pk_live_your_key"
MOYASAR_SECRET_KEY="sk_live_your_key"
```
4. Set webhook URL: `https://osdm.sa/api/payments/callback`

### PayTabs (MENA)

1. Register at [paytabs.com](https://paytabs.com)
2. Get Profile ID and Server Key
3. Add to `.env`:
```env
PAYTABS_PROFILE_ID="your_profile_id"
PAYTABS_SERVER_KEY="your_server_key"
```
4. Set return URL: `https://osdm.sa/api/payments/callback`

### PayPal (International)

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Create an app
3. Get Client ID and Secret
4. Add to `.env`:
```env
PAYPAL_CLIENT_ID="your_client_id"
PAYPAL_CLIENT_SECRET="your_client_secret"
PAYPAL_MODE="live"
```

---

## 📧 Email Service Setup

### Option 1: Resend (Recommended)

1. Go to [resend.com](https://resend.com)
2. Create API key
3. Verify your domain
4. Add to `.env`:
```env
EMAIL_FROM="noreply@osdm.sa"
RESEND_API_KEY="re_your_key"
```

### Option 2: SendGrid

1. Create account at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Verify sender email
4. Add to `.env`:
```env
EMAIL_FROM="noreply@osdm.sa"
SENDGRID_API_KEY="SG.your_key"
```

---

## 🔐 OAuth Setup

### Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   - `https://osdm.sa/api/auth/callback/google`
6. Add to `.env`:
```env
GOOGLE_CLIENT_ID="your_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_secret"
```

---

## 🔒 Security Checklist

- [ ] Change `NEXTAUTH_SECRET` to a strong random value
  ```bash
  openssl rand -base64 32
  ```
- [ ] Change default admin password immediately after first login
- [ ] Enable 2FA for admin accounts
- [ ] Set up rate limiting (Vercel handles this automatically)
- [ ] Enable CORS only for your domain
- [ ] Use environment variables for all secrets
- [ ] Never commit `.env` file
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up database backups
- [ ] Configure monitoring (Vercel Analytics)

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Included)

Automatically enabled on all Vercel deployments.

### Google Analytics (Optional)

1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get Measurement ID
3. Add to `.env`:
```env
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### Sentry (Optional - Error Tracking)

1. Create project at [sentry.io](https://sentry.io)
2. Install SDK:
```bash
npm install @sentry/nextjs
```
3. Configure in `next.config.js`

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your Git repository.

### Production Branch

```bash
git checkout main
git add .
git commit -m "Your commit message"
git push origin main
```

### Preview Deployments

Every branch gets its own preview URL automatically.

---

## 🧪 Testing Before Production

### 1. Test Locally

```bash
# Build production version
npm run build

# Start production server
npm run start

# Test at http://localhost:3000
```

### 2. Test on Staging

Create a staging environment on Vercel:

```bash
# Deploy to staging
vercel
```

Test all features:
- [ ] User registration and login
- [ ] Product listing and purchase
- [ ] Service ordering
- [ ] Project posting and proposals
- [ ] Payment flows (use test mode)
- [ ] File uploads
- [ ] Messaging
- [ ] Notifications
- [ ] Wallet and withdrawals
- [ ] Reviews and ratings

---

## 🚨 Rollback Strategy

If something goes wrong:

### Option 1: Rollback via Vercel Dashboard

1. Go to Deployments
2. Find the last working deployment
3. Click "Promote to Production"

### Option 2: Rollback via CLI

```bash
vercel rollback
```

### Option 3: Revert Git Commit

```bash
git revert HEAD
git push origin main
```

---

## 📈 Performance Optimization

### 1. Enable Edge Functions (Optional)

Certain API routes can be deployed to Vercel Edge Network for faster response times.

### 2. Image Optimization

Already handled by Next.js Image component.

### 3. Database Connection Pooling

Use Prisma connection pooling for better performance:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # For migrations
```

### 4. Caching Strategy

- Static pages: Cached by default
- API routes: Implement caching as needed
- Database queries: Use Prisma query optimization

---

## 🔧 Post-Deployment Tasks

1. **Test all features in production**
   - [ ] Registration and login
   - [ ] Payment gateways (small test purchases)
   - [ ] File uploads
   - [ ] Email notifications
   - [ ] Real-time features

2. **Set up monitoring**
   - [ ] Vercel Analytics
   - [ ] Error tracking (Sentry)
   - [ ] Uptime monitoring (UptimeRobot)

3. **Configure backups**
   - [ ] Database backups (daily)
   - [ ] File storage backups

4. **SEO Optimization**
   - [ ] Submit sitemap to Google Search Console
   - [ ] Verify domain ownership
   - [ ] Add meta tags
   - [ ] Configure robots.txt

5. **Legal & Compliance**
   - [ ] Privacy Policy
   - [ ] Terms of Service
   - [ ] Cookie Policy
   - [ ] GDPR compliance (if applicable)

---

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# If fails, check:
# 1. DATABASE_URL is correct
# 2. Database is accessible from your IP
# 3. SSL mode is set correctly
```

### Build Failures

```bash
# Check logs
vercel logs

# Common issues:
# 1. Missing environment variables
# 2. TypeScript errors
# 3. Dependency issues
```

### Payment Gateway Errors

1. Check API keys are correct
2. Verify webhook URLs are set
3. Test in sandbox/test mode first
4. Check logs for detailed errors

---

## 📞 Support

- **Documentation:** Check README.md and API_DOCUMENTATION.md
- **Email:** app.osdm@gmail.com
- **Phone:** +966544827213

---

## 🎉 Launch Checklist

Before going live:

- [ ] All environment variables set in production
- [ ] Database seeded with admin account
- [ ] Payment gateways tested
- [ ] Email service working
- [ ] File uploads working
- [ ] Domain configured with SSL
- [ ] All features tested end-to-end
- [ ] Performance optimized
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Security checklist completed
- [ ] Legal pages added
- [ ] SEO configured

---

**Deployment Date:** 2025-10-07
**Platform Version:** 1.0.0
**Status:** ✅ Ready for Production

Good luck with your launch! 🚀🇸🇦
