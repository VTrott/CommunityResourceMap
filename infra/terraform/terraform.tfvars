# Free Tier Configuration for CommunityConnect
# Optimized for employer showcase - $0-15/month

# AWS Configuration
aws_region = "us-east-1"

# Project Configuration
project_name = "community-resource-map"
environment  = "free"

# Network Configuration
vpc_cidr            = "10.0.0.0/16"
availability_zones  = 2  # Need 2 AZs for ALB and RDS

# Database Configuration - Free Tier eligible
database_instance_class      = "db.t3.micro"  # Free Tier eligible
database_allocated_storage   = 20             # Free Tier: 20GB
database_max_allocated_storage = 20           # No auto-scaling
database_password = "72qZBSZd8MNEX2r1DGbU0koaS"

# Application Configuration - Minimal for free tier
api_cpu     = 256   # 0.25 vCPU (Free Tier: 750 hours/month)
api_memory  = 512   # 512 MB RAM
frontend_cpu    = 256   # 0.25 vCPU
frontend_memory = 512   # 512 MB RAM

# Scaling Configuration - Single instance
min_capacity = 1
max_capacity = 1  # No auto-scaling

# External Services
google_maps_api_key = "AIzaSyD_jfgSWFqyfvoKB_f2uNBpeV_pYyDuS9Y"

# Domain Configuration - Use your actual domain
domain_name     = "communitiesresources.com"
certificate_arn = ""  # Will be created automatically
