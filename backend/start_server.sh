#!/bin/bash
echo "Starting Django development server..."
echo ""
echo "IMPORTANT: Server will run on 0.0.0.0:8000 to allow Android emulator connections"
echo ""

# Navigate to script directory
cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "Virtual environment activated"
else
    echo "Warning: Virtual environment not found. Using system Python."
fi

echo ""
echo "Starting server..."
python manage.py runserver 0.0.0.0:8000




