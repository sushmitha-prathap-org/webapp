#!/bin/bash

# Update package list
sudo apt-get update

# Install Node.js and npm
sudo apt-get install -y nodejs npm

# Install MariaDB server
sudo apt-get install -y mariadb-server

# Create a MySQL database
sudo mysql -e "CREATE DATABASE assignment3;"

# Set MySQL root password (use --skip-password to avoid interactive password prompt)
sudo mysql -u root --skip-password <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '1998@Pupss';
FLUSH PRIVILEGES;
EOF

# Install unzip utility
sudo apt-get install unzip -y

# Create a directory at /opt/demo
sudo mkdir /opt/demo

# Copy application artifact to /opt/demo
sudo cp -r ../../webapp.zip /opt/demo/

# Unzip the application artifact

sudo unzip /opt/demo/webapp.zip -d /opt/demo/

ls

cd /opt/demo/webapp/app || exit 

sudo npm install

# Clean up apt packages
sudo apt-get clean
