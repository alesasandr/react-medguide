# MedGuide Backend - Django REST API

Backend для мобильного приложения MedGuide на Django REST Framework.

## Быстрый старт с Docker

### 1. Подготовка

Скопируйте файл с переменными окружения:
```bash
cp env.example .env
```

Отредактируйте `.env` и укажите:
- `SECRET_KEY` - сгенерируйте новый ключ Django
- `DB_PASSWORD` - надежный пароль для PostgreSQL
- `ALLOWED_HOSTS` - ваш домен
- `CORS_ALLOWED_ORIGINS` - домены фронтенда
- Настройки email для восстановления пароля

### 2. Генерация SECRET_KEY

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3. Запуск

```bash
# Сборка и запуск контейнеров
docker-compose up -d

# Просмотр логов
docker-compose logs -f django

# Остановка
docker-compose down
```

### 4. Создание суперпользователя

```bash
docker-compose exec django python manage.py createsuperuser
```

### 5. Загрузка начальных данных

```bash
docker-compose exec django python manage.py load_medicines
```

## Структура проекта

```
backend/
├── chat/              # Приложение для профилей и выданных препаратов
├── medicines/         # Приложение для препаратов
├── medguide_backend/  # Настройки Django
├── manage.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── gunicorn_config.py
└── .env              # Переменные окружения (не в git)
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register/` - Регистрация
- `POST /api/auth/login/` - Вход
- `POST /api/auth/reset-password/` - Запрос восстановления пароля
- `POST /api/auth/reset-password-confirm/` - Подтверждение восстановления

### Профили
- `GET /api/profiles/me/` - Получить текущий профиль
- `PATCH /api/profiles/update_me/` - Обновить профиль

### Препараты
- `GET /api/medicines/` - Список препаратов
- `GET /api/medicines/{id}/` - Детали препарата

### Выданные препараты
- `GET /api/issued-medicines/my_issued/` - История выданных
- `POST /api/issued-medicines/` - Выдать препарат

## Переменные окружения

См. `env.example` для полного списка переменных.

### Обязательные:
- `SECRET_KEY` - секретный ключ Django
- `DB_PASSWORD` - пароль PostgreSQL
- `ALLOWED_HOSTS` - разрешенные хосты
- `CORS_ALLOWED_ORIGINS` - разрешенные источники для CORS

### Опциональные:
- `DEBUG` - режим отладки (по умолчанию False)
- `EMAIL_*` - настройки email
- `FRONTEND_URL` - URL фронтенда для ссылок восстановления

## Разработка без Docker

### Установка зависимостей

```bash
python3.12 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Настройка базы данных

Для разработки используется SQLite (по умолчанию).

Для PostgreSQL создайте `.env`:
```env
DB_HOST=localhost
DB_NAME=medguide_db
DB_USER=medguide_user
DB_PASSWORD=your_password
```

### Запуск сервера разработки

```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Production деплой

### С Docker Compose

1. Настройте `.env` для production
2. Установите SSL сертификат (Let's Encrypt)
3. Настройте Nginx как reverse proxy
4. Запустите `docker-compose up -d`

### Без Docker

1. Установите PostgreSQL
2. Создайте виртуальное окружение
3. Установите зависимости
4. Настройте Gunicorn + Nginx
5. Настройте systemd сервис

## Миграции

```bash
# Создать миграции
docker-compose exec django python manage.py makemigrations

# Применить миграции
docker-compose exec django python manage.py migrate
```

## Логи

```bash
# Логи Django
docker-compose logs -f django

# Логи PostgreSQL
docker-compose logs -f db
```

## Резервное копирование

```bash
# Бэкап базы данных
docker-compose exec db pg_dump -U medguide_user medguide_db > backup.sql

# Восстановление
docker-compose exec -T db psql -U medguide_user medguide_db < backup.sql
```

## Обновление

```bash
# Остановить контейнеры
docker-compose down

# Обновить код
git pull

# Пересобрать образы
docker-compose build

# Запустить
docker-compose up -d

# Применить миграции
docker-compose exec django python manage.py migrate
```

## Безопасность

- ✅ Используйте сильные пароли
- ✅ Не коммитьте `.env` в git
- ✅ Используйте HTTPS в production
- ✅ Ограничьте `ALLOWED_HOSTS`
- ✅ Настройте `CORS_ALLOWED_ORIGINS`
- ✅ Регулярно обновляйте зависимости

## Troubleshooting

### База данных не подключается
- Проверьте переменные окружения в `.env`
- Убедитесь что контейнер `db` запущен: `docker-compose ps`
- Проверьте логи: `docker-compose logs db`

### Ошибки миграций
```bash
docker-compose exec django python manage.py migrate --run-syncdb
```

### Проблемы с правами доступа
```bash
docker-compose exec django chmod -R 755 /app/staticfiles
docker-compose exec django chmod -R 755 /app/media
```

