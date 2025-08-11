@echo off

REM Prompt user for API folder path
set /p API_PATH=Enter the path of the API folder (e.g., C:\Users\Admin\Documents\DMS\ammunition-cargo-api): 

REM Display the entered API folder path for debugging
echo Entered API folder path: "%API_PATH%"

REM Construct the database dump file path
set "dumpFilePath=%API_PATH%\dms_database_dump\Dump20231221.sql"
REM Display the constructed dump file path for debugging
echo Constructed database dump file path: %dumpFilePath%

REM Ask user for database username and password
set /p dbUsername=Enter the database username: 
set /p dbPassword=Enter the database password: 

REM Display the entered database username for debugging
echo Entered database username: %dbUsername%

REM Extract database name from SQL file
for /f "tokens=3 delims= " %%a in ('findstr /i "create database" "%dumpFilePath%"') do set dbName=%%a

REM Display the extracted database name for debugging
echo Extracted database name: %dbName%

REM Run the SQL file to create the database and tables using MySQL
echo Running SQL file: %dumpFilePath%
mysql -u %dbUsername% -p%dbPassword% -e "source %dumpFilePath%"

echo Database creation completed.

REM Keep the terminal window open
pause

:End
