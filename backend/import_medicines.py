import json
import os
import sys
import django

# Добавляем текущую директорию в путь
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.dirname(current_dir))

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medguide_backend.settings')
django.setup()

from medicines.models import Medicine

# Данные лекарств из TypeScript файла
medicines_data = [
    {
        "id": 0,
        "name": "Абиратерон-ТЛ, Абитера",
        "mnn": "Абиратерон",
        "form": "таблетки №120",
        "dosage": "250 мг",
        "min_stock": 12345,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 12345,
    },
    {
        "id": 1,
        "name": "Адеметионин, Адеметионин Велфарм",
        "mnn": "Адеметионин",
        "form": "табл. п.о. раствор./кишеч. №20",
        "dosage": "400 мг",
        "min_stock": 15,
        "stock": 10,
        "stock_per_pack": 200,
        "diff": 5,
    },
    {
        "id": 2,
        "name": "Адеметионин, Гепаретта, Гептор, Гептрал, Гепцифол экспресс, Самеликс",
        "mnn": "Адеметионин",
        "form": "лиоф. д/р-ра для в/в и в/м введ.",
        "dosage": "400 мг №5",
        "min_stock": 100,
        "stock": 11,
        "stock_per_pack": 55,
        "diff": 89,
    },
    {
        "id": 3,
        "name": "Адеметионин, Гептор, Гептрал, Самеликс",
        "mnn": "Адеметионин",
        "form": "табл. п.о. раствор./кишеч.",
        "dosage": "400 мг/1таб №20",
        "min_stock": 15,
        "stock": 6,
        "stock_per_pack": 120,
        "diff": 9,
    },
    {
        "id": 4,
        "name": "Адеметионин, Гепцифол, Гепцифол экспресс, Самеликс",
        "mnn": "Адеметионин",
        "form": "лиоф. д/р-ра для в/в и в/м введ. №5",
        "dosage": "400 мг",
        "min_stock": 100,
        "stock": 453,
        "stock_per_pack": 2265,
        "diff": -353,
    },
    {
        "id": 5,
        "name": "Азитрокс, Азитромицин",
        "mnn": "Азитромицин",
        "form": "капсулы",
        "dosage": "250 мг/1капсула №6",
        "min_stock": 6,
        "stock": 20,
        "stock_per_pack": 120,
        "diff": -14,
    },
    {
        "id": 6,
        "name": "Азитрокс, Азитромицин",
        "mnn": "Азитромицин",
        "form": "капсулы №6",
        "dosage": "250 мг",
        "min_stock": 6,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 6,
    },
    {
        "id": 7,
        "name": "Азитрокс, Азитромицин",
        "mnn": "Азитромицин",
        "form": "пор. д/сусп. д/приема внутрь",
        "dosage": "100 мг/5 мл №1",
        "min_stock": 20,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 20,
    },
    {
        "id": 8,
        "name": "Азитрокс, Сумамед, Хемомицин",
        "mnn": "Азитромицин",
        "form": "пор. д/сусп. д/приема внутрь",
        "dosage": "200мг/5 мл",
        "min_stock": 6,
        "stock": 2,
        "stock_per_pack": 40,
        "diff": 4,
    },
    {
        "id": 9,
        "name": "Азитромицин",
        "mnn": "Азитромицин",
        "form": "капсулы",
        "dosage": "500 мг/1капсула №3",
        "min_stock": 80,
        "stock": 130,
        "stock_per_pack": 390,
        "diff": -50,
    },
    {
        "id": 10,
        "name": "Азитромицин",
        "mnn": "Азитромицин",
        "form": "капсулы №3",
        "dosage": "500 мг",
        "min_stock": 80,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 80,
    },
    {
        "id": 11,
        "name": "Азитромицин",
        "mnn": "Азитромицин",
        "form": "лиоф. д/р-ра д/инф",
        "dosage": "500 мг",
        "min_stock": 130,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 130,
    },
    {
        "id": 12,
        "name": "Азитромицин",
        "mnn": "Азитромицин",
        "form": "лиоф. д/р-ра д/инф №5",
        "dosage": "500 мг",
        "min_stock": 0,
        "stock": 100,
        "stock_per_pack": 500,
        "diff": -100,
    },
    {
        "id": 13,
        "name": "Азитромицин",
        "mnn": "Азитромицин",
        "form": "пор. д/сусп. д/приема внутрь",
        "dosage": "100 мг/5 мл",
        "min_stock": 0,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 0,
    },
    {
        "id": 14,
        "name": "Азитромицин Экомед",
        "mnn": "Азитромицин",
        "form": "пор. д/сусп. д/приема внутрь",
        "dosage": "100 мг/5 мл 16,5 г",
        "min_stock": 0,
        "stock": 1,
        "stock_per_pack": 17,
        "diff": -1,
    },
    {
        "id": 15,
        "name": "Азитромицин, Азитромицин Велфарм",
        "mnn": "Азитромицин",
        "form": "табл.п/пл/о №3",
        "dosage": "500 мг",
        "min_stock": 160,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 160,
    },
    {
        "id": 16,
        "name": "Азитромицин, Азитромицин Велфарм, Азитромицин форте",
        "mnn": "Азитромицин",
        "form": "табл.п/пл/о",
        "dosage": "500 мг/1таб №3",
        "min_stock": 80,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 80,
    },
    {
        "id": 17,
        "name": "Азитромицин, Хемомицин",
        "mnn": "Азитромицин",
        "form": "лиоф. д/р-ра д/инф",
        "dosage": "500 мг №1",
        "min_stock": 130,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 130,
    },
    {
        "id": 18,
        "name": "Азтреобакт, Азтреонам",
        "mnn": "Азтреонам",
        "form": "пор. д/р-ра для в/в  и в/м введ.",
        "dosage": "1 г",
        "min_stock": 60,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 60,
    },
    {
        "id": 19,
        "name": "Акситиниб, Акситиниб-Промомед, Инлита",
        "mnn": "Акситиниб",
        "form": "табл.п/пл/о №56",
        "dosage": "1 мг",
        "min_stock": 0,
        "stock": 1,
        "stock_per_pack": 56,
        "diff": -1,
    },
    {
        "id": 20,
        "name": "Уголь активированный",
        "mnn": "Уголь активированный",
        "form": "таблетки №10",
        "dosage": "250 мг",
        "min_stock": 200,
        "stock": 500,
        "stock_per_pack": 5000,
        "diff": -300,
    },
    {
        "id": 21,
        "name": "Аллопуринол",
        "mnn": "Аллопуринол",
        "form": "таблетки",
        "dosage": "100 мг/1таб №50",
        "min_stock": 50,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 50,
    },
    {
        "id": 22,
        "name": "Аллопуринол",
        "mnn": "Аллопуринол",
        "form": "таблетки №50",
        "dosage": "100 мг",
        "min_stock": 50,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 50,
    },
    {
        "id": 23,
        "name": "Алпростадил, Вазапростан",
        "mnn": "Алпростадил",
        "form": "лиоф. д/р-ра д/инф №10",
        "dosage": "20 мкг",
        "min_stock": 2,
        "stock": 2,
        "stock_per_pack": 20,
        "diff": 0,
    },
    {
        "id": 24,
        "name": "Вазапростан",
        "mnn": "Алпростадил",
        "form": "лиоф. д/р-ра д/инф",
        "dosage": "20 мкг №10",
        "min_stock": 2,
        "stock": 2,
        "stock_per_pack": 20,
        "diff": 0,
    },
    {
        "id": 25,
        "name": "Актилизе, Ревелиза",
        "mnn": "Алтеплаза",
        "form": "лиоф. д/р-ра д/инф",
        "dosage": "50 мг + растворитель №1",
        "min_stock": 15,
        "stock": 27,
        "stock_per_pack": 27,
        "diff": -12,
    },
    {
        "id": 26,
        "name": "Ревелиза",
        "mnn": "Алтеплаза",
        "form": "лиоф. д/р-ра д/инф",
        "dosage": "50 мг + растворитель",
        "min_stock": 0,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 0,
    },
    {
        "id": 27,
        "name": "Альбумин",
        "mnn": "Альбумин",
        "form": "р-р для д/инф.",
        "dosage": "20% 100 мл",
        "min_stock": 90,
        "stock": 48,
        "stock_per_pack": 48,
        "diff": 42,
    },
    {
        "id": 28,
        "name": "Фосфалюгель",
        "mnn": "Алюминия фосфат",
        "form": "гель д/приема внутрь №20",
        "dosage": "16 г",
        "min_stock": 75,
        "stock": 77,
        "stock_per_pack": 1540,
        "diff": -2,
    },
    {
        "id": 29,
        "name": "Амброксол",
        "mnn": "Амброксол",
        "form": "р-р д/ингал. и внут.",
        "dosage": "7,5 мг/мл 100 мл",
        "min_stock": 30,
        "stock": 20,
        "stock_per_pack": 2000,
        "diff": 10,
    },
    {
        "id": 30,
        "name": "Амброксол",
        "mnn": "Амброксол",
        "form": "таблетки №20",
        "dosage": "30 мг",
        "min_stock": 230,
        "stock": 165,
        "stock_per_pack": 3300,
        "diff": 65,
    },
    {
        "id": 31,
        "name": "Амброксол, Амброксол Велфарм",
        "mnn": "Амброксол",
        "form": "таблетки",
        "dosage": "30 мг/1таб №20",
        "min_stock": 230,
        "stock": 30,
        "stock_per_pack": 600,
        "diff": 200,
    },
    {
        "id": 32,
        "name": "Амброксол, Амброксол, Лазолван",
        "mnn": "Амброксол",
        "form": "сироп",
        "dosage": "30 мг/5 мл 100 мл",
        "min_stock": 50,
        "stock": 40,
        "stock_per_pack": 400,
        "diff": 10,
    },
    {
        "id": 33,
        "name": "Амброксол-АЛСИ",
        "mnn": "Амброксол",
        "form": "таблетки",
        "dosage": "30 мг/1таб №30",
        "min_stock": 230,
        "stock": 0,
        "stock_per_pack": 0,
        "diff": 230,
    },
    {
        "id": 34,
        "name": "Амикацин",
        "mnn": "Амикацин",
        "form": "пор. д/р-ра для в/в  и в/м введ.",
        "dosage": "500 мг",
        "min_stock": 100,
        "stock": 100,
        "stock_per_pack": 100,
        "diff": 0,
    },
    {
        "id": 35,
        "name": "Амикацин",
        "mnn": "Амикацин",
        "form": "пор. д/р-ра для в/в  и в/м введ.",
        "dosage": "500 мг №1",
        "min_stock": 100,
        "stock": 25,
        "stock_per_pack": 25,
        "diff": 75,
    },
    {
        "id": 36,
        "name": "Амикацин",
        "mnn": "Амикацин",
        "form": "пор. д/р-ра для в/в и в/м введ. №50",
        "dosage": "500 мг",
        "min_stock": 0,
        "stock": 1,
        "stock_per_pack": 50,
        "diff": -1,
    },
    {
        "id": 37,
        "name": "Аминокапроновая кислота",
        "mnn": "Аминокапроновая кислота",
        "form": "р-р д/инфузий",
        "dosage": "5% 100 мл №35",
        "min_stock": 0,
        "stock": 30,
        "stock_per_pack": 2999,
        "diff": 0,
    },
    {
        "id": 38,
        "name": "Аминокапроновая кислота",
        "mnn": "Аминокапроновая кислота",
        "form": "р-р д/инфузий",
        "dosage": "5% 100 мл №36",
        "min_stock": 0,
        "stock": 1,
        "stock_per_pack": 3600,
        "diff": -1,
    },
]

ARTICLE_PREFIX = "MG-"
QR_BASE_URL = "med:"

def build_article(item_id):
    padded_id = str(item_id + 1).zfill(5)
    return f"{ARTICLE_PREFIX}{padded_id}"

def build_qr_payload(article):
    return f"{QR_BASE_URL}{article}"

def import_medicines():
    """Импортирует лекарства в базу данных"""
    created_count = 0
    updated_count = 0
    skipped_count = 0
    
    for data in medicines_data:
        article = build_article(data['id'])
        qr_payload = build_qr_payload(article)
        
        try:
            medicine, created = Medicine.objects.update_or_create(
                article=article,
                defaults={
                    'name': data['name'],
                    'mnn': data['mnn'],
                    'form': data['form'],
                    'dosage': data['dosage'],
                    'min_stock': data['min_stock'],
                    'stock': data['stock'],
                    'stock_per_pack': data['stock_per_pack'],
                    'diff': data['diff'],
                    'qr_payload': qr_payload,
                }
            )
            
            if created:
                created_count += 1
                print(f"✓ Создано: {medicine.name} ({article})")
            else:
                updated_count += 1
                print(f"◆ Обновлено: {medicine.name} ({article})")
                
        except Exception as e:
            skipped_count += 1
            print(f"✗ Ошибка при импорте {data['name']}: {str(e)}")
    
    print(f"\n=== Результат импорта ===")
    print(f"Создано: {created_count}")
    print(f"Обновлено: {updated_count}")
    print(f"Ошибок: {skipped_count}")
    print(f"Всего: {created_count + updated_count + skipped_count}")

if __name__ == '__main__':
    print("Начинаем импорт лекарств...")
    import_medicines()
    print("Импорт завершён!")
