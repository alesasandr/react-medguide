# Миграция данных в базу данных

## ✅ Выполнено

Все препараты из локального файла `src/db/medicines.ts` успешно перенесены в базу данных на сервере.

### Статистика
- **Загружено препаратов:** 39
- **Все препараты созданы с артикулами:** MG-00001 до MG-00039
- **QR payload сгенерированы:** для всех препаратов

## Использование команды загрузки

### Загрузка препаратов

```bash
cd react-medguide/backend
python manage.py load_medicines
```

### Очистка и перезагрузка

Если нужно очистить существующие данные и загрузить заново:

```bash
python manage.py load_medicines --clear
```

## Структура данных

Каждый препарат содержит:
- `name` - Название препарата
- `mnn` - Международное непатентованное название
- `form` - Лекарственная форма
- `dosage` - Дозировка
- `min_stock` - Минимальный остаток
- `stock` - Текущий остаток на складе
- `stock_per_pack` - Количество в упаковке
- `diff` - Отклонение от минимального остатка
- `article` - Артикул (уникальный, формат: MG-00001, MG-00002, ...)
- `qr_payload` - QR код (формат: med:MG-00001, med:MG-00002, ...)

## API Endpoints

После загрузки данные доступны через API:

- `GET /api/medicines/` - Получить все препараты
- `GET /api/medicines/{id}/` - Получить препарат по ID
- `GET /api/medicines/search/?q=query` - Поиск препаратов
- `GET /api/medicines/by_article/?article=MG-00001` - Поиск по артикулу
- `GET /api/medicines/by_qr/?qr=med:MG-00001` - Поиск по QR коду

## Проверка данных

### Через Django shell

```bash
python manage.py shell
```

```python
from medicines.models import Medicine

# Количество препаратов
print(Medicine.objects.count())

# Первые 5 препаратов
for med in Medicine.objects.all()[:5]:
    print(f"{med.article}: {med.name}")

# Поиск по артикулу
med = Medicine.objects.get(article="MG-00001")
print(f"Найден: {med.name}, остаток: {med.stock}")
```

### Через API

```bash
# Получить все препараты
curl http://localhost:8000/api/medicines/

# Получить препарат по ID
curl http://localhost:8000/api/medicines/1/

# Поиск по артикулу
curl "http://localhost:8000/api/medicines/by_article/?article=MG-00001"
```

## Обновление данных

Если нужно обновить данные препаратов:

1. Измените данные в файле `backend/medicines/management/commands/load_medicines.py`
2. Запустите команду снова (существующие препараты будут обновлены по артикулу)

```bash
python manage.py load_medicines
```

## Примечания

- Артикулы генерируются автоматически на основе ID препарата
- QR payload формируется как `med:{article}`
- Если препарат с таким артикулом уже существует, он будет обновлен
- Все поля обязательны и должны быть заполнены



