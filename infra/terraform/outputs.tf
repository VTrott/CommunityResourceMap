output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnets
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnets
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = module.alb.alb_zone_id
}

output "api_service_name" {
  description = "Name of the API ECS service"
  value       = module.api_service.service_name
}

# Frontend is now served from S3 + CloudFront
# output "frontend_service_name" {
#   description = "Name of the frontend ECS service"
#   value       = module.frontend_service.service_name
# }

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = module.database.db_instance_endpoint
}

output "database_name" {
  description = "Database name"
  value       = module.database.db_instance_name
}

output "ecr_api_repository_url" {
  description = "URL of the API ECR repository"
  value       = module.ecr.api_repository_url
}

output "ecr_frontend_repository_url" {
  description = "URL of the frontend ECR repository"
  value       = module.ecr.frontend_repository_url
}

output "application_url" {
  description = "URL of the application (via ALB for now)"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "http://${module.alb.alb_dns_name}"
}

# CloudFront URLs temporarily disabled due to IAM permissions
# output "api_url" {
#   description = "URL of the API (via CloudFront)"
#   value       = "https://${aws_cloudfront_distribution.api.domain_name}"
# }
#
# output "frontend_cloudfront_url" {
#   description = "CloudFront URL for frontend"
#   value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
# }
