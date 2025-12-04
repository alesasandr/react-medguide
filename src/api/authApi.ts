// src/api/authApi.ts
import { api } from "./client";

export interface UserProfile {
  id: number;
  user: number;
  full_name: string;
  is_staff: boolean;
  is_doctor: boolean;
  avatar_url: string | null;
  specialty: string;
  work_location: string;
  employee_id: string;
}

export interface IssuedMedicine {
  id: number;
  medicine: {
    id: number;
    name: string;
    mnn: string;
    form: string;
    dosage: string;
    article: string;
    qr_payload: string;
  };
  quantity: number;
  issued_at: string;
}

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  is_staff: boolean;
};

export async function registerUser(payload: RegisterPayload) {
  const res = await api.post("/auth/register/", payload);
  return res.data;
}

export async function loginUser(email: string, password: string) {
  const res = await api.post("/auth/login/", { email, password });
  return res.data;
}

// Получить профиль текущего пользователя
export async function getProfile() {
  const res = await api.get("/profiles/me/");
  return res.data as UserProfile;
}

// Обновить профиль текущего пользователя
export async function updateProfile(data: Partial<UserProfile>) {
  const res = await api.patch("/profiles/update_me/", data);
  return res.data as UserProfile;
}

// Получить историю выданных препаратов
export async function getIssuedMedicines() {
  const res = await api.get("/issued-medicines/my_issued/");
  return res.data as IssuedMedicine[];
}

// Добавить запись о выданном препарате
export async function addIssuedMedicine(medicineId: number, quantity: number) {
  const res = await api.post("/issued-medicines/", {
    medicine_id: medicineId,
    quantity,
  });
  return res.data as IssuedMedicine;
}
