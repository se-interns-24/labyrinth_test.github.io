provider "aws" {
  region = var.region
}

resource "aws_iam_role" "dynamodb_access" {
  name = "dynamodb-access-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "dynamodb_access_policy" {
  name = "dynamodb-access-policy"
  role = aws_iam_role.dynamodb_access.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["dynamodb:GetItem", "dynamodb:PutItem"]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_instance_profile" "dynamodb_access_profile" {
  name = "dynamodb-access-profile"
  role = aws_iam_role.dynamodb_access.name
}

resource "aws_security_group" "allow_http" {
  name        = "allow_http"
  description = "Allow HTTP traffic"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh"
  description = "Allow SSH traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ip]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "web" {
  ami                         = var.ami
  instance_type               = var.instance_type
  key_name                    = var.key_name
  iam_instance_profile        = aws_iam_instance_profile.dynamodb_access_profile.name
  security_groups             = [aws_security_group.allow_http.name, aws_security_group.allow_ssh.name]

  tags = {
    Name = "LabyrinthGameWebServer"
  }

  user_data = <<-EOF
              #!/bin/bash
              apt update -y
              apt install -y nodejs npm
              npm install -g pm2
              git clone https://your-repo-url.git
              cd your-repo-directory
              npm install
              pm2 start server.js
              pm2 startup systemd
              pm2 save
              EOF
}

resource "aws_dynamodb_table" "users" {
  name         = "Users"
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "username"
    type = "S"
  }

  hash_key = "username"
}
