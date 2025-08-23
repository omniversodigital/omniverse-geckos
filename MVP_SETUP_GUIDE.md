# 🚀 Omniverse Geckos - MVP Setup Guide

## ⚡ Quick Launch (5 minutes)

### Prerequisites
- Node.js 20+
- Git
- Vercel account (free)

### 1. Setup Environment Variables

Create `.env.local` from the template:
```bash
cp env.production.example .env.local
```

**Minimum Required Variables:**
```bash
# Generate this: openssl rand -base64 32
NEXTAUTH_SECRET=your-32-character-secret-here

# Free PostgreSQL database
DATABASE_URL=postgresql://user:pass@host:5432/omniverse_geckos

# Your app URL (will be Vercel URL initially)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 2. Free Services Setup (10 minutes total)

#### A. Database (2 minutes) - Pick ONE:

**Option 1: Supabase (Recommended)**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create new project
3. Copy connection string → `DATABASE_URL`

**Option 2: Neon**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Create project
3. Copy connection string → `DATABASE_URL`

#### B. Analytics (3 minutes)

**Google Analytics 4:**
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create property → Web
3. Copy Measurement ID → `NEXT_PUBLIC_GA4_ID`

**PostHog (Optional but Recommended):**
1. Go to [app.posthog.com/signup](https://app.posthog.com/signup)
2. Create project
3. Copy Project API Key → `NEXT_PUBLIC_POSTHOG_KEY`

#### C. Error Monitoring (2 minutes)

**Sentry:**
1. Go to [sentry.io/signup](https://sentry.io/signup)
2. Create project → Next.js
3. Copy DSN → `NEXT_PUBLIC_SENTRY_DSN`

#### D. Email Service (2 minutes)

**Resend:**
1. Go to [resend.com/signup](https://resend.com/signup)
2. Create API key
3. Copy key → `RESEND_API_KEY`

#### E. AI Service (1 minute)

**OpenAI:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key (you get $5 free credit)
3. Copy key → `NEXT_PUBLIC_OPENAI_API_KEY` and `OPENAI_API_KEY`

### 3. Deploy to Vercel (2 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel

# Set environment variables in Vercel dashboard
# Go to: project → Settings → Environment Variables
# Add all your .env.local variables
```

### 4. Verify Deployment

Visit your Vercel URL and check:
- [ ] Site loads correctly
- [ ] `/api/health` returns healthy status
- [ ] Analytics tracking (check browser console)

---

## 📊 Analytics Dashboard Setup

Once deployed, configure your analytics dashboards:

### Google Analytics
1. Go to your GA4 property
2. Set up goals and conversions
3. Create custom dashboard for Web3 metrics

### PostHog
1. Create dashboards for:
   - User engagement
   - Conversion funnel
   - Feature usage
2. Set up feature flags for A/B testing

---

## 🚀 MVP Feature Checklist

### Core MVP Features
- [ ] Landing page with investment pitch
- [ ] Early access signup form
- [ ] Investor contact form
- [ ] Basic game demo
- [ ] NFT showcase
- [ ] Token information
- [ ] Whitepaper download

### Technical MVP
- [ ] Site deployed and accessible
- [ ] Analytics tracking active
- [ ] Error monitoring working
- [ ] Contact forms functional
- [ ] SEO optimized
- [ ] Mobile responsive
- [ ] Performance optimized (Core Web Vitals)

---

## 🎯 Launch Strategy

### Phase 1: Soft Launch (Week 1)
1. **Internal Testing**
   - Test all functionality
   - Fix any critical bugs
   - Optimize performance

2. **Limited Preview**
   - Share with close contacts
   - Gather initial feedback
   - Refine messaging

### Phase 2: Public Launch (Week 2)
1. **SEO & Content**
   - Optimize meta tags
   - Create blog content
   - Submit to directories

2. **Social Media**
   - Create Twitter/X account
   - Join relevant Discord servers
   - Engage with Web3 community

### Phase 3: Growth (Month 1)
1. **Community Building**
   - Launch Discord server
   - Create Telegram group
   - Host AMA sessions

2. **Partnership Outreach**
   - Contact Web3 influencers
   - Reach out to gaming communities
   - Explore collaboration opportunities

---

## 💰 Free Tier Limits

All these services have generous free tiers:

| Service | Free Limit | Usage for MVP |
|---------|------------|---------------|
| Supabase | 500MB DB | 6+ months |
| Google Analytics | Unlimited | Forever |
| PostHog | 1M events/month | 6+ months |
| Sentry | 5K errors/month | 6+ months |
| Resend | 3K emails/month | 6+ months |
| OpenAI | $5 credit | 2-3 months |
| Vercel | 100GB bandwidth | 6+ months |

**Total monthly cost: $0** (for first few months)

---

## 🔧 Troubleshooting

### Common Issues

**Build Fails:**
```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment Variables Not Working:**
- Check Vercel dashboard → Settings → Environment Variables
- Make sure to redeploy after adding variables
- Variables should NOT have quotes in Vercel dashboard

**Analytics Not Tracking:**
- Check browser dev tools for errors
- Verify environment variables are set
- Test with incognito mode

**Contact Forms Not Working:**
- Verify RESEND_API_KEY is set
- Check email settings in code
- Test with a simple curl request

### Getting Help

1. Check the logs in Vercel dashboard
2. Use `/api/health` to test API status
3. Check browser console for client-side errors
4. Test individual components locally

---

## 📈 Success Metrics

Track these KPIs after launch:

### Week 1 Goals
- [ ] 100+ unique visitors
- [ ] 20+ email signups
- [ ] 5+ investor inquiries
- [ ] < 3s page load time
- [ ] Zero critical errors

### Month 1 Goals
- [ ] 1K+ unique visitors
- [ ] 200+ email signups
- [ ] 50+ Discord members
- [ ] 20+ investor meetings
- [ ] Media coverage

---

## 🎉 You're Ready to Launch!

Once you've completed this setup, you'll have:
- ✅ Production-ready Web3 gaming platform
- ✅ Full analytics and monitoring
- ✅ Professional investor presentation
- ✅ Scalable infrastructure
- ✅ Growth-ready foundation

**Time to conquer the Omniverse! 🦎🚀**

---

*Need help? Check our [Development Guide](docs/DEVELOPMENT_GUIDE.md) or create an issue.*