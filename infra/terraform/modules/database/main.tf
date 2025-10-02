# Random password for database if not provided
resource "random_password" "db_password" {
  count   = var.database_password == "" ? 1 : 0
  length  = 16
  special = true
}

# Security group for RDS
resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.environment}-rds-"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# DB subnet group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  })
}

# RDS instance
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-db"

  engine         = "postgres"
  engine_version = "15.12"
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "crm"
  username = "crm"
  password = var.database_password != "" ? var.database_password : random_password.db_password[0].result

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = var.environment == "dev" ? true : false
  deletion_protection = var.environment == "prod" ? true : false

  performance_insights_enabled = false
  monitoring_interval         = 0
  monitoring_role_arn        = ""

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-db"
  })
}

# IAM role for RDS enhanced monitoring - disabled for cost optimization
# resource "aws_iam_role" "rds_enhanced_monitoring" {
#   name = "${var.project_name}-${var.environment}-rds-monitoring-role"
#
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Action = "sts:AssumeRole"
#         Effect = "Allow"
#         Principal = {
#           Service = "monitoring.rds.amazonaws.com"
#         }
#       }
#     ]
#   })
#
#   tags = var.tags
# }
#
# resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
#   role       = aws_iam_role.rds_enhanced_monitoring.name
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
# }
