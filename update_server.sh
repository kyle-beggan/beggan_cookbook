#!/bin/bash
# Add swap if it doesn't exist to prevent OOM crash during build
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
fi

source ~/.profile
source ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd ~/beggan_cookbook
git pull origin main
npm install
npm run build

pm2 delete beggan-cookbook || true
pm2 start npm --name "beggan-cookbook" -- start
pm2 save

sudo tee /opt/bitnami/apache2/conf/vhosts/beggan-cookbook-vhost.conf > /dev/null << 'APACHE'
<VirtualHost *:80>
  ServerName cookbook.sleepyhollows.com
  ProxyPass / http://localhost:3001/
  ProxyPassReverse / http://localhost:3001/
</VirtualHost>
APACHE

sudo /opt/bitnami/ctlscript.sh restart apache
