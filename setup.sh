#!/bin/bash

# Crate a directory for the project
mkdir ~/Projects

# Step into the project directory
cd Projects

# Clone the repository
git clone https://github.com/dsypien/PiFrame.git

# Get & install ARM version of Node
wget http://node-arm.herokuapp.com/node_latest_armhf.deb 
dpkg -i node_latest_armhf.deb

# Install other dependencies
apt-get install sqlite3
apt-get install imagemagick
apt-get install qiv
npm install -g bower
npm install -g gulp

# Run updates
npm update
bower update

# Build project
gulp build-dist
