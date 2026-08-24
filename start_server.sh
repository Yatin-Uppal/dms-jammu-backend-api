#!/bin/bash

# Prompt the user for the IP address
read -p "Enter the IP address: " ipAddress

# Check if the entered IP address is not empty
if [ -z "$ipAddress" ]; then
  echo "IP address cannot be empty. Exiting..."
  exit 1
fi

# Prompt the user for Ammunition Point (AP)
echo "Select Ammunition Point (AP):"
echo "1) AP 251"
echo "2) AP 252"
echo "3) AP 253"
echo "4) AP 254"
echo "5) AP 255"
read -p "Enter choice [1-5] (or AP name): " apChoice

case "$apChoice" in
  1|"AP 251"|"251") selectedAp="AP 251" ;;
  2|"AP 252"|"252") selectedAp="AP 252" ;;
  3|"AP 253"|"253") selectedAp="AP 253" ;;
  4|"AP 254"|"254") selectedAp="AP 254" ;;
  5|"AP 255"|"255") selectedAp="AP 255" ;;
  *)
    echo "Invalid AP choice. Exiting..."
    exit 1
    ;;
esac

# Set environment variables
export ipAddress="$ipAddress"
export BASE_URL="http://${ipAddress}:8080/"
export SERVER_AP="$selectedAp"

echo "Starting server on IP: $ipAddress with AP: $SERVER_AP"

# Run the server
npm run dev
