# Инструкция по деплою бэкенда

## Быстрый старт

### 1. Подготовка переменных окружения

```bash
cp env.example .env
nano .env  # или используйте любой редактор
```

**Обязательно настройте:**
- `SECRET_KEY` - сгенерируйте новый ключ:
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
- `DB_PASSWORD` - надежный пароль для PostgreSQL
- `ALLOWED_HOSTS` - ваш домен (например: `api.example.com`)
- `CORS_ALLOWED_ORIGINS` - домены фронтенда (например: `https://example.com`)

### 2. Запуск

```bash
# Сборка и запуск
docker-compose up -d

# Просмотр логов
docker-compose logs -f django

# Проверка статуса
docker-compose ps
```

### 3. Первоначальная настройка

```bash
# Создание суперпользователя
docker-compose exec django python manage.py createsuperuser

# Загрузка начальных данных препаратов (если нужно)
docker-compose exec django python manage.py load_medicines
```

## Структура файлов

- `Dockerfile` - образ для production с Gunicorn
- `docker-compose.yml` - конфигурация для запуска Django + PostgreSQL
- `gunicorn_config.py` - настройки Gunicorn
- `docker-entrypoint.sh` - скрипт инициализации (миграции, статика)
- `.env` - переменные окружения (не коммитится в git)
- `env.example` - пример переменных окружения

## Переменные окружения

### Обязательные

```env
SECRET_KEY=your-secret-key
DB_PASSWORD=your-db-password
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

### Опциональные

```env
DEBUG=False
DB_NAME=medguide_db
DB_USER=medguide_user
DB_HOST=db
DB_PORT=5432
FRONTEND_URL=https://your-frontend.com
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Команды управления

### Остановка и запуск

```bash
# Остановить
docker-compose down

# Запустить
docker-compose up -d

# Перезапустить
docker-compose restart django
```

### Логи

```bash
# Все логи
docker-compose logs -f

# Только Django
docker-compose logs -f django

# Только PostgreSQL
docker-compose logs -f db
```

### Миграции

```bash
# Создать миграции
docker-compose exec django python manage.py makemigrations

# Применить миграции
docker-compose exec django python manage.py migrate

# Откатить миграции
docker-compose exec django python manage.py migrate app_name zero
```

### Обновление

```bash
# Остановить
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

## Резервное копирование

### Бэкап базы данных

```bash
# Создать бэкап
docker-compose exec db pg_dump -U medguide_user medguide_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановить из бэкапа
docker-compose exec -T db psql -U medguide_user medguide_db < backup.sql
```

### Бэкап медиа файлов

```bash
# Создать архив медиа
tar -czf media_backup_$(date +%Y%m%d_%H%M%S).tar.gz backend/media/

# Восстановить
tar -xzf media_backup.tar.gz -C backend/
```

## Настройка Nginx (опционально)

Если нужно использовать Nginx как reverse proxy:

```nginx
upstream django {
    server localhost:8000;
}

server {
    listen 80;
    server_name api.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /path/to/backend/staticfiles/;
    }

    location /media/ {
        alias /path/to/backend/media/;
    }
}
```

## Troubleshooting

### База данных не подключается

```bash
# Проверить статус контейнера
docker-compose ps db

# Проверить логи
docker-compose logs db

# Проверить переменные окружения
docker-compose exec django env | grep DB_
```

### Ошибки миграций

```bash
# Принудительно применить миграции
docker-compose exec django python manage.py migrate --run-syncdb

# Сбросить миграции (осторожно!)
docker-compose exec django python manage.py migrate app_name zero
docker-compose exec django python manage.py migrate
```

### Проблемы с правами доступа

```bash
# Исправить права на статику и медиа
docker-compose exec django chmod -R 755 /app/staticfiles
docker-compose exec django chmod -R 755 /app/media
```

### Контейнер не запускается

```bash
# Проверить логи
docker-compose logs django

# Пересобрать образ
docker-compose build --no-cache django

# Запустить заново
docker-compose up -d
```

## Мониторинг

### Проверка здоровья API

```bash
curl http://localhost:8000/api/health/
```

### Проверка использования ресурсов

```bash
docker stats medguide-backend medguide-db
```

## Безопасность

- ✅ Используйте сильные пароли для `SECRET_KEY` и `DB_PASSWORD`
- ✅ Не коммитьте `.env` в git (уже в `.gitignore`)
- ✅ Используйте HTTPS в production
- ✅ Ограничьте `ALLOWED_HOSTS` только вашими доменами
- ✅ Настройте `CORS_ALLOWED_ORIGINS` только для вашего фронтенда
- ✅ Регулярно обновляйте зависимости: `pip list --outdated`
- ✅ Используйте firewall для ограничения доступа к портам

