#!/bin/bash
set -e

echo "Waiting for database..."
# Используем встроенный Python для проверки подключения к БД
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-medguide_user}
DB_PASSWORD=${DB_PASSWORD:-changeme}
DB_NAME=${DB_NAME:-medguide_db}

# Сначала ждем, пока PostgreSQL станет доступен (подключаемся к стандартной базе postgres)
echo "Waiting for PostgreSQL server..."
until python << EOF
import psycopg2
import sys
try:
    conn = psycopg2.connect(
        host='${DB_HOST}',
        port='${DB_PORT}',
        user='${DB_USER}',
        password='${DB_PASSWORD}',
        dbname='postgres'  # Подключаемся к стандартной базе
    )
    conn.close()
    sys.exit(0)
except psycopg2.OperationalError:
    sys.exit(1)
EOF
do
  echo "PostgreSQL server is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL server is ready!"

# Проверяем, существует ли нужная база данных, и создаем её, если нет
echo "Checking if database '${DB_NAME}' exists..."
python << EOF
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    # Подключаемся к базе postgres для создания новой базы
    conn = psycopg2.connect(
        host='${DB_HOST}',
        port='${DB_PORT}',
        user='${DB_USER}',
        password='${DB_PASSWORD}',
        dbname='postgres'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Проверяем, существует ли база данных
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'")
    exists = cursor.fetchone()
    
    if not exists:
        print(f"Database '${DB_NAME}' does not exist. Creating it...")
        cursor.execute(f"CREATE DATABASE ${DB_NAME}")
        print(f"Database '${DB_NAME}' created successfully!")
    else:
        print(f"Database '${DB_NAME}' already exists.")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error checking/creating database: {e}")
    exit(1)
EOF

# Теперь ждем, пока нужная база данных станет доступна
echo "Waiting for database '${DB_NAME}'..."
until python << EOF
import psycopg2
import sys
try:
    conn = psycopg2.connect(
        host='${DB_HOST}',
        port='${DB_PORT}',
        user='${DB_USER}',
        password='${DB_PASSWORD}',
        dbname='${DB_NAME}'
    )
    conn.close()
    sys.exit(0)
except psycopg2.OperationalError as e:
    sys.exit(1)
EOF
do
  echo "Database '${DB_NAME}' is unavailable - sleeping"
  sleep 1
done
echo "Database '${DB_NAME}' is ready!"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting server..."
exec "$@"

