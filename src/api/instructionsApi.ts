// src/api/instructionsApi.ts
import API_BASE_URL from './config'

export type Instruction = {
  id: number
  title: string
  shortText: string
  fullText: string
}

export async function fetchInstructions(): Promise<Instruction[]> {
  const res = await fetch(`${API_BASE_URL}/api/instructions/`)

  if (!res.ok) {
    throw new Error(`Failed to load instructions: ${res.status}`)
  }

  return (await res.json()) as Instruction[]
}

export async function fetchInstructionById(id: number): Promise<Instruction> {
  const res = await fetch(`${API_BASE_URL}/api/instructions/${id}/`)

  if (!res.ok) {
    throw new Error(`Failed to load instruction: ${res.status}`)
  }

  return (await res.json()) as Instruction
}
