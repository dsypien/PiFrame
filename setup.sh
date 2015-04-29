#!/bin/bash

# Get & install ARM version of Node
wget http://node-arm.herokuapp.com/node_latest_armhf.deb 
dpkg -i node_latest_armhf.deb

# Install other dependencies
apt-get install sqlite3
apt-get install imagemagick
apt-get install qiv
npm install -g bower

npm update
bower update
