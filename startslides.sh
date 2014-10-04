#!/bin/sh
killall qiv
qiv -fsti PiFrame/slides/"$1"/*.jpg
