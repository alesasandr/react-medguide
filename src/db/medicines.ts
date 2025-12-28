// src/db/medicines.ts

const ARTICLE_PREFIX = "MG-";
// Используем внутренний префикс, а не веб‑URL, чтобы QR не открывался в браузере
const QR_BASE_URL = "med:";

interface MedicineBase {
  id: number;
  name: string;
  mnn: string;
  form: string;
  dosage: string;
  minStock: number;
  stock: number;
  stockPerPack: number;
  diff: number;
}

export interface Medicine extends MedicineBase {
  article: string;
  qrPayload: string;
}

const rawMedicines: MedicineBase[] = [
  {
    id: 0,
    name: "Абиратерон-ТЛ, Абитера",
    mnn: "Абиратерон",
    form: "таблетки №120",
    dosage: "250 мг",
    minStock: 12345,
    stock: 0,
    stockPerPack: 0,
    diff: 12345,
  },
  {
    id: 1,
    name: "Адеметионин, Адеметионин Велфарм",
    mnn: "Адеметионин",
    form: "табл. п.о. раствор./кишеч. №20",
    dosage: "400 мг",
    minStock: 15,
    stock: 10,
    stockPerPack: 200,
    diff: 5,
  },
  {
    id: 2,
    name: "Адеметионин, Гепаретта, Гептор, Гептрал, Гепцифол экспресс, Самеликс",
    mnn: "Адеметионин",
    form: "лиоф. д/р-ра для в/в и в/м введ.",
    dosage: "400 мг №5",
    minStock: 100,
    stock: 11,
    stockPerPack: 55,
    diff: 89,
  },
  {
    id: 3,
    name: "Адеметионин, Гептор, Гептрал, Самеликс",
    mnn: "Адеметионин",
    form: "табл. п.о. раствор./кишеч.",
    dosage: "400 мг/1таб №20",
    minStock: 15,
    stock: 6,
    stockPerPack: 120,
    diff: 9,
  },
  {
    id: 4,
    name: "Адеметионин, Гепцифол, Гепцифол экспресс, Самеликс",
    mnn: "Адеметионин",
    form: "лиоф. д/р-ра для в/в и в/м введ. №5",
    dosage: "400 мг",
    minStock: 100,
    stock: 453,
    stockPerPack: 2265,
    diff: -353,
  },
  {
    id: 5,
    name: "Азитрокс, Азитромицин",
    mnn: "Азитромицин",
    form: "капсулы",
    dosage: "250 мг/1капсула №6",
    minStock: 6,
    stock: 20,
    stockPerPack: 120,
    diff: -14,
  },
  {
    id: 6,
    name: "Азитрокс, Азитромицин",
    mnn: "Азитромицин",
    form: "капсулы №6",
    dosage: "250 мг",
    minStock: 6,
    stock: 0,
    stockPerPack: 0,
    diff: 6,
  },
  {
    id: 7,
    name: "Азитрокс, Азитромицин",
    mnn: "Азитромицин",
    form: "пор. д/сусп. д/приема внутрь",
    dosage: "100 мг/5 мл №1",
    minStock: 20,
    stock: 0,
    stockPerPack: 0,
    diff: 20,
  },
  {
    id: 8,
    name: "Азитрокс, Сумамед, Хемомицин",
    mnn: "Азитромицин",
    form: "пор. д/сусп. д/приема внутрь",
    dosage: "200мг/5 мл",
    minStock: 6,
    stock: 2,
    stockPerPack: 40,
    diff: 4,
  },
  {
    id: 9,
    name: "Азитромицин",
    mnn: "Азитромицин",
    form: "капсулы",
    dosage: "500 мг/1капсула №3",
    minStock: 80,
    stock: 130,
    stockPerPack: 390,
    diff: -50,
  },
  {
    id: 10,
    name: "Азитромицин",
    mnn: "Азитромицин",
    form: "капсулы №3",
    dosage: "500 мг",
    minStock: 80,
    stock: 0,
    stockPerPack: 0,
    diff: 80,
  },
  {
    id: 11,
    name: "Азитромицин",
    mnn: "Азитромицин",
    form: "лиоф. д/р-ра д/инф",
    dosage: "500 мг",
    minStock: 130,
    stock: 0,
    stockPerPack: 0,
    diff: 130,
  },
  {
    id: 12,
    name: "Азитромицин",
    mnn: "Азитромицин",
    form: "лиоф. д/р-ра д/инф №5",
    dosage: "500 мг",
    minStock: 0,
    stock: 100,
    stockPerPack: 500,
    diff: -100,
  },
  {
    id: 13,
    name: "Азитромицин",
    mnn: "Азитромицин",
    form: "пор. д/сусп. д/приема внутрь",
    dosage: "100 мг/5 мл",
    minStock: 0,
    stock: 0,
    stockPerPack: 0,
    diff: 0,
  },
  {
    id: 14,
    name: "Азитромицин Экомед",
    mnn: "Азитромицин",
    form: "пор. д/сусп. д/приема внутрь",
    dosage: "100 мг/5 мл 16,5 г",
    minStock: 0,
    stock: 1,
    stockPerPack: 17,
    diff: -1,
  },
  {
    id: 15,
    name: "Азитромицин, Азитромицин Велфарм",
    mnn: "Азитромицин",
    form: "табл.п/пл/о №3",
    dosage: "500 мг",
    minStock: 160,
    stock: 0,
    stockPerPack: 0,
    diff: 160,
  },
  {
    id: 16,
    name: "Азитромицин, Азитромицин Велфарм, Азитромицин форте",
    mnn: "Азитромицин",
    form: "табл.п/пл/о",
    dosage: "500 мг/1таб №3",
    minStock: 80,
    stock: 0,
    stockPerPack: 0,
    diff: 80,
  },
  {
    id: 17,
    name: "Азитромицин, Хемомицин",
    mnn: "Азитромицин",
    form: "лиоф. д/р-ра д/инф",
    dosage: "500 мг №1",
    minStock: 130,
    stock: 0,
    stockPerPack: 0,
    diff: 130,
  },
  {
    id: 18,
    name: "Азтреобакт, Азтреонам",
    mnn: "Азтреонам",
    form: "пор. д/р-ра для в/в  и в/м введ.",
    dosage: "1 г",
    minStock: 60,
    stock: 0,
    stockPerPack: 0,
    diff: 60,
  },
  {
    id: 19,
    name: "Акситиниб, Акситиниб-Промомед, Инлита",
    mnn: "Акситиниб",
    form: "табл.п/пл/о №56",
    dosage: "1 мг",
    minStock: 0,
    stock: 1,
    stockPerPack: 56,
    diff: -1,
  },
  {
    id: 20,
    name: "Уголь активированный",
    mnn: "Уголь активированный",
    form: "таблетки №10",
    dosage: "250 мг",
    minStock: 200,
    stock: 500,
    stockPerPack: 5000,
    diff: -300,
  },
  {
    id: 21,
    name: "Аллопуринол",
    mnn: "Аллопуринол",
    form: "таблетки",
    dosage: "100 мг/1таб №50",
    minStock: 50,
    stock: 0,
    stockPerPack: 0,
    diff: 50,
  },
  {
    id: 22,
    name: "Аллопуринол",
    mnn: "Аллопуринол",
    form: "таблетки №50",
    dosage: "100 мг",
    minStock: 50,
    stock: 0,
    stockPerPack: 0,
    diff: 50,
  },
  {
    id: 23,
    name: "Алпростадил, Вазапростан",
    mnn: "Алпростадил",
    form: "лиоф. д/р-ра д/инф №10",
    dosage: "20 мкг",
    minStock: 2,
    stock: 2,
    stockPerPack: 20,
    diff: 0,
  },
  {
    id: 24,
    name: "Вазапростан",
    mnn: "Алпростадил",
    form: "лиоф. д/р-ра д/инф",
    dosage: "20 мкг №10",
    minStock: 2,
    stock: 2,
    stockPerPack: 20,
    diff: 0,
  },
  {
    id: 25,
    name: "Актилизе, Ревелиза",
    mnn: "Алтеплаза",
    form: "лиоф. д/р-ра д/инф",
    dosage: "50 мг + растворитель №1",
    minStock: 15,
    stock: 27,
    stockPerPack: 27,
    diff: -12,
  },
  {
    id: 26,
    name: "Ревелиза",
    mnn: "Алтеплаза",
    form: "лиоф. д/р-ра д/инф",
    dosage: "50 мг + растворитель",
    minStock: 0,
    stock: 0,
    stockPerPack: 0,
    diff: 0,
  },
  {
    id: 27,
    name: "Альбумин",
    mnn: "Альбумин",
    form: "р-р для д/инф.",
    dosage: "20% 100 мл",
    minStock: 90,
    stock: 48,
    stockPerPack: 48,
    diff: 42,
  },
  {
    id: 28,
    name: "Фосфалюгель",
    mnn: "Алюминия фосфат",
    form: "гель д/приема внутрь №20",
    dosage: "16 г",
    minStock: 75,
    stock: 77,
    stockPerPack: 1540,
    diff: -2,
  },
  {
    id: 29,
    name: "Амброксол",
    mnn: "Амброксол",
    form: "р-р д/ингал. и внут.",
    dosage: "7,5 мг/мл 100 мл",
    minStock: 30,
    stock: 20,
    stockPerPack: 2000,
    diff: 10,
  },
  {
    id: 30,
    name: "Амброксол",
    mnn: "Амброксол",
    form: "таблетки №20",
    dosage: "30 мг",
    minStock: 230,
    stock: 165,
    stockPerPack: 3300,
    diff: 65,
  },
  {
    id: 31,
    name: "Амброксол, Амброксол Велфарм",
    mnn: "Амброксол",
    form: "таблетки",
    dosage: "30 мг/1таб №20",
    minStock: 230,
    stock: 30,
    stockPerPack: 600,
    diff: 200,
  },
  {
    id: 32,
    name: "Амброксол, Амброксол, Лазолван",
    mnn: "Амброксол",
    form: "сироп",
    dosage: "30 мг/5 мл 100 мл",
    minStock: 50,
    stock: 40,
    stockPerPack: 400,
    diff: 10,
  },
  {
    id: 33,
    name: "Амброксол-АЛСИ",
    mnn: "Амброксол",
    form: "таблетки",
    dosage: "30 мг/1таб №30",
    minStock: 230,
    stock: 0,
    stockPerPack: 0,
    diff: 230,
  },
  {
    id: 34,
    name: "Амикацин",
    mnn: "Амикацин",
    form: "пор. д/р-ра для в/в  и в/м введ.",
    dosage: "500 мг",
    minStock: 100,
    stock: 100,
    stockPerPack: 100,
    diff: 0,
  },
  {
    id: 35,
    name: "Амикацин",
    mnn: "Амикацин",
    form: "пор. д/р-ра для в/в  и в/м введ.",
    dosage: "500 мг №1",
    minStock: 100,
    stock: 25,
    stockPerPack: 25,
    diff: 75,
  },
  {
    id: 36,
    name: "Амикацин",
    mnn: "Амикацин",
    form: "пор. д/р-ра для в/в и в/м введ. №50",
    dosage: "500 мг",
    minStock: 0,
    stock: 1,
    stockPerPack: 50,
    diff: -1,
  },
  {
    id: 37,
    name: "Аминокапроновая кислота",
    mnn: "Аминокапроновая кислота",
    form: "р-р д/инфузий",
    dosage: "5% 100 мл №35",
    minStock: 0,
    stock: 30,
    stockPerPack: 2999,
    diff: 0,
  },
  {
    id: 38,
    name: "Аминокапроновая кислота",
    mnn: "Аминокапроновая кислота",
    form: "р-р д/инфузий",
    dosage: "5% 100 мл №36",
    minStock: 0,
    stock: 1,
    stockPerPack: 3600,
    diff: -1,
  },
];

const padId = (value: number) => String(value).padStart(5, "0");

const buildArticle = (id: number) => `${ARTICLE_PREFIX}${padId(id + 1)}`;

const buildQrPayload = (article: string) => `${QR_BASE_URL}${article}`;

export const medicines: Medicine[] = rawMedicines.map((item) => {
  const article = buildArticle(item.id);
  return {
    ...item,
    article,
    qrPayload: buildQrPayload(article),
  };
});

const normalize = (input: string) => input.trim().toUpperCase();

export const getMedicineByArticle = (code: string) => {
  const normalized = normalize(code);
  return medicines.find((med) => med.article.toUpperCase() === normalized);
};

export const getMedicineByAnyCode = (code: string) => {
  const normalized = normalize(code);

  const byArticle = medicines.find(
    (med) => med.article.toUpperCase() === normalized
  );
  if (byArticle) {
    return byArticle;
  }

  const id = Number(normalized);
  if (!Number.isNaN(id)) {
    return medicines.find((med) => med.id === id);
  }

  return undefined;
};
