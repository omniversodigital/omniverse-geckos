# 🚀 Deployment Guide - Omniverse Geckos

## Overview

This guide covers the complete deployment process for Omniverse Geckos, including CI/CD pipelines, environment setup, and production deployment strategies.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Setup](#environment-setup)
- [Deployment Strategies](#deployment-strategies)
- [Monitoring & Analytics](#monitoring--analytics)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- Docker & Docker Compose
- Git
- GitHub account with required secrets configured

### Local Development

```bash
# Clone repository
git clone https://github.com/jean/omniverse-geckos.git
cd omniverse-geckos

# Copy environment variables
cp env.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

### Docker Development

```bash
# Start full development environment
docker-compose up -d

# Build and start application only
docker-compose up app
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Continuous Integration (`ci.yml`)

Triggered on push to `main`/`develop` and pull requests:

- **Code Quality**: ESLint, TypeScript check, Prettier
- **Testing**: Unit tests, integration tests with coverage
- **Build**: Application build with artifact upload
- **Security**: npm audit, Snyk security scan, dependency review
- **Performance**: Lighthouse CI performance testing
- **Smart Contracts**: Contract compilation and testing

#### 2. End-to-End Testing (`e2e.yml`)

Comprehensive E2E testing across multiple browsers:

- **Playwright**: Cross-browser testing (Chrome, Firefox, Safari)
- **Cypress**: Advanced E2E scenarios with recording
- **Visual Regression**: Percy and Chromatic visual testing
- **Accessibility**: axe-core and pa11y accessibility audits
- **Mobile**: Mobile viewport testing

#### 3. Deployment (`deploy.yml`)

Automated deployment to multiple platforms:

- **Vercel**: Primary hosting platform
- **Smart Contracts**: Ethereum mainnet deployment
- **IPFS**: Decentralized hosting backup
- **CDN**: Cache purging and warming

#### 4. Release Management (`release.yml`)

Semantic release automation:

- **Semantic Release**: Automated versioning based on commit messages
- **GitHub Releases**: Release notes generation
- **Docker Images**: Multi-platform container builds
- **NPM Publishing**: Package publication (when applicable)
- **Notifications**: Multi-channel release notifications

### Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature (minor version)
- `fix`: Bug fix (patch version)
- `docs`: Documentation changes
- `style`: Code formatting changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/modifications
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples:**
```bash
feat(auth): add OAuth2 integration
fix(api): resolve memory leak in user service
docs: update deployment guide
chore: update dependencies
```

## 🌍 Environment Setup

### Required Environment Variables

#### Application Core
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://omniversegeckos.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

#### Blockchain
```bash
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x... # For contract deployment
INFURA_API_KEY=your-infura-key
ETHERSCAN_API_KEY=your-etherscan-key
```

#### AI Services
```bash
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
HUGGINGFACE_API_KEY=hf_...
```

#### Analytics & Monitoring
```bash
NEXT_PUBLIC_GA4_ID=G-...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### GitHub Secrets

Configure these secrets in your GitHub repository:

#### Deployment
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `DOCKERHUB_USERNAME`: Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token

#### Security
- `SNYK_TOKEN`: Snyk security scanning
- `CODECOV_TOKEN`: Code coverage reporting

#### Notifications
- `SLACK_WEBHOOK`: Slack notifications
- `DISCORD_WEBHOOK`: Discord notifications
- `TELEGRAM_BOT_TOKEN`: Telegram notifications
- `TELEGRAM_CHAT_ID`: Telegram chat ID

## 🎯 Deployment Strategies

### 1. Vercel (Primary Platform)

**Automatic Deployments:**
- Production: `main` branch → https://omniversegeckos.com
- Preview: Pull requests → unique preview URLs

**Manual Deployment:**
```bash
npm run deploy:vercel
```

### 2. Docker Deployment

**Build Image:**
```bash
docker build -t omniverse-geckos .
docker tag omniverse-geckos your-registry/omniverse-geckos:latest
docker push your-registry/omniverse-geckos:latest
```

**Docker Compose (Production):**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. IPFS Deployment

Decentralized backup hosting:

```bash
# Build static export
npm run build && npm run export

# Deploy to IPFS via Pinata
ipfs add -r ./out
```

### 4. Smart Contract Deployment

**Testnet (Goerli):**
```bash
cd contracts
npx hardhat run scripts/deploy.js --network goerli
```

**Mainnet:**
```bash
npx hardhat run scripts/deploy.js --network mainnet
npx hardhat verify --network mainnet CONTRACT_ADDRESS
```

## 📊 Monitoring & Analytics

### Application Monitoring

- **Vercel Analytics**: Performance and usage metrics
- **Sentry**: Error tracking and performance monitoring
- **PostHog**: User behavior analytics
- **Google Analytics**: Traffic and conversion tracking

### Infrastructure Monitoring

- **Uptime Monitoring**: Health check endpoints
- **Performance Metrics**: Core Web Vitals tracking
- **Security Monitoring**: Vulnerability scanning
- **Cost Monitoring**: Resource usage tracking

### Smart Contract Monitoring

- **Transaction Monitoring**: On-chain activity tracking
- **Gas Usage**: Cost optimization tracking
- **Security**: Smart contract vulnerability monitoring

## 🔒 Security

### Code Security

- **Static Analysis**: ESLint security rules
- **Dependency Scanning**: Snyk vulnerability detection
- **Secret Scanning**: GitHub secret detection
- **License Compliance**: Dependency license checking

### Infrastructure Security

- **HTTPS**: SSL/TLS encryption everywhere
- **Headers**: Security headers (CSP, HSTS, etc.)
- **Rate Limiting**: API rate limiting
- **Input Validation**: Server-side validation

### Smart Contract Security

- **Audited Contracts**: OpenZeppelin standards
- **Formal Verification**: Mathematical proof of correctness
- **Bug Bounty**: Community security review
- **Multi-sig Wallets**: Secure key management

## 🚨 Troubleshooting

### Common Issues

#### Deployment Failures

**Vercel Build Errors:**
```bash
# Check build logs
vercel logs

# Local build test
npm run build
```

**Docker Build Issues:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild with no cache
docker build --no-cache -t omniverse-geckos .
```

#### Database Issues

**Prisma Sync Issues:**
```bash
# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate

# Apply migrations
npx prisma migrate deploy
```

#### Smart Contract Issues

**Deployment Failures:**
```bash
# Check network configuration
npx hardhat network

# Verify gas settings
npx hardhat run scripts/gas-estimate.js

# Test deployment on local network
npx hardhat node
```

### Performance Issues

**Slow Build Times:**
```bash
# Enable Next.js speed insights
npm install @vercel/speed-insights

# Use Turbo for faster builds
npm run dev -- --turbo
```

**Large Bundle Size:**
```bash
# Analyze bundle
npm run analyze

# Check for unused dependencies
npx depcheck
```

### Debugging Tools

**Local Development:**
```bash
# Enable debug mode
DEBUG=* npm run dev

# Check logs
docker-compose logs -f app

# Database inspection
npm run db:studio
```

**Production:**
```bash
# Check Vercel function logs
vercel logs --follow

# Monitor Sentry for errors
# Check PostHog for user issues
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Smart Contract Security](https://consensys.github.io/smart-contract-best-practices/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🤝 Support

For deployment issues:
1. Check the troubleshooting guide above
2. Review GitHub Actions logs
3. Check monitoring dashboards
4. Contact the development team

---

**Built with ❤️ by the Omniverse Geckos Team**