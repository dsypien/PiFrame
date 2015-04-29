![](https://github.com/dsypien/PiFrame/blob/master/piserver/public/images/piframe.ico) PiFrame 
============
PiFrame is a picture frame service and webapp for the Raspberry Pi that turns your tv/monitor into a digital picture frame.  It allows users to upload photos, and then create and play slideshows.

Dependencies
------------
-  Node.js
-  Bower
-  SQLite
-  ImageMagick
-  QIV

Raspbian Setup
--------------
Install the ARM version of Node
```bash
  $ wget http://node-arm.herokuapp.com/node_latest_armhf.deb 
  $ sudo dpkg -i node_latest_armhf.deb
```

Install other dependencies
```bash
  $ sudo apt-get install sqlite3
  $ sudo apt-get install imagemagick
  $ sudo apt-get install qiv
  $ sudo npm install -g bower
```

Build 
-----

```bash
  $ npm update
  $ bower update
```
 
Start server
---------------

```bash
  $ npm start
```

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
