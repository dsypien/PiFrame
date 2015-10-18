#!/bin/sh

# Kill all instances of sxiv first
killall sxiv

# Start the slide with the following options:
# -f  Fullscren
# -S  Slideshow each n minutes
# -r  Recursively find next image in directory
# -b  Disable statusbar
(sxiv -fbr  -S "$2" "$1"/ &) 
