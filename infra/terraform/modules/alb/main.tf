# Security group for ALB
resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-${var.environment}-alb-"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "prod" ? true : false

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-alb"
  })
}

# Target group for API
resource "aws_lb_target_group" "api" {
  name        = "crm-${var.environment}-api-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/actuator/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-api-tg"
  })
}

# Frontend is now served from S3 + CloudFront, no target group needed
# resource "aws_lb_target_group" "frontend" {
#   name        = "crm-${var.environment}-frontend-tg"
#   port        = 80
#   protocol    = "HTTP"
#   vpc_id      = var.vpc_id
#   target_type = "ip"
#
#   health_check {
#     enabled             = true
#     healthy_threshold   = 2
#     unhealthy_threshold = 2
#     timeout             = 5
#     interval            = 30
#     path                = "/"
#     matcher             = "200"
#     port                = "traffic-port"
#     protocol            = "HTTP"
#   }
#
#   tags = merge(var.tags, {
#     Name = "${var.project_name}-${var.environment}-frontend-tg"
#   })
# }

# HTTP listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = var.certificate_arn != "" ? "redirect" : "forward"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
    dynamic "forward" {
      for_each = var.certificate_arn == "" ? [1] : []
      content {
        target_group {
          arn = aws_lb_target_group.api.arn
        }
      }
    }
  }
}

# HTTPS listener (if certificate is provided)
resource "aws_lb_listener" "https" {
  count             = var.certificate_arn != null && var.certificate_arn != "" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# API listener rule
resource "aws_lb_listener_rule" "api" {
  listener_arn = var.certificate_arn != null && var.certificate_arn != "" ? aws_lb_listener.https[0].arn : aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = ["/api/*", "/actuator/*"]
    }
  }
}

# Security group for ECS tasks
resource "aws_security_group" "ecs_tasks" {
  name_prefix = "${var.project_name}-${var.environment}-ecs-tasks-"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-ecs-tasks-sg"
  })

  lifecycle {
    create_before_destroy = true
  }
}
