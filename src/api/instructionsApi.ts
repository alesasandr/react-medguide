// src/api/instructionsApi.ts
// Псевдо-API для работы с инструкциями.
// В реальном приложении здесь были бы HTTP-запросы к серверу.

export type Instruction = {
    id: string
    title: string
    shortDescription: string
    fullText: string
}

// Временный список инструкций, имитирующий данные, полученные с сервера.
const MOCK_INSTRUCTIONS: Instruction[] = [
    {
        id: '1',
        title: 'Подготовка к анализу крови',
        shortDescription: 'Рекомендации перед сдачей анализа крови натощак.',
        fullText:
            'За 8–12 часов до сдачи анализа не принимать пищу, пить только воду. Исключить алкоголь и интенсивные физические нагрузки за сутки.'
    },
    {
        id: '2',
        title: 'Послеоперационный уход',
        shortDescription: 'Основные рекомендации по уходу после операции.',
        fullText:
            'Соблюдайте рекомендации врача по приёму лекарств, следите за состоянием шва, избегайте поднятия тяжестей и резких движений.'
    },
    {
        id: '3',
        title: 'Подготовка к УЗИ органов брюшной полости',
        shortDescription: 'Что нужно сделать перед исследованием.',
        fullText:
            'За 2–3 дня исключите продукты, вызывающие газообразование. Исследование проводится натощак, по согласованию с врачом — с приёмом воды или без.'
    }
]

// Имитация загрузки инструкций с сервера.
// Добавлена искусственная задержка, чтобы продемонстрировать состояние "загрузка".
export async function fetchInstructions(): Promise<Instruction[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return MOCK_INSTRUCTIONS
}

// Получение одной инструкции по идентификатору.
export async function fetchInstructionById(
    id: string
): Promise<Instruction | undefined> {
    const all = await fetchInstructions()
    return all.find((item) => item.id === id)
}
