module "database" {
  source = "./modules/database"

  project_name = var.project_name
  environment  = var.environment

  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnets
  availability_zones  = slice(data.aws_availability_zones.available.names, 0, var.availability_zones)

  instance_class      = var.database_instance_class
  allocated_storage   = var.database_allocated_storage
  max_allocated_storage = var.database_max_allocated_storage
  database_password   = var.database_password

  tags = local.common_tags
}
