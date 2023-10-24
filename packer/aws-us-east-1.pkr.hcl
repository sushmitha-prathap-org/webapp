packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.0.0"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-06db4d78cb1d3bbf9"
}

variable "ssh_username" {
  type    = string
  default = "admin"
}

variable "subnet_id" {
  type    = string
  default = "subnet-0eecd3b44f8a89f1f"
}

source "amazon-ebs" "my-ami" {
  ami_name        = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  region          = var.aws_region
  ami_description = "AMI for CSYE 6225"

  ami_regions = ["us-east-1"]

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  instance_type = "t2.micro" # Adjust as needed
  source_ami    = var.source_ami
  ssh_username  = var.ssh_username
  subnet_id     = var.subnet_id
}

build {
  name    = "build-ami-csye-6225"
  sources = ["source.amazon-ebs.my-ami"]

  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1"
    ]

    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y nodejs npm",
      "sudo apt-get install -y mariadb-server",
      "sudo mysql -e \"CREATE DATABASE assignment3;\"",
      "sudo mysql -u root --skip-password << EOF",
      "ALTER USER 'root'@'localhost' IDENTIFIED BY '1998@Pupss';",
      "FLUSH PRIVILEGES;",
      "EOF",
      "sudo apt-get install unzip -y",
      "sudo apt-get clean"
    ]
  }
}
