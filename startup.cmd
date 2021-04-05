@ECHO off
SETLOCAL
CALL :find_dp0

cd "%dp0%\dist"
http-server --port 8754 -o "/" -c-1

ENDLOCAL
EXIT /b %errorlevel%
:find_dp0
SET dp0=%~dp0
EXIT /b
