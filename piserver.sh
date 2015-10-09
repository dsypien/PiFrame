#!/bin/bash

# Forward port 80 to the port of the piserver 10239
iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 10239

#Fixes qiv bug
cp /home/pi/Projects/PiFrame/10-intel.conf /usr/share/X11/xorg.conf.d/

# Create a directory for the project
npm start --prefix /home/pi/Projects/PiFrame/piserver

