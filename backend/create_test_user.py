#!/usr/bin/env python
"""
Скрипт для создания тестового пользователя
Запуск: python create_test_user.py
"""
import os
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medguide_backend.settings')
django.setup()

from django.contrib.auth.models import User

# Создаем тестового пользователя
email = "test@example.com"
password = "test123"

if User.objects.filter(username=email).exists():
    user = User.objects.get(username=email)
    user.set_password(password)
    user.save()
    print(f"✅ Пользователь {email} обновлен (пароль: {password})")
else:
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name="Тестовый Пользователь",
        is_staff=False
    )
    print(f"✅ Создан тестовый пользователь:")
    print(f"   Email: {email}")
    print(f"   Пароль: {password}")
    print(f"   ID: {user.id}")

print("\n📝 Используйте эти данные для входа в приложение")




