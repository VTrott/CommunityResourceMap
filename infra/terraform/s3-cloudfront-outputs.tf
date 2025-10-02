# S3 and CloudFront outputs - temporarily disabled due to IAM permissions
# output "frontend_s3_bucket_name" {
#   description = "Name of the S3 bucket for frontend static hosting"
#   value       = aws_s3_bucket.frontend.bucket
# }
#
# output "frontend_s3_bucket_domain_name" {
#   description = "Domain name of the S3 bucket for frontend"
#   value       = aws_s3_bucket.frontend.bucket_domain_name
# }
#
# output "frontend_cloudfront_domain_name" {
#   description = "Domain name of the CloudFront distribution for frontend"
#   value       = aws_cloudfront_distribution.frontend.domain_name
# }
#
# output "frontend_cloudfront_hosted_zone_id" {
#   description = "Hosted zone ID of the CloudFront distribution for frontend"
#   value       = aws_cloudfront_distribution.frontend.hosted_zone_id
# }
#
# output "api_cloudfront_domain_name" {
#   description = "Domain name of the CloudFront distribution for API"
#   value       = aws_cloudfront_distribution.api.domain_name
# }
#
# output "api_cloudfront_hosted_zone_id" {
#   description = "Hosted zone ID of the CloudFront distribution for API"
#   value       = aws_cloudfront_distribution.api.hosted_zone_id
# }
