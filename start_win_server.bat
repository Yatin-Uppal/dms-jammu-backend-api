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

:: Prompt the user to select Ammunition Point (AP)
echo Select Ammunition Point (AP):
echo 1. AP 251
echo 2. AP 252
echo 3. AP 253
echo 4. AP 254
echo 5. AP 255
set /p apChoice=Enter choice [1-5]: 

if "%apChoice%"=="1" set SERVER_AP=AP 251
if "%apChoice%"=="2" set SERVER_AP=AP 252
if "%apChoice%"=="3" set SERVER_AP=AP 253
if "%apChoice%"=="4" set SERVER_AP=AP 254
if "%apChoice%"=="5" set SERVER_AP=AP 255

if "%SERVER_AP%"=="" (
  echo Invalid AP choice. Exiting...
  exit /b 1
)

:: Set environment variables
set ipAddress=%ipAddress%
set BASE_URL=http://%ipAddress%:8080/
set SERVER_AP=%SERVER_AP%

echo Starting server on IP: %ipAddress% with AP: %SERVER_AP%

:: Run the server script
call npm run dev
