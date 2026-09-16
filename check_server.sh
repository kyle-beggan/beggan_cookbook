#!/bin/bash
source ~/.profile
source ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

sudo pm2 list
sudo netstat -tulpn | grep :3000
