#!/bin/bash
# Omniverse Geckos - Development Environment Setup Script

set -e

echo "🦎 Omniverse Geckos - Development Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js >= 20.0.0"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="20.0.0"

if ! npx semver $NODE_VERSION -r ">=$REQUIRED_VERSION" &> /dev/null; then
    print_error "Node.js version $NODE_VERSION is too old. Please upgrade to >= $REQUIRED_VERSION"
    exit 1
fi

print_status "Node.js $NODE_VERSION is compatible"

# Check if npm is installed and up to date
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_status "npm $NPM_VERSION detected"

# Install dependencies
print_info "Installing dependencies..."
if [ -f "pnpm-lock.yaml" ]; then
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm lock file found but pnpm is not installed"
        npm install -g pnpm
    fi
    pnpm install
elif [ -f "yarn.lock" ]; then
    if ! command -v yarn &> /dev/null; then
        print_warning "yarn lock file found but yarn is not installed"
        npm install -g yarn
    fi
    yarn install
else
    npm install
fi

print_status "Dependencies installed successfully"

# Setup environment file
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_status "Created .env.local from .env.example"
        print_warning "Please configure your environment variables in .env.local"
    else
        print_warning "No .env.example file found. You may need to create .env.local manually"
    fi
else
    print_info ".env.local already exists"
fi

# Setup git hooks with Husky
print_info "Setting up git hooks..."
if [ -d ".git" ]; then
    npx husky install
    print_status "Git hooks configured with Husky"
else
    print_warning "Not a git repository. Initialize git first: git init"
fi

# Generate Prisma client if schema exists
if [ -f "prisma/schema.prisma" ]; then
    print_info "Generating Prisma client..."
    npm run db:generate
    print_status "Prisma client generated"
fi

# Compile smart contracts if they exist
if [ -d "contracts" ] && [ -f "hardhat.config.js" ]; then
    print_info "Compiling smart contracts..."
    npm run blockchain:compile
    print_status "Smart contracts compiled"
fi

# Check if TypeScript is properly configured
print_info "Checking TypeScript configuration..."
if npm run type-check; then
    print_status "TypeScript configuration is valid"
else
    print_warning "TypeScript configuration has issues. Check the output above."
fi

# Run initial linting
print_info "Running initial lint check..."
if npm run lint; then
    print_status "Code passes linting rules"
else
    print_warning "Linting issues found. Run 'npm run lint:fix' to auto-fix some issues."
fi

# Success message
echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables in .env.local"
echo "2. Start the development server: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run test         - Run tests"
echo "  npm run lint         - Check code style"
echo "  npm run db:studio    - Open database admin"
echo ""
echo "For more information, see docs/DEVELOPMENT_GUIDE.md"
echo ""
print_status "Happy coding! 🦎✨"