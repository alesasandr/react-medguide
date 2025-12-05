/**
 * Модульные тесты для medicines.ts
 * Тестирует работу с данными о лекарствах
 */

import {
  medicines,
  getMedicineByArticle,
  getMedicineByAnyCode,
  type Medicine,
} from "../../db/medicines";

describe("medicines - Unit Tests", () => {
  describe("medicines array", () => {
    it("должен содержать массив лекарств", () => {
      expect(Array.isArray(medicines)).toBe(true);
      expect(medicines.length).toBeGreaterThan(0);
    });

    it("каждое лекарство должно иметь все обязательные поля", () => {
      medicines.forEach((med) => {
        expect(med).toHaveProperty("id");
        expect(med).toHaveProperty("name");
        expect(med).toHaveProperty("mnn");
        expect(med).toHaveProperty("form");
        expect(med).toHaveProperty("dosage");
        expect(med).toHaveProperty("article");
        expect(med).toHaveProperty("qrPayload");
        expect(med).toHaveProperty("minStock");
        expect(med).toHaveProperty("stock");
        expect(med).toHaveProperty("stockPerPack");
        expect(med).toHaveProperty("diff");
      });
    });

    it("артикулы должны быть в формате MG-XXXXX", () => {
      medicines.forEach((med) => {
        expect(med.article).toMatch(/^MG-\d{5}$/);
      });
    });

    it("QR payload должен начинаться с med:", () => {
      medicines.forEach((med) => {
        expect(med.qrPayload).toMatch(/^med:/);
        expect(med.qrPayload).toContain(med.article);
      });
    });
  });

  describe("getMedicineByArticle", () => {
    it("должен найти лекарство по артикулу", () => {
      // Arrange
      const firstMedicine = medicines[0];
      const article = firstMedicine.article;

      // Act
      const result = getMedicineByArticle(article);

      // Assert
      expect(result).toBeDefined();
      expect(result?.article).toBe(article);
    });

    it("должен быть case-insensitive", () => {
      // Arrange
      const firstMedicine = medicines[0];
      const articleLower = firstMedicine.article.toLowerCase();
      const articleUpper = firstMedicine.article.toUpperCase();

      // Act
      const resultLower = getMedicineByArticle(articleLower);
      const resultUpper = getMedicineByArticle(articleUpper);

      // Assert
      expect(resultLower).toBeDefined();
      expect(resultUpper).toBeDefined();
      expect(resultLower?.article).toBe(firstMedicine.article);
      expect(resultUpper?.article).toBe(firstMedicine.article);
    });

    it("должен вернуть undefined если лекарство не найдено", () => {
      // Act
      const result = getMedicineByArticle("MG-99999");

      // Assert
      expect(result).toBeUndefined();
    });

    it("должен обрабатывать пробелы в артикуле", () => {
      // Arrange
      const firstMedicine = medicines[0];
      const articleWithSpaces = `  ${firstMedicine.article}  `;

      // Act
      const result = getMedicineByArticle(articleWithSpaces);

      // Assert
      expect(result).toBeDefined();
      expect(result?.article).toBe(firstMedicine.article);
    });
  });

  describe("getMedicineByAnyCode", () => {
    it("должен найти лекарство по артикулу", () => {
      // Arrange
      const firstMedicine = medicines[0];
      const article = firstMedicine.article;

      // Act
      const result = getMedicineByAnyCode(article);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(firstMedicine.id);
    });

    it("должен найти лекарство по ID", () => {
      // Arrange
      const firstMedicine = medicines[0];
      const id = firstMedicine.id.toString();

      // Act
      const result = getMedicineByAnyCode(id);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(firstMedicine.id);
    });

    it("должен вернуть undefined для несуществующего кода", () => {
      // Act
      const result = getMedicineByAnyCode("INVALID-CODE");

      // Assert
      expect(result).toBeUndefined();
    });

    it("должен обрабатывать числовые строки как ID", () => {
      // Arrange
      const testId = 0;
      const medicine = medicines.find((m) => m.id === testId);

      if (medicine) {
        // Act
        const result = getMedicineByAnyCode(testId.toString());

        // Assert
        expect(result).toBeDefined();
        expect(result?.id).toBe(testId);
      }
    });
  });
});





