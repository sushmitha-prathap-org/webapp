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
  default = "ami-058bd2d568351da34"
}

variable "ssh_username" {
  type    = string
  default = "admin"
}

variable "subnet_id" {
  type    = string
  default = "subnet-02d2de33660afa5ed"
}

source "amazon-ebs" "my-ami" {
  ami_name        = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  region          = var.aws_region
  ami_description = "AMI for CSYE 6225"
  ami_users       = ["924749429410", "903587831963"]

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
      "sudo apt-get install unzip -y",
      "sudo mkdir /opt/demo",
    ]
  }

  provisioner "file" {
    source      = "webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    inline = [
      "sudo mv /tmp/webapp.zip /opt/demo/webapp.zip",
      "sudo ls -l /opt/demo/",
      "sudo unzip /opt/demo/webapp.zip -d /opt/demo/",
      "sudo ls /opt/demo",
      "cd /opt/demo/app",
      "sudo npm install",
      "sudo wget https://amazoncloudwatch-agent.s3.amazonaws.com/debian/amd64/latest/amazon-cloudwatch-agent.deb",
      "sudo dpkg -i -E ./amazon-cloudwatch-agent.deb",
    ]
  }

  provisioner "file" {
    source      = "node-run.service"
    destination = "/tmp/node-run.service"
  }

  provisioner "file" {
    source      = "config.json"
    destination = "/tmp/config.json"
  }

  provisioner "shell" {
    inline = [
      "sudo groupadd nodeuser",
      "sudo useradd -s /bin/false -g nodeuser -d /opt/nodeuser -m nodeuser",
      "sudo chown -R nodeuser:nodeuser /opt/demo/app",
      "sudo mv /tmp/config.json /opt/config.json",
      "sudo mv /tmp/node-run.service /etc/systemd/system/node-run.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable node-run",
      "sudo systemctl start node-run",
      "sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/config.json -s",
      "sudo apt-get clean"
    ]
  }

  post-processor "manifest" {
    output     = "packer_manifest.json"
    strip_path = true
    custom_data = {
      iteration_id = packer.iterationID
    }
  }
}
