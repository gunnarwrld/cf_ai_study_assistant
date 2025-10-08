#!/bin/bash

# AI Study Assistant - Development Helper Script
# This script provides common development tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🎓 AI Study Assistant - Development Helper"
echo "=========================================="
echo ""

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Menu
echo "Select an option:"
echo "1. Setup project (install dependencies)"
echo "2. Start local development"
echo "3. Test Worker locally"
echo "4. Deploy to production"
echo "5. View Worker logs"
echo "6. Check deployment status"
echo "7. Run tests"
echo "8. Clean install"
echo "0. Exit"
echo ""
read -p "Enter your choice [0-8]: " choice

case $choice in
    1)
        print_info "Installing dependencies..."
        npm install
        print_success "Dependencies installed!"
        ;;
    
    2)
        print_info "Starting local development server..."
        print_info "Worker will be available at: http://localhost:8787"
        print_info "Press Ctrl+C to stop"
        npm run dev
        ;;
    
    3)
        print_info "Testing Worker endpoints..."
        echo ""
        
        # Health check
        print_info "Testing health endpoint..."
        curl -s http://localhost:8787/health | json_pp
        echo ""
        
        # Chat test
        print_info "Testing chat endpoint..."
        curl -s -X POST http://localhost:8787/api/chat?sessionId=test123 \
            -H "Content-Type: application/json" \
            -d '{"message": "Hello, AI!"}' | json_pp
        echo ""
        
        print_success "Tests completed!"
        ;;
    
    4)
        print_info "Deploying to production..."
        
        # Check if wrangler is logged in
        if ! wrangler whoami > /dev/null 2>&1; then
            print_error "Not logged in to Cloudflare"
            print_info "Run: wrangler login"
            exit 1
        fi
        
        # Deploy worker
        print_info "Deploying Worker..."
        npm run deploy
        
        print_success "Deployment complete!"
        print_info "Don't forget to deploy the frontend with: npm run pages:deploy"
        ;;
    
    5)
        print_info "Viewing Worker logs (press Ctrl+C to stop)..."
        wrangler tail
        ;;
    
    6)
        print_info "Checking deployment status..."
        wrangler whoami
        print_success "Status check complete!"
        ;;
    
    7)
        print_info "Running tests..."
        npm test
        ;;
    
    8)
        print_info "Cleaning and reinstalling..."
        rm -rf node_modules package-lock.json
        npm install
        print_success "Clean install complete!"
        ;;
    
    0)
        print_info "Goodbye!"
        exit 0
        ;;
    
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
print_success "Done!"
