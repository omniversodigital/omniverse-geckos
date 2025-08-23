# 🔐 GitHub Secrets Configuration Guide

## Quick Setup Checklist

### 1. GitHub Repository Secrets

Navigate to your repository → Settings → Secrets and variables → Actions

#### Required Secrets (Priority 1)
```bash
# Vercel Deployment
VERCEL_TOKEN=vercel_xxxxxxxxxxxxx
VERCEL_ORG_ID=team_xxxxxxxxxxxxx  
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx

# Basic Authentication
NEXTAUTH_SECRET=your-32-char-secret-key-here

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
```

#### Analytics & Monitoring (Priority 2)
```bash
# Google Analytics
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX

# PostHog Analytics  
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxxxxxxxxxx

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxxxxxxxxxxxx
```

#### AI Services (Priority 2)
```bash
# OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Anthropic Claude
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx  
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Hugging Face
NEXT_PUBLIC_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
```

#### Blockchain (Priority 3)
```bash
# Ethereum Network
NEXT_PUBLIC_INFURA_PROJECT_ID=xxxxxxxxxxxxx
NEXT_PUBLIC_ALCHEMY_API_KEY=xxxxxxxxxxxxx
ETHERSCAN_API_KEY=xxxxxxxxxxxxx

# Smart Contracts (will be set after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x...

# Deployment Keys (⚠️ VERY SENSITIVE)
PRIVATE_KEY=0x... # For contract deployment
DEPLOYER_PRIVATE_KEY=0x... # Main deployer wallet
```

#### CI/CD & Notifications (Priority 3)
```bash
# Docker Registry
DOCKERHUB_USERNAME=your-username
DOCKERHUB_TOKEN=dckr_pat_xxxxxxxxxxxxx

# Security Scanning
SNYK_TOKEN=xxxxxxxxxxxxx
CODECOV_TOKEN=xxxxxxxxxxxxx

# Notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
DISCORD_WEBHOOK=https://discord.com/api/webhooks/xxxxxxxxxxxxx
TELEGRAM_BOT_TOKEN=1234567890:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TELEGRAM_CHAT_ID=-1001234567890
```

### 2. Environment Variables (Repository Variables)

#### Public Configuration
```bash
NEXT_PUBLIC_APP_URL=https://omniversegeckos.com
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_WEB3_PROJECT_ID=xxxxxxxxxxxxx
```

## 🛠️ Service Setup Instructions

### Step 1: Vercel Setup
1. Go to [vercel.com](https://vercel.com) → Dashboard
2. Install Vercel CLI: `npm i -g vercel`
3. Login: `vercel login`
4. Link project: `vercel link`
5. Get tokens:
   ```bash
   # Get your tokens
   vercel whoami
   vercel teams ls
   vercel projects ls
   ```

### Step 2: Analytics Services

#### Google Analytics 4
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create property → Web → Enhanced measurement
3. Copy Measurement ID (G-XXXXXXXXXX)

#### PostHog
1. Go to [app.posthog.com](https://app.posthog.com)
2. Create project
3. Copy Project API Key (phc_xxxxx)

#### Sentry
1. Go to [sentry.io](https://sentry.io)
2. Create project → Next.js
3. Copy DSN and Auth Token

### Step 3: AI Services

#### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. API Keys → Create new secret key
3. Add billing method and set usage limits

#### Anthropic Claude
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Get API Key
3. Set usage limits

#### Hugging Face
1. Go to [huggingface.co](https://huggingface.co)
2. Settings → Access Tokens
3. Create token with read permissions

### Step 4: Blockchain Services

#### Infura
1. Go to [infura.io](https://infura.io)
2. Create project → Ethereum
3. Copy Project ID

#### Alchemy (Alternative)
1. Go to [alchemy.com](https://www.alchemy.com)
2. Create app → Ethereum
3. Copy API Key

#### Etherscan
1. Go to [etherscan.io](https://etherscan.io)
2. My Account → API Keys
3. Create free API key

### Step 5: Notifications

#### Slack
1. Go to your Slack workspace
2. Apps → Incoming Webhooks
3. Add to Channel → Copy Webhook URL

#### Discord
1. Server Settings → Integrations → Webhooks
2. Create Webhook → Copy URL

#### Telegram
1. Create bot: Message @BotFather → /newbot
2. Get bot token
3. Add bot to channel → Get chat ID

## 🔄 Automated Setup Script

Save this as `scripts/setup-secrets.sh`:

```bash
#!/bin/bash
# Omniverse Geckos - Secret Setup Helper

echo "🦎 Omniverse Geckos - GitHub Secrets Setup"
echo "=========================================="

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Install: https://cli.github.com/"
    exit 1
fi

# Authenticate with GitHub
gh auth status || gh auth login

echo "Setting up repository secrets..."

# Priority 1 Secrets
read -p "Enter Vercel Token: " VERCEL_TOKEN
gh secret set VERCEL_TOKEN -b"$VERCEL_TOKEN"

read -p "Enter Vercel Org ID: " VERCEL_ORG_ID  
gh secret set VERCEL_ORG_ID -b"$VERCEL_ORG_ID"

read -p "Enter Vercel Project ID: " VERCEL_PROJECT_ID
gh secret set VERCEL_PROJECT_ID -b"$VERCEL_PROJECT_ID"

# Generate NextAuth Secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
gh secret set NEXTAUTH_SECRET -b"$NEXTAUTH_SECRET"
echo "✅ Generated NextAuth Secret: $NEXTAUTH_SECRET"

# Analytics
read -p "Enter Google Analytics ID (G-XXXXXXXXXX): " GA4_ID
gh secret set NEXT_PUBLIC_GA4_ID -b"$GA4_ID"

read -p "Enter PostHog Key (phc_xxxxx): " POSTHOG_KEY
gh secret set NEXT_PUBLIC_POSTHOG_KEY -b"$POSTHOG_KEY"

# AI Services
read -p "Enter OpenAI API Key: " OPENAI_KEY
gh secret set NEXT_PUBLIC_OPENAI_API_KEY -b"$OPENAI_KEY"
gh secret set OPENAI_API_KEY -b"$OPENAI_KEY"

echo "✅ Basic secrets configured!"
echo "🔗 Complete setup at: https://github.com/$(gh repo view --json owner,name -q '.owner.login + \"/\" + .name')/settings/secrets/actions"
```

Make it executable:
```bash
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh
```

## 📋 Verification Checklist

After setting up secrets, verify:

- [ ] Vercel deployment works
- [ ] Analytics tracking active
- [ ] AI services responding  
- [ ] Error tracking working
- [ ] Build pipeline passing
- [ ] Notifications received

## 🚨 Security Best Practices

1. **Never commit secrets** to version control
2. **Use separate keys** for development/production
3. **Rotate secrets** every 90 days
4. **Set usage limits** on all API services
5. **Monitor usage** for unusual activity
6. **Use least privilege** principle

## ❓ Troubleshooting

### Common Issues

**Vercel Deployment Fails:**
```bash
# Check token validity
vercel whoami

# Verify project linking
vercel link --confirm
```

**AI Services Not Working:**
```bash
# Test OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Test Anthropic  
curl -H "x-api-key: $ANTHROPIC_API_KEY" https://api.anthropic.com/v1/messages
```

**Analytics Not Tracking:**
- Check browser dev tools for errors
- Verify GA4 measurement ID format
- Ensure proper domain configuration

### Getting Help

1. Check service status pages
2. Review API documentation
3. Check GitHub Actions logs
4. Test secrets in local environment first

---

**Next Steps:** After configuring secrets, proceed to activate services and monitoring.