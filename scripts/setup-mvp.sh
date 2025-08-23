#!/bin/bash
# Omniverse Geckos - MVP Launch Setup Script
# Configures essential services for production launch

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_header() {
    echo -e "${PURPLE}"
    echo "🦎============================================================🦎"
    echo "                 OMNIVERSE GECKOS MVP SETUP"
    echo "                 Ready for Production Launch!"
    echo "🦎============================================================🦎"
    echo -e "${NC}"
}

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

print_header

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Install Node.js 20+ from https://nodejs.org"
    exit 1
fi

if ! command -v git &> /dev/null; then
    print_error "Git not found. Install Git from https://git-scm.com"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm not found. It should come with Node.js"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
print_status "Node.js $NODE_VERSION detected"

# Step 1: Environment Setup
print_step "Step 1: Setting up environment configuration"

if [ ! -f ".env.local" ]; then
    cp env.production.example .env.local
    print_status "Created .env.local from production template"
    print_warning "IMPORTANT: Configure your .env.local with real values!"
else
    print_info ".env.local already exists"
fi

# Step 2: Install dependencies
print_step "Step 2: Installing dependencies"

if [ -f "pnpm-lock.yaml" ]; then
    if command -v pnpm &> /dev/null; then
        pnpm install --prod
    else
        print_warning "pnpm not found, installing with npm"
        npm install --production
    fi
elif [ -f "yarn.lock" ]; then
    if command -v yarn &> /dev/null; then
        yarn install --production
    else
        print_warning "yarn not found, installing with npm"
        npm install --production
    fi
else
    npm install --production
fi

print_status "Dependencies installed"

# Step 3: Database setup
print_step "Step 3: Database setup (Prisma)"

if [ -f "prisma/schema.prisma" ]; then
    if [ -n "$DATABASE_URL" ]; then
        npm run db:generate
        print_status "Prisma client generated"
        
        # Try to push schema
        if npm run db:push; then
            print_status "Database schema deployed"
        else
            print_warning "Database schema push failed - check DATABASE_URL"
        fi
    else
        print_warning "DATABASE_URL not set in environment"
    fi
else
    print_info "No Prisma schema found, skipping database setup"
fi

# Step 4: Build application
print_step "Step 4: Building application for production"

if npm run build; then
    print_status "Application built successfully!"
else
    print_error "Build failed! Check the errors above."
    exit 1
fi

# Step 5: Test critical endpoints
print_step "Step 5: Testing critical endpoints"

# Start the application in background for testing
npm start &
APP_PID=$!

# Wait a few seconds for the app to start
sleep 5

# Test health endpoint
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_status "Health endpoint responding"
else
    print_warning "Health endpoint not responding"
fi

# Stop test server
kill $APP_PID 2>/dev/null || true

# Step 6: Deployment readiness check
print_step "Step 6: Deployment readiness check"

# Check for required environment variables
required_vars=("NEXTAUTH_SECRET" "DATABASE_URL" "NEXT_PUBLIC_APP_URL")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    print_status "All critical environment variables are set"
else
    print_warning "Missing environment variables: ${missing_vars[*]}"
fi

# Check analytics setup
analytics_vars=("NEXT_PUBLIC_GA4_ID" "NEXT_PUBLIC_POSTHOG_KEY")
analytics_set=0

for var in "${analytics_vars[@]}"; do
    if [ -n "${!var}" ]; then
        ((analytics_set++))
    fi
done

if [ $analytics_set -gt 0 ]; then
    print_status "Analytics configured ($analytics_set/2 services)"
else
    print_warning "No analytics services configured"
fi

# Success message with next steps
echo ""
echo -e "${GREEN}🎉 MVP SETUP COMPLETE!${NC}"
echo ""
echo -e "${PURPLE}Next Steps for Production Launch:${NC}"
echo ""
echo -e "${BLUE}1. 🔧 Configure Environment Variables:${NC}"
echo "   - Edit .env.local with your real API keys"
echo "   - Or set them in Vercel dashboard"
echo ""
echo -e "${BLUE}2. 🚀 Deploy to Vercel:${NC}"
echo "   - Run: vercel --prod"
echo "   - Or push to GitHub (auto-deploy via GitHub Actions)"
echo ""
echo -e "${BLUE}3. 📊 Verify Analytics:${NC}"
echo "   - Test Google Analytics: https://analytics.google.com"
echo "   - Check PostHog events: https://app.posthog.com"
echo "   - Monitor errors: https://sentry.io"
echo ""
echo -e "${BLUE}4. 🌐 Setup Custom Domain:${NC}"
echo "   - Configure DNS: omniversegeckos.com -> Vercel"
echo "   - Update NEXT_PUBLIC_APP_URL in environment"
echo ""
echo -e "${BLUE}5. 📈 Launch Checklist:${NC}"
echo "   - [ ] Site loads correctly"
echo "   - [ ] Analytics tracking works"
echo "   - [ ] Contact forms working"
echo "   - [ ] Error monitoring active"
echo "   - [ ] Social media setup"
echo ""
echo -e "${BLUE}🔗 Quick Access Links:${NC}"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - Google Analytics: https://analytics.google.com"
echo "   - PostHog: https://app.posthog.com"
echo "   - Sentry: https://sentry.io"
echo ""
echo -e "${GREEN}🦎 Ready to conquer the Omniverse! 🚀${NC}"

# Create deployment checklist
print_step "Creating deployment checklist"

cat > LAUNCH_CHECKLIST.md << 'EOF'
# 🚀 Omniverse Geckos - MVP Launch Checklist

## Pre-Launch Setup
- [ ] Environment variables configured in Vercel
- [ ] Database connected and schema deployed
- [ ] Google Analytics property created and configured
- [ ] PostHog project setup and tracking verified
- [ ] Sentry project created for error monitoring
- [ ] Resend/SendGrid configured for contact forms
- [ ] OpenAI API key configured with usage limits

## Deployment
- [ ] Application builds successfully
- [ ] All tests passing
- [ ] Production deployment to Vercel successful
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] CDN and caching working

## Launch Day
- [ ] Site loads correctly on all devices
- [ ] Analytics tracking confirmed working
- [ ] Contact forms sending emails
- [ ] Error monitoring receiving test errors
- [ ] Performance metrics looking good (Core Web Vitals)
- [ ] SEO meta tags and sitemap configured

## Post-Launch (Week 1)
- [ ] Monitor error rates and fix critical issues
- [ ] Track user engagement and conversion metrics
- [ ] Gather initial user feedback
- [ ] Social media accounts created and linked
- [ ] Press kit and investor materials updated
- [ ] Community channels setup (Discord, Telegram)

## Growth Phase (Month 1)
- [ ] A/B testing setup for key conversion points
- [ ] User onboarding flow optimized
- [ ] Referral system implemented
- [ ] Email marketing sequences configured
- [ ] Partnerships and collaborations initiated
- [ ] Token presale preparation (if applicable)

## Metrics to Monitor
- [ ] Daily/Weekly active users
- [ ] Conversion rate (visitor to signup)
- [ ] Email list growth
- [ ] Social media engagement
- [ ] Site performance and uptime
- [ ] Error rates and user complaints

---
Generated by Omniverse Geckos MVP Setup Script
EOF

print_status "Created LAUNCH_CHECKLIST.md"
print_info "Follow the checklist for a successful MVP launch!"

echo ""
echo -e "${PURPLE}Happy launching! 🦎✨${NC}"