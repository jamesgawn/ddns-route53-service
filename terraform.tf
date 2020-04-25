variable "profile" {
  type    = string
  default = "jg"
}

variable "region" {
  type    = string
  default = "eu-west-2"
}

variable "iam-username" {
  type    = string
  default = "ddns-service-deployer"
}

variable "domain" {
  type = string
}

variable "service-name" {
  type = string
  default = "ddns-service"
}

variable "service-docker-name" {
  type = string
  default = "ddns-route53-service"
}

variable "service-docker-image" {
  type = string
  default = "jamesgawn/ddns-route53-service"
}

provider "aws" {
  region  = var.region
  profile = var.profile
}

terraform {
  backend "s3" {
    bucket  = "ana-terraform-state-prod"
    key     = "ddns-service/terraform.tfstate"
    region  = "eu-west-2"
    profile = "jg"
  }
}

data "aws_iam_role" "ec2instancerole" {
  name = "EC2SystemManagerRole"
}

data "aws_ami" "amazon-linux-2" {
  most_recent = true

  filter {
    name   = "owner-alias"
    values = ["amazon"]
  }

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm*"]
  }

  owners = ["137112412989"]
}

data "template_file" "server-cloud-init" {
  template = file("${path.module}/cloudinit.cfg")
  vars = {
    DOMAIN = var.domain,
    SERVICE_NAME = var.service-name,
    DOCKER_IMAGE = var.service-docker-image
  }
}

data "aws_vpc" "selected" {
  id = "vpc-73cf331a"
}

resource "aws_security_group" "server_security_group" {
  name        = "${var.service-name}-server"
  description = "Allow 80 inbound traffic"
  vpc_id      = data.aws_vpc.selected.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    ipv6_cidr_blocks = ["::/0"]
  }
}

data "aws_subnet" "subnet" {
  id = "subnet-d19878aa"
}

resource "aws_instance" "server" {
  ami                  = data.aws_ami.amazon-linux-2.id
  instance_type        = "t3.nano"
  iam_instance_profile = data.aws_iam_role.ec2instancerole.name

  user_data = data.template_file.server-cloud-init.rendered

  subnet_id              = data.aws_subnet.subnet.id
  vpc_security_group_ids = [aws_security_group.server_security_group.id]

  tags = {
    Name = var.service-name
  }
}

resource "aws_ssm_document" "deploy-update" {
  name            = "${var.service-name}-upgrade"
  document_type   = "Command"
  document_format = "YAML"

  content = <<DOC
  schemaVersion: '2.2'
  description: Update the ${var.service-name} to the latest docker image
  parameters: {}
  mainSteps:
  - action: aws:runShellScript
    name: updateDockerContainer
    inputs:
      runCommand:
      - export AWS_DEFAULT_REGION=$(curl -s http://169.254.169.254/latest/dynamic/instance-identity/document | grep region | cut -d\" -f4)
      - sudo docker stop ${var.service-name}
      - sudo docker rm ${var.service-name}
      - sudo docker pull ${var.service-docker-image}
      - sudo docker run -p 80:3000 --log-driver=awslogs --log-opt=awslogs-group=${var.service-name} --log-opt=awslogs-create-group=true --name ${var.service-name} --restart always -detach ${var.service-docker-image}

DOC

}

resource "aws_iam_policy" "deploy-access" {
  name        = "${var.service-name}-api-deploy-access"
  path        = "/"
  description = "A policy to permit redeploying the latest version of the ${var.service-name} to the EC2 instance"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:SendCommand"
            ],
            "Resource": [
                "arn:aws:ssm:*:*:document/${var.service-name}-upgrade"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "ssm:SendCommand"
            ],
            "Resource": [
                "arn:aws:ec2:*:*:instance/*"
            ],
            "Condition": {
                "StringLike": {
                    "ssm:resourceTag/Name": [
                        "${var.service-name}"
                    ]
                }
            }
        }
    ]
}
EOF

}

resource "aws_iam_user_policy_attachment" "deploy-access-attachment" {
  user       = var.iam-username
  policy_arn = aws_iam_policy.deploy-access.arn
}

data "aws_route53_zone" "domain-root" {
  name = var.domain
}

resource "aws_route53_record" "api-dns-a-record" {
  name    = "ddns.${var.domain}"
  type    = "A"
  zone_id = data.aws_route53_zone.domain-root.zone_id
  ttl     = "600"
  records = [aws_instance.server.public_ip]
}

resource "aws_route53_record" "api-dns-aaaa-record" {
  name    = "ddns.${var.domain}"
  type    = "AAAA"
  zone_id = data.aws_route53_zone.domain-root.zone_id
  ttl     = "600"
  records = aws_instance.server.ipv6_addresses
}

