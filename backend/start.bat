@echo off
echo Starting Rural Healthcare Management System Backend...

REM Check if .env exists, if not copy from example
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo Please edit .env file with your configuration before running the server
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Create logs directory
if not exist logs mkdir logs

echo Starting development server...
npm run dev
