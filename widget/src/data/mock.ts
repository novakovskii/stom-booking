import type { Branch, Doctor } from '@/api/booking'

/** Демо-справочники: в реальном виджете приходят из IDENT через сервис записи. */
export const BRANCHES: Branch[] = [
  { id: 1, name: 'ул. Ленина, 24' },
  { id: 2, name: 'пр. Мира, 108' },
  { id: 3, name: 'ул. Садовая, 7' },
]

export interface MockDoctor extends Doctor {
  /** Дни недели приёма, 0 — воскресенье. */
  weekdays: number[]
  /** Часы приёма `[с, до)`. */
  hours: [number, number]
  /** Пол — для аватара-заглушки. */
  gender: 'm' | 'f'
}

// Те же врачи, что в блоке «Врачи» на сайте; вместе покрывают все филиалы и режим работы Пн–Вс.
export const DOCTORS: MockDoctor[] = [
  { id: 11, name: 'Иванова Анна Сергеевна', branchIds: [1, 3], weekdays: [1, 2, 3, 4, 5], hours: [9, 15], gender: 'f' },
  { id: 12, name: 'Петров Дмитрий Олегович', branchIds: [1, 2], weekdays: [1, 3, 5, 6], hours: [12, 20], gender: 'm' },
  { id: 13, name: 'Смирнова Елена Викторовна', branchIds: [2, 3], weekdays: [2, 4, 6], hours: [9, 18], gender: 'f' },
  { id: 14, name: 'Кузнецов Артём Игоревич', branchIds: [1, 2, 3], weekdays: [1, 2, 4, 5, 0], hours: [11, 20], gender: 'm' },
]

export const SLOT_DURATION_MINUTES = 30
export const DAYS_AHEAD = 30
