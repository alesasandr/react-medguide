@echo off
echo Starting Django development server...
echo.
echo IMPORTANT: Server will run on 0.0.0.0:8000 to allow Android emulator connections
echo.
cd /d %~dp0
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    echo Virtual environment activated
) else (
    echo Warning: Virtual environment not found. Using system Python.
)
echo.
echo Starting server...
python manage.py runserver 0.0.0.0:8000
pause




