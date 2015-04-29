#!/bin/sh

# Kill all instances of qiv first
killall qiv

# Start the slide with the following options:
# -f  Fullscren
# -s  Start slideshow immediately
# -t  Scale larger images down to fit
# -i  Disable statusbar
(qiv -fsti PiFrame/slides/"$1"/*.jpg) &
