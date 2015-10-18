# Run server if port available
if netstat -lnt | awk '$6 == "LISTEN" && $4 ~ ".10239"'
then

	npm start --prefix /home/pi/Projects/PiFrame/piserver

else

	echo port 10239 not available

fi
