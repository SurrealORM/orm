@echo off
echo "Starting SurrealDB for testing..."

REM Check if surreal is installed
where surreal >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: SurrealDB is not installed or not in your PATH
    echo Please install SurrealDB from https://surrealdb.com/install
    exit /b 1
)

REM Start SurrealDB
surreal start --log trace --user root --pass root memory

REM This script will keep running until manually stopped with Ctrl+C 