#!/bin/bash

# Prompt the user for the IP address
read -p "Enter the IP address: " ipAddress

# Check if the entered IP address is not empty
if [ -z "$ipAddress" ]; then
  echo "IP address cannot be empty. Exiting..."
  exit 1
fi

# Set the IP address as an environment variable
export ipAddress="$ipAddress"
export BASE_URL="http://${ipAddress}:8080/"

# Run the server
npm run dev
