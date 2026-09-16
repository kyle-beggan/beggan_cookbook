#!/bin/bash
source ~/.profile
source ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if ! command -v npm &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

cd ~/beggan_cookbook
npm install
npm run build
sudo npm install -g pm2
pm2 delete beggan-cookbook || true
pm2 start npm --name "beggan-cookbook" -- start
pm2 save
