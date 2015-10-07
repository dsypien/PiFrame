![](https://github.com/dsypien/PiFrame/blob/master/piserver/components/images/piframe.ico) PiFrame 
============
PiFrame is a picture frame service and webapp for the Raspberry Pi that turns your tv/monitor into a digital picture frame.  It allows users to upload photos, and then create and play slideshows.

Dependencies
------------
-  Node.js
-  Bower
-  Gulp
-  SQLite
-  ImageMagick
-  QIV

Raspbian Setup
--------------
Install the ARM version of Node:
```bash
  $ wget http://node-arm.herokuapp.com/node_latest_armhf.deb 
  $ sudo dpkg -i node_latest_armhf.deb
```

Install other dependencies:
```bash
  $ sudo apt-get install sqlite3
  $ sudo apt-get install imagemagick
  $ sudo apt-get install qiv
  $ sudo npm install -g bower
  $ sudo npm install -g gulp
```
Get PiFrame
-------------
```bash
  $ git clone https://github.com/dsypien/PiFrame.git
```

Build 
-----
Make sure to change directories so that you are in the PiFrame/piserver directory.  
```bash
  $ cd PiFrame/piserver
```
Then run:
```bash
  $ npm update && bower update && gulp
```
 
Start server
---------------
In the PiFrame/piserver directory, run:

```bash
  $ npm start
```
The server will start and run on port 10239.

Extras
---------------
Some extra things that are nice to setup :

### Assign the .local domain

The .local domain will allow you to access your raspberry pi by typing in the raspberypi.local or if you updated the hostname in /etc/hosts it would be whateveryourhostnameis.local.

More information [here](http://www.howtogeek.com/167190/how-and-why-to-assign-the-.local-domain-to-your-raspberry-pi/). 

All that is needed for the .local domain to work is to install the avahi daemon :

```bash
  $ sudo apt-get install avahi-daemon
```

### Set up port forwarding

Set up forwarding so that you can access the PiFrame site by typing in the hostname without the port.  To do this we will have to add the following line to the /etc/rc.local file:

```bash
  iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 10239
```

After this line is added, reboot your pi.

License
--------

PiFrame a picture frame service and webapp for the Raspberry Pi.
Copyright (C) 2014-2015  David Sypien

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
