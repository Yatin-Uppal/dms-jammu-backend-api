@echo off

:: Prompt the user for the path of the API folder
set API_PATH=C:\Users\HP\Desktop\DMS-Barcode-2026\dms-jammu-backend-api
:: Set the API path as the script path
set SCRIPT_PATH=%API_PATH%

:: Prompt the user for the IP address
set /p ipAddress=Enter the IP address: 

:: Check if the entered IP address is not empty
if "%ipAddress%"=="" (
  echo IP address cannot be empty. Exiting...
  exit /b 1
)

:: Set the IP address as an environment variable
set ipAddress=%ipAddress%
set BASE_URL=http://%ipAddress%:8080/

:: Run the server script
call npm run dev
