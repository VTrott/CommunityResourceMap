module "ecs_cluster" {
  source = "./modules/ecs-cluster"

  project_name = var.project_name
  environment  = var.environment

  tags = local.common_tags
}

module "api_service" {
  source = "./modules/ecs-service"

  project_name = var.project_name
  environment  = var.environment
  service_name = "api"

  cluster_id   = module.ecs_cluster.cluster_id
  cluster_name = module.ecs_cluster.cluster_id
  vpc_id       = module.vpc.vpc_id

  private_subnet_ids = module.vpc.private_subnets
  security_group_ids = [module.alb.ecs_tasks_security_group_id, module.database.db_security_group_id]

  target_group_arn = module.alb.api_target_group_arn
  container_port   = 8080

  cpu    = var.api_cpu
  memory = var.api_memory

  container_image = module.ecr.api_repository_url
  container_name  = "api"

  environment_variables = {
    DB_HOST     = module.database.db_instance_endpoint
    DB_PORT     = module.database.db_instance_port
    DB_NAME     = module.database.db_instance_name
    DB_USER     = module.database.db_instance_username
    DB_PASSWORD = var.database_password
    GOOGLE_MAPS_API_KEY = var.google_maps_api_key
  }

  min_capacity = var.min_capacity
  max_capacity = var.max_capacity

  tags = local.common_tags
}

module "frontend_service" {
  source = "./modules/ecs-service"

  project_name = var.project_name
  environment  = var.environment
  service_name = "frontend"

  cluster_id   = module.ecs_cluster.cluster_id
  cluster_name = module.ecs_cluster.cluster_id
  vpc_id       = module.vpc.vpc_id

  private_subnet_ids = module.vpc.private_subnets
  security_group_ids = [module.alb.ecs_tasks_security_group_id]

  target_group_arn = module.alb.frontend_target_group_arn
  container_port   = 80

  cpu    = var.frontend_cpu
  memory = var.frontend_memory

  container_image = module.ecr.frontend_repository_url
  container_name  = "frontend"

  min_capacity = var.min_capacity
  max_capacity = var.max_capacity

  tags = local.common_tags
}
