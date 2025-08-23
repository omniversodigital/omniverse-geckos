# 🦎 Omniverse Geckos - Development Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 20.0.0
- **npm** >= 10.0.0 (or pnpm/yarn)
- **Git** >= 2.28.0
- **Docker** (optional, for containerized development)

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd omniverse-geckos

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Initialize database (if using Prisma)
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

## 📋 Git Workflow & Hooks

This project uses **Husky** for automated git hooks to maintain code quality.

### Git Hooks Overview

#### Pre-commit Hook
Runs automatically before each commit:
- ✅ **Lint-staged** - Lints and formats only staged files
- ✅ **TypeScript** - Type checking
- ❌ **Console statements** - Blocks console.log in production files
- ⚠️ **TODO/FIXME** - Warns about TODO comments in critical files

#### Commit Message Hook
Validates commit messages using **Conventional Commits**:
```bash
# Valid formats:
feat(auth): add OAuth2 integration
fix(api): resolve memory leak in user service
docs: update README with installation steps
feat!: remove deprecated API endpoints

# Invalid formats:
Add new feature    # Missing type
FIX: bug fix      # Wrong capitalization
fix bug           # Missing description
```

#### Pre-push Hook
Runs before pushing to remote:
- 🚫 **Branch protection** - Prevents direct push to main/master
- 🧪 **Tests** - Runs test suite
- 🔍 **Type checking** - Full TypeScript validation
- 🎨 **Linting** - Code style validation
- 🏗️ **Build** - Ensures code compiles

#### Post-checkout Hook
Runs after switching branches:
- 📦 **Dependencies** - Auto-installs when package files change
- 📍 **Branch info** - Shows current branch and recent commits

#### Post-merge Hook
Runs after merging branches:
- 📦 **Dependencies** - Auto-installs after merge
- 🧹 **Cache cleanup** - Cleans Next.js and node_modules cache

### Bypassing Hooks (Use with Caution)
```bash
# Skip pre-commit hooks (not recommended)
git commit --no-verify -m "emergency fix"

# Skip pre-push hooks
git push --no-verify
```

## 🎯 Conventional Commits Guide

### Commit Types
- **feat**: Nueva característica
- **fix**: Corrección de bug
- **docs**: Documentación
- **style**: Cambios de formato (sin cambios de código)
- **refactor**: Refactoring de código
- **test**: Agregar/modificar tests
- **chore**: Tareas de mantenimiento
- **ci**: Cambios en CI/CD
- **perf**: Mejoras de performance
- **build**: Cambios en build system

### Commit Scope Examples
- `feat(auth): add OAuth2 integration`
- `fix(game): resolve collision detection bug`
- `docs(api): update endpoint documentation`
- `perf(nft): optimize image loading`
- `ci(deploy): add staging environment`

### Interactive Commits (Commitizen)
```bash
# Use interactive commit helper
npm run commit

# Or globally install commitizen
npm install -g commitizen
git cz
```

## 🧪 Testing Strategy

### Unit Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

### E2E Tests
```bash
# Run Playwright tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Specific test file
npx playwright test game.spec.ts
```

### Test Structure
```
tests/
├── unit/           # Unit tests (*.test.ts)
├── integration/    # Integration tests
├── e2e/           # End-to-end tests (*.spec.ts)
└── fixtures/      # Test data and mocks
```

## 🎨 Code Style & Formatting

### Automated Formatting
All files are automatically formatted on commit via lint-staged:
- **JavaScript/TypeScript**: ESLint + Prettier
- **JSON/Markdown/YAML**: Prettier
- **CSS/SCSS**: Prettier
- **Package.json**: Sorted automatically

### Manual Commands
```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

### VS Code Integration
Recommended extensions (see `.vscode/extensions.json`):
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- GitLens

## 🔧 Development Scripts

### Core Development
```bash
npm run dev          # Start development server with Turbo
npm run build        # Production build
npm run start        # Start production server
npm run preview      # Build + Start (local production test)
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
npm run type-check   # TypeScript validation
```

### Database (Prisma)
```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create and apply migration
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with test data
npm run db:reset     # Reset database
```

### Blockchain Development
```bash
npm run blockchain:compile  # Compile smart contracts
npm run blockchain:deploy   # Deploy contracts
npm run blockchain:test     # Test contracts
npm run blockchain:node     # Start local blockchain
```

### Game Development
```bash
npm run game:dev     # Start game + web server
npm run game:server  # Start game server only
npm run game:build   # Build game assets
```

## 🐳 Docker Development

### Local Development
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Docker Compose (full stack)
npm run docker:compose
```

### Docker Commands
```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Production build
docker-compose -f docker-compose.prod.yml up

# Rebuild with no cache
docker-compose build --no-cache
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to production
npm run deploy:vercel

# Or using Vercel CLI
vercel --prod
```

### Manual Deployment
```bash
# Build optimized production
npm run build

# Analyze bundle size
npm run analyze

# Check size limits
npm run size
```

## 🔍 Debugging

### Next.js Debugging
```bash
# Debug mode
NODE_OPTIONS='--inspect' npm run dev

# Verbose logging
DEBUG=* npm run dev
```

### Blockchain Debugging
```bash
# Debug smart contract tests
npm run blockchain:test -- --verbose

# Fork mainnet for testing
npm run blockchain:node -- --fork https://mainnet.infura.io/v3/YOUR_KEY
```

### Game Engine Debugging
```bash
# Debug game server
DEBUG=game:* npm run game:server

# Physics debugging
PHYSICS_DEBUG=true npm run game:dev
```

## 🔧 Environment Configuration

### Environment Files
```
.env.local          # Local development (ignored by git)
.env.example        # Template file (committed)
.env.test           # Testing environment
.env.production     # Production overrides
```

### Required Environment Variables
See `.env.example` for complete list:
- Database: `DATABASE_URL`
- AI Services: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- Blockchain: `INFURA_PROJECT_ID`, `PRIVATE_KEY`
- Analytics: `GA4_ID`, `POSTHOG_KEY`

## 🐛 Troubleshooting

### Common Issues

#### Git Hooks Not Working
```bash
# Reinstall hooks
npx husky install
chmod +x .husky/*
```

#### TypeScript Errors
```bash
# Clear Next.js cache
rm -rf .next

# Regenerate types
npm run db:generate
npm run type-check
```

#### Dependency Issues
```bash
# Clear all caches and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

#### Build Failures
```bash
# Check for console statements
grep -r "console\." src/

# Verify all imports
npm run type-check

# Check bundle size
npm run analyze
```

### Getting Help

1. **Check the logs**: Always start with error messages
2. **Search issues**: Look for similar problems in the repo
3. **Test locally**: Try reproducing in a fresh clone
4. **Check dependencies**: Ensure versions match requirements
5. **Clear caches**: When in doubt, clean everything

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Prisma Guide](https://www.prisma.io/docs/)
- [Hardhat Documentation](https://hardhat.org/docs)

---

**Happy coding! 🦎✨**