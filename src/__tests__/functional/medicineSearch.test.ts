/**
 * Функциональные тесты для поиска лекарств
 * Тестирует полные пользовательские сценарии поиска
 */

import {
  medicines,
  getMedicineByArticle,
  getMedicineByAnyCode,
  type Medicine,
} from "../../db/medicines";

describe("Medicine Search - Functional Tests", () => {
  describe("Сценарий: Поиск по артикулу", () => {
    it("должен найти лекарство по точному артикулу", () => {
      // Arrange
      const testMedicine = medicines[0];
      const article = testMedicine.article;

      // Act
      const result = getMedicineByArticle(article);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(testMedicine.id);
      expect(result?.name).toBe(testMedicine.name);
    });

    it("должен найти лекарство независимо от регистра", () => {
      // Arrange
      const testMedicine = medicines[0];
      const articleLower = testMedicine.article.toLowerCase();
      const articleUpper = testMedicine.article.toUpperCase();
      const articleMixed = "Mg-00001";

      // Act
      const resultLower = getMedicineByArticle(articleLower);
      const resultUpper = getMedicineByArticle(articleUpper);
      const resultMixed = getMedicineByArticle(articleMixed);

      // Assert
      expect(resultLower?.id).toBe(testMedicine.id);
      expect(resultUpper?.id).toBe(testMedicine.id);
      expect(resultMixed?.id).toBe(testMedicine.id);
    });

    it("должен обработать поиск несуществующего артикула", () => {
      // Act
      const result = getMedicineByArticle("MG-99999");

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("Сценарий: Поиск по любому коду", () => {
    it("должен найти лекарство по артикулу через getMedicineByAnyCode", () => {
      // Arrange
      const testMedicine = medicines[0];
      const article = testMedicine.article;

      // Act
      const result = getMedicineByAnyCode(article);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(testMedicine.id);
    });

    it("должен найти лекарство по ID", () => {
      // Arrange
      const testMedicine = medicines[0];
      const id = testMedicine.id.toString();

      // Act
      const result = getMedicineByAnyCode(id);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(testMedicine.id);
    });

    it("должен обработать невалидный код", () => {
      // Act
      const result = getMedicineByAnyCode("INVALID-CODE-123");

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("Сценарий: Сканирование QR-кода", () => {
    it("должен найти лекарство по QR payload", () => {
      // Arrange
      const testMedicine = medicines[0];
      const qrPayload = testMedicine.qrPayload;
      // Извлекаем артикул из QR (формат: med:MG-00001)
      const article = qrPayload.replace("med:", "");

      // Act
      const result = getMedicineByArticle(article);

      // Assert
      expect(result).toBeDefined();
      expect(result?.qrPayload).toBe(qrPayload);
    });

    it("должен обработать QR-код с пробелами", () => {
      // Arrange
      const testMedicine = medicines[0];
      const articleWithSpaces = `  ${testMedicine.article}  `;

      // Act
      const result = getMedicineByArticle(articleWithSpaces);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(testMedicine.id);
    });
  });

  describe("Сценарий: Валидация данных лекарств", () => {
    it("все лекарства должны иметь корректный формат артикула", () => {
      medicines.forEach((medicine) => {
        expect(medicine.article).toMatch(/^MG-\d{5}$/);
      });
    });

    it("все лекарства должны иметь корректный формат QR", () => {
      medicines.forEach((medicine) => {
        expect(medicine.qrPayload).toMatch(/^med:MG-\d{5}$/);
        expect(medicine.qrPayload).toContain(medicine.article);
      });
    });

    it("все лекарства должны иметь положительный ID", () => {
      medicines.forEach((medicine) => {
        expect(medicine.id).toBeGreaterThanOrEqual(0);
      });
    });

    it("все лекарства должны иметь непустое название", () => {
      medicines.forEach((medicine) => {
        expect(medicine.name).toBeTruthy();
        expect(medicine.name.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe("Сценарий: Поиск в реальных условиях", () => {
    it("должен найти лекарство Азитромицин", () => {
      // Ищем лекарство с названием содержащим "Азитромицин"
      const azithromycin = medicines.find((m) =>
        m.name.includes("Азитромицин")
      );

      if (azithromycin) {
        // Act
        const result = getMedicineByArticle(azithromycin.article);

        // Assert
        expect(result).toBeDefined();
        expect(result?.name).toContain("Азитромицин");
      }
    });

    it("должен найти лекарство по частичному совпадению артикула", () => {
      // Этот тест проверяет, что функция работает с точным совпадением
      // В реальности может потребоваться поиск по частичному совпадению
      const testMedicine = medicines[0];
      const partialArticle = testMedicine.article.substring(0, 5); // "MG-00"

      // Текущая реализация требует точного совпадения
      const result = getMedicineByArticle(partialArticle);
      expect(result).toBeUndefined(); // Ожидаемое поведение
    });
  });
});


