module "alb" {
  source = "./modules/alb"

  project_name = var.project_name
  environment  = var.environment

  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnets
  private_subnet_ids = module.vpc.private_subnets

  domain_name     = var.domain_name
  certificate_arn = var.domain_name != "" ? aws_acm_certificate.main[0].arn : null

  tags = local.common_tags
}
