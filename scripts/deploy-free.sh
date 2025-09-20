#!/bin/bash

# CommunityConnect Free Tier Deployment
# Deploy to communityconnect.com using AWS Free Tier
# Target cost: $0-15/month

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🚀 CommunityConnect Free Tier Deployment"
echo ""

# Check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v aws &> /dev/null; then
        missing_deps+=("aws-cli")
    fi
    
    if ! command -v terraform &> /dev/null; then
        missing_deps+=("terraform")
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        print_error "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Check AWS credentials
check_aws_credentials() {
    print_status "Checking AWS credentials..."
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        print_error "Please run 'aws configure' or set AWS environment variables"
        print_error "See DEPLOY_FREE.md for detailed instructions"
        exit 1
    fi
    
    local caller_identity=$(aws sts get-caller-identity)
    local account_id=$(echo $caller_identity | jq -r '.Account')
    
    print_success "AWS credentials validated"
    print_status "Account ID: $account_id"
}

# Check for Google Maps API key
check_google_maps_key() {
    print_status "Checking for Google Maps API key..."
    
    if [ -z "$GOOGLE_MAPS_API_KEY" ]; then
        print_error "Google Maps API key not found in environment variables."
        print_error "Please set GOOGLE_MAPS_API_KEY environment variable or add it to terraform.tfvars"
        exit 1
    fi
    
    print_success "Google Maps API key configured"
}

# Build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    # Get ECR repository URLs
    local api_repo_url=$(cd infra/terraform && terraform output -raw ecr_api_repository_url 2>/dev/null || echo "")
    local frontend_repo_url=$(cd infra/terraform && terraform output -raw ecr_frontend_repository_url 2>/dev/null || echo "")
    
    if [ -z "$api_repo_url" ] || [ -z "$frontend_repo_url" ]; then
        print_error "Could not get ECR repository URLs. Make sure Terraform has been applied first."
        exit 1
    fi
    
    # Login to ECR
    print_status "Logging in to ECR..."
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $api_repo_url
    
    # Build and push API image
    print_status "Building API image..."
    docker build -t community-resource-map-api:latest ./api
    docker tag community-resource-map-api:latest $api_repo_url:latest
    docker push $api_repo_url:latest
    
    # Build and push frontend image
    print_status "Building frontend image..."
    docker build -t community-resource-map-frontend:latest ./app
    docker tag community-resource-map-frontend:latest $frontend_repo_url:latest
    docker push $frontend_repo_url:latest
    
    print_success "Docker images built and pushed successfully"
}

# Run Terraform operations
run_terraform() {
    print_status "Running Terraform deployment..."
    
    cd infra/terraform
    
    # Initialize Terraform
    print_status "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    print_status "Planning Terraform deployment..."
    terraform plan -var-file="terraform.tfvars" -out=tfplan
    
    # Apply deployment
    print_status "Applying Terraform deployment..."
    terraform apply tfplan
    
    cd ../..
    
    print_success "Terraform deployment completed"
}

# Show deployment information
show_deployment_info() {
    print_status "Deployment completed successfully!"
    
    cd infra/terraform
    local app_url=$(terraform output -raw application_url 2>/dev/null || echo "Not available")
    local alb_dns=$(terraform output -raw alb_dns_name 2>/dev/null || echo "Not available")
    local nameservers=$(terraform output -raw nameservers 2>/dev/null || echo "Not available")
    cd ../..
    
    echo ""
    print_success "The CommunityConnect application is live!"
    print_success "Application URL: $app_url"
    print_success "Load Balancer DNS: $alb_dns"
    echo ""
    
    if [ "$nameservers" != "Not available" ]; then
        print_status "Domain Configuration Required:"
        echo "Update your domain's nameservers to:"
        echo "$nameservers"
    fi
    
    echo ""
    print_status "Debug the deployment"
}

# Main execution
main() {
    check_dependencies
    check_aws_credentials
    check_google_maps_key
    build_and_push_images
    run_terraform
    show_deployment_info
}

# Run main function
main
