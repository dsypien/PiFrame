#!/bin/bash

# Forward port 80 to the port of the piserver 10239
iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 10239

