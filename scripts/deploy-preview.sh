#!/bin/bash
# Quick deploy script for testing before production

set -e

echo "🦎 Omniverse Geckos - Quick Deploy Preview"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_status "Vercel CLI installed"
fi

# Login check
print_info "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please login:"
    vercel login
fi

print_status "Vercel authentication confirmed"

# Link project if not already linked
if [ ! -f ".vercel/project.json" ]; then
    print_info "Linking project to Vercel..."
    vercel link
    print_status "Project linked to Vercel"
fi

# Deploy preview
print_info "Deploying preview version..."
vercel --confirm

# Get deployment URL
DEPLOYMENT_URL=$(vercel --confirm 2>&1 | grep -o 'https://.*\.vercel\.app' | head -1)

if [ -n "$DEPLOYMENT_URL" ]; then
    print_status "Preview deployed successfully!"
    print_info "Preview URL: $DEPLOYMENT_URL"
    
    # Test the deployment
    print_info "Testing deployment..."
    
    if curl -f "$DEPLOYMENT_URL" > /dev/null 2>&1; then
        print_status "Site is responding correctly"
    else
        print_warning "Site might not be fully ready yet"
    fi
    
    # Test API health
    if curl -f "$DEPLOYMENT_URL/api/health" > /dev/null 2>&1; then
        print_status "API health endpoint working"
    else
        print_warning "API health endpoint not responding"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Preview Deployment Complete!${NC}"
    echo -e "${BLUE}Preview URL: $DEPLOYMENT_URL${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test the preview thoroughly"
    echo "2. If everything looks good, deploy to production:"
    echo "   vercel --prod"
    echo "3. Configure your custom domain in Vercel dashboard"
    echo ""
else
    print_warning "Could not extract deployment URL"
fi