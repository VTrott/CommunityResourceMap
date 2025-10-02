# S3 bucket for frontend static hosting - temporarily disabled due to permissions
# resource "aws_s3_bucket" "frontend" {
#   bucket = "${var.project_name}-${var.environment}-frontend-${random_string.bucket_suffix.result}"
#
#   tags = local.common_tags
# }
#
# # Random string for unique bucket name
# resource "random_string" "bucket_suffix" {
#   length  = 8
#   special = false
#   upper   = false
# }

# S3 and CloudFront resources temporarily disabled due to IAM permissions
# Will need to add S3 and CloudFront permissions to the deployer user
# 
# # S3 bucket versioning
# resource "aws_s3_bucket_versioning" "frontend" {
#   bucket = aws_s3_bucket.frontend.id
#   versioning_configuration {
#     status = "Enabled"
#   }
# }
#
# # S3 bucket public access block
# resource "aws_s3_bucket_public_access_block" "frontend" {
#   bucket = aws_s3_bucket.frontend.id
#
#   block_public_acls       = false
#   block_public_policy     = false
#   ignore_public_acls      = false
#   restrict_public_buckets = false
# }
#
# # S3 bucket policy for CloudFront access
# resource "aws_s3_bucket_policy" "frontend" {
#   bucket = aws_s3_bucket.frontend.id
#
#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Sid       = "AllowCloudFrontServicePrincipal"
#         Effect    = "Allow"
#         Principal = {
#           Service = "cloudfront.amazonaws.com"
#         }
#         Action   = "s3:GetObject"
#         Resource = "${aws_s3_bucket.frontend.arn}/*"
#         Condition = {
#           StringEquals = {
#             "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
#           }
#         }
#       }
#     ]
#   })
#
#   depends_on = [aws_cloudfront_distribution.frontend]
# }
#
# # CloudFront origin access control
# resource "aws_cloudfront_origin_access_control" "frontend" {
#   name                              = "${var.project_name}-${var.environment}-frontend-oac"
#   description                       = "OAC for frontend S3 bucket"
#   origin_access_control_origin_type = "s3"
#   signing_behavior                  = "always"
#   signing_protocol                  = "sigv4"
# }
#
# # CloudFront distribution
# resource "aws_cloudfront_distribution" "frontend" {
#   origin {
#     domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
#     origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
#     origin_id                = "S3-${aws_s3_bucket.frontend.bucket}"
#   }
#
#   enabled             = true
#   is_ipv6_enabled     = true
#   default_root_object = "index.html"
#
#   # Custom domain configuration (if provided)
#   aliases = var.domain_name != "" ? [var.domain_name] : []
#
#   # SSL certificate (if domain is provided)
#   viewer_certificate {
#     acm_certificate_arn      = var.certificate_arn != "" ? var.certificate_arn : null
#     ssl_support_method       = var.certificate_arn != "" ? "sni-only" : "sni-only"
#     minimum_protocol_version = "TLSv1.2_2021"
#   }
#
#   default_cache_behavior {
#     allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
#     cached_methods         = ["GET", "HEAD"]
#     target_origin_id       = "S3-${aws_s3_bucket.frontend.bucket}"
#     compress               = true
#     viewer_protocol_policy = "redirect-to-https"
#
#     forwarded_values {
#       query_string = false
#       cookies {
#         forward = "none"
#       }
#     }
#
#     min_ttl     = 0
#     default_ttl = 3600
#     max_ttl     = 86400
#   }
#
#   # Cache behavior for API calls (proxy to ALB)
#   ordered_cache_behavior {
#     path_pattern     = "/api/*"
#     allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
#     cached_methods   = ["GET", "HEAD", "OPTIONS"]
#     target_origin_id = "ALB-${module.alb.alb_dns_name}"
#
#     forwarded_values {
#       query_string = true
#       headers      = ["Authorization", "Content-Type"]
#       cookies {
#         forward = "all"
#       }
#     }
#
#     viewer_protocol_policy = "redirect-to-https"
#     min_ttl               = 0
#     default_ttl           = 0
#     max_ttl               = 0
#   }
#
#   # Custom error pages
#   custom_error_response {
#     error_code         = 404
#     response_code      = 200
#     response_page_path = "/index.html"
#   }
#
#   custom_error_response {
#     error_code         = 403
#     response_code      = 200
#     response_page_path = "/index.html"
#   }
#
#   restrictions {
#     geo_restriction {
#       restriction_type = "none"
#     }
#   }
#
#   tags = local.common_tags
# }
#
# # CloudFront distribution for API (separate from frontend)
# resource "aws_cloudfront_distribution" "api" {
#   origin {
#     domain_name = module.alb.alb_dns_name
#     origin_id   = "ALB-${module.alb.alb_dns_name}"
#
#     custom_origin_config {
#       http_port              = 80
#       https_port             = 443
#       origin_protocol_policy = "https-only"
#       origin_ssl_protocols   = ["TLSv1.2"]
#     }
#   }
#
#   enabled         = true
#   is_ipv6_enabled = true
#
#   default_cache_behavior {
#     allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
#     cached_methods   = ["GET", "HEAD", "OPTIONS"]
#     target_origin_id = "ALB-${module.alb.alb_dns_name}"
#
#     forwarded_values {
#       query_string = true
#       headers      = ["Authorization", "Content-Type"]
#       cookies {
#         forward = "all"
#       }
#     }
#
#     viewer_protocol_policy = "redirect-to-https"
#     min_ttl               = 0
#     default_ttl           = 0
#     max_ttl               = 0
#   }
#
#   restrictions {
#     geo_restriction {
#       restriction_type = "none"
#     }
#   }
#
#   viewer_certificate {
#     cloudfront_default_certificate = true
#   }
#
#   tags = local.common_tags
# }
