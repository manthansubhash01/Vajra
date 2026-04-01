#!/usr/bin/env bash
set -euo pipefail

# Detect OS
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
else
  OS=$(uname)
fi

if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
  sudo apt-get update -y
  sudo apt-get install -y git docker.io curl
elif [ "$OS" = "amzn" ]; then
  sudo yum update -y
  sudo yum install -y git docker curl
fi

if ! command -v node >/dev/null 2>&1; then
  if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
  elif [ "$OS" = "amzn" ]; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
  fi
fi

sudo usermod -aG docker "$USER" || true

APP_DIR="/opt/vajra"
sudo mkdir -p "$APP_DIR"
sudo chown "$USER:$USER" "$APP_DIR"

if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
  sudo systemctl enable --now docker
elif [ "$OS" = "amzn" ]; then
  sudo service docker start
  sudo chkconfig docker on
fi

echo "EC2 setup complete"
echo "Next: clone repo into $APP_DIR and run scripts/deploy/deploy.sh"
