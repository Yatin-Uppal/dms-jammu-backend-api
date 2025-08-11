#!/bin/bash

# Prompt user for API folder path
read -p "Enter the path of the API folder (e.g., /home/abhishek/Documents/live_projects/Ammunition_Cargo_Management_User_Flow/ammunition-cargo-api): " API_PATH

# Display the entered API folder path for debugging
echo "Entered API folder path: \"$API_PATH\""

# Construct the database dump file path
dumpFilePath="$API_PATH/dms_database_dump/Dump20231221.sql"

# Display the constructed dump file path for debugging
echo "Constructed database dump file path: $dumpFilePath"

# Ask user for database username and password
read -p "Enter the database username: " dbUsername
read -p "Enter the database password: " -s dbPassword
echo # Move to the next line after entering the password

# Display the entered database username for debugging
echo "Entered database username: $dbUsername"

# Extract database name from SQL file
dbName=$(grep -i "create database" "$dumpFilePath" | awk '{print $3}' | tr -d ';')

# Display the extracted database name for debugging
echo "Extracted database name: $dbName"

# Run the SQL file to create the database and tables
echo "Running SQL file: $dumpFilePath"
mysql -u "$dbUsername" -p"$dbPassword" -e "CREATE DATABASE IF NOT EXISTS $dbName;"
mysql -u "$dbUsername" -p"$dbPassword" "$dbName" < "$dumpFilePath"

echo "Database creation completed."

# Keep the terminal window open
read -p "Press enter to exit..."
