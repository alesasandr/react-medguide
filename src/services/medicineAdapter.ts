// src/services/medicineAdapter.ts
/**
 * Адаптер для преобразования данных о лекарствах между форматами сервера и клиента
 */

// Формат данных с сервера
export interface ServerMedicine {
  id: number;
  name: string;
  mnn: string;
  form: string;
  dosage: string;
  min_stock: number;
  stock: number;
  stock_per_pack: number;
  diff: number;
  article: string;
  qr_payload: string;
}

// Локальный формат данных (совместим с существующим Medicine)
export interface LocalMedicine {
  id: number;
  name: string;
  mnn: string;
  form: string;
  dosage: string;
  minStock: number;
  stock: number;
  stockPerPack: number;
  diff: number;
  article: string;
  qrPayload: string;
}

/**
 * Преобразует данные с сервера в локальный формат
 */
export function serverToLocal(server: ServerMedicine): LocalMedicine {
  return {
    id: server.id,
    name: server.name,
    mnn: server.mnn,
    form: server.form,
    dosage: server.dosage,
    minStock: server.min_stock,
    stock: server.stock,
    stockPerPack: server.stock_per_pack,
    diff: server.diff,
    article: server.article,
    qrPayload: server.qr_payload,
  };
}

/**
 * Преобразует массив данных с сервера в локальный формат
 */
export function serverArrayToLocal(serverArray: ServerMedicine[]): LocalMedicine[] {
  return serverArray.map(serverToLocal);
}

/**
 * Преобразует локальные данные в формат сервера (для отправки)
 */
export function localToServer(local: LocalMedicine): ServerMedicine {
  return {
    id: local.id,
    name: local.name,
    mnn: local.mnn,
    form: local.form,
    dosage: local.dosage,
    min_stock: local.minStock,
    stock: local.stock,
    stock_per_pack: local.stockPerPack,
    diff: local.diff,
    article: local.article,
    qr_payload: local.qrPayload,
  };
}



