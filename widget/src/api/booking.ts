/**
 * Демо-версия API записи: все данные захардкожены и генерируются в браузере, сетевых запросов нет.
 * Сигнатуры совпадают с боевым клиентом, чтобы стор и компоненты не отличались.
 */
import { BRANCHES, DAYS_AHEAD, DOCTORS, SLOT_DURATION_MINUTES } from '@/data/mock'

export interface Branch {
  id: number
  name: string
}

export interface Doctor {
  id: number
  name: string
  branchIds: number[]
}

export interface Slot {
  doctorId: number
  branchId: number
  /** ISO в часовом поясе клиники, например `2026-09-25T10:00:00+03:00`. */
  startAt: string
  endAt: string
}

export interface SlotsResponse {
  durationMinutes: number
  stepMinutes: number
  timezone: string
  items: Slot[]
}

export interface Utm {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

export interface CreateBookingBody {
  branchId: number
  doctorId: number
  startAt: string
  durationMinutes?: number
  phone: string
  fullName: string
  comment?: string
  utm?: Utm
  httpReferer?: string
}

export interface BookingResponse {
  id: string
  status: string
  createdAt: string
  deliveredAt: string | null
  planStart: string | null
  planEnd: string | null
  doctor: { id: number; name: string } | null
  branch: { id: number; name: string } | null
}

const TZ_OFFSET = '+03:00'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const pad = (n: number) => String(n).padStart(2, '0')
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const hhmm = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`

/** Детерминированный «рандом» 0..1 по строке — расписание не меняется между перезагрузками. */
function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 16777619)
  return ((h >>> 0) % 1000) / 1000
}

/** Слоты, занятые в текущей сессии демо. */
const booked = new Set<string>()
const slotKey = (doctorId: number, startAt: string) => `${doctorId}|${startAt}`

function generateSlots(): Slot[] {
  const items: Slot[] = []
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  for (let offset = 0; offset < DAYS_AHEAD; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
    const key = dayKey(day)

    for (const doctor of DOCTORS) {
      if (!doctor.weekdays.includes(day.getDay())) continue
      // Иногда врач полностью занят на день.
      if (hash(`${key}:${doctor.id}:day`) < 0.15) continue
      // В разные дни врач работает в разных филиалах.
      const branchId = doctor.branchIds[Math.floor(hash(`${key}:${doctor.id}:branch`) * doctor.branchIds.length)]!

      for (let m = doctor.hours[0] * 60; m < doctor.hours[1] * 60; m += SLOT_DURATION_MINUTES) {
        if (offset === 0 && m <= nowMinutes + 60) continue
        if (hash(`${key}:${doctor.id}:${m}`) < 0.55) continue
        const startAt = `${key}T${hhmm(m)}:00${TZ_OFFSET}`
        if (booked.has(slotKey(doctor.id, startAt))) continue
        items.push({ doctorId: doctor.id, branchId, startAt, endAt: `${key}T${hhmm(m + SLOT_DURATION_MINUTES)}:00${TZ_OFFSET}` })
      }
    }
  }
  return items
}

const toRef = (doctor?: Doctor | Branch) => (doctor ? { id: doctor.id, name: doctor.name } : null)

export const getBranches = async (): Promise<Branch[]> => {
  await delay(250)
  return BRANCHES
}

export const getDoctors = async (): Promise<Doctor[]> => {
  await delay(250)
  return DOCTORS.map(({ id, name, branchIds }) => ({ id, name, branchIds }))
}

export const getSlots = async (_params: { branchId?: number | null; doctorId?: number | null }): Promise<SlotsResponse> => {
  await delay(350)
  return { durationMinutes: SLOT_DURATION_MINUTES, stepMinutes: SLOT_DURATION_MINUTES, timezone: 'Europe/Moscow', items: generateSlots() }
}

export const createBooking = async (body: CreateBookingBody): Promise<BookingResponse> => {
  await delay(800)
  booked.add(slotKey(body.doctorId, body.startAt))
  const [h, m] = body.startAt.slice(11, 16).split(':').map(Number)
  const endMinutes = h! * 60 + m! + (body.durationMinutes ?? SLOT_DURATION_MINUTES)
  const now = new Date().toISOString()
  return {
    id: `demo-${Date.now().toString(36)}`,
    status: 'delivered',
    createdAt: now,
    deliveredAt: now,
    planStart: body.startAt,
    planEnd: `${body.startAt.slice(0, 11)}${hhmm(endMinutes)}:00${TZ_OFFSET}`,
    doctor: toRef(DOCTORS.find((d) => d.id === body.doctorId)),
    branch: toRef(BRANCHES.find((b) => b.id === body.branchId)),
  }
}
