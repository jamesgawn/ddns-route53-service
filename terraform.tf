variable "profile" {
  type    = string
  default = "jg"
}

variable "region" {
  type    = string
  default = "eu-west-2"
}

variable "parent-domain" {
  type = string
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

data "aws_route53_zone" "domain-root" {
  name = var.parent-domain
}

resource "aws_iam_user" "user" {
  name = "ddns-service-update-user"
}

resource "aws_iam_user_policy" "user_access_policy" {
  name = "ddns-service-update-policy"
  user = aws_iam_user.user.name

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "route53:ChangeResourceRecordSets",
            "Resource": "arn:aws:route53:::hostedzone/${data.aws_route53_zone.domain-root.id}"
        },
        {
            "Effect": "Allow",
            "Action": "route53:ListHostedZones",
            "Resource": "*"
        }
    ]
}
EOF
}
