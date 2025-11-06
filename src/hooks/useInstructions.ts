// src/hooks/useInstructions.ts
// Кастомный хук для загрузки инструкций и управления состояниями:
// загрузка, успех, ошибка.

import { useEffect, useState } from 'react'
import { fetchInstructions, Instruction } from '../api/instructionsApi'

export function useInstructions() {
    const [instructions, setInstructions] = useState<Instruction[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const load = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const data = await fetchInstructions()
                // Проверка isMounted нужна, чтобы избежать обновления состояния после размонтирования.
                if (isMounted) {
                    setInstructions(data)
                }
            } catch (e) {
                if (isMounted) {
                    setError('Не удалось загрузить инструкции')
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        load()

        return () => {
            isMounted = false
        }
    }, [])

    return {
        instructions,
        isLoading,
        error
    }
}
