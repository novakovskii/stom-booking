import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createBooking,
  getBranches,
  getDoctors,
  getSlots,
  type BookingResponse,
  type Branch,
  type Doctor,
  type Slot,
  type Utm,
} from '@/api/booking'
import { isPhoneComplete } from '@/lib/phone'

export type Step = 'schedule' | 'contacts' | 'done'
export type ContactMethod = 'call' | 'max'

export const CONTACT_METHODS: { value: ContactMethod; label: string }[] = [
  { value: 'call', label: 'Позвонить мне' },
  { value: 'max', label: 'Написать в чате в Максе' },
]

/** `YYYY-MM-DD` из ISO-строки слота — дата в часовом поясе клиники, без пересчёта в пояс браузера. */
const slotDay = (slot: Slot) => slot.startAt.slice(0, 10)
/** `HH:mm` из ISO-строки слота. */
const slotTime = (slot: Slot) => slot.startAt.slice(11, 16)

function readUtm(): Utm | undefined {
  const params = new URLSearchParams(window.location.search)
  const utm: Utm = {}
  for (const key of ['source', 'medium', 'campaign', 'term', 'content'] as const) {
    const value = params.get(`utm_${key}`)?.trim()
    if (value) utm[key] = value.slice(0, 500)
  }
  return Object.keys(utm).length ? utm : undefined
}

export const useBookingStore = defineStore('booking', () => {
  const step = ref<Step>('schedule')

  // Справочники
  const branches = ref<Branch[]>([])
  const doctors = ref<Doctor[]>([])
  const slots = ref<Slot[]>([])
  const durationMinutes = ref<number | undefined>()
  const slotsLoaded = ref(false)
  const loadingDirectory = ref(false)
  const loadingSlots = ref(false)
  const loadError = ref<string | null>(null)

  // Шаг 1
  const branchId = ref<number | null>(null)
  const doctorId = ref<number | null>(null)
  /** `YYYY-MM-DD` */
  const date = ref<string | null>(null)
  /** `HH:mm` */
  const time = ref<string | null>(null)

  // Шаг 2
  const reason = ref('')
  const name = ref('')
  const phone = ref('')
  const contactMethod = ref<ContactMethod>('call')
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const fieldErrors = ref<Partial<Record<'name' | 'phone', string>>>({})
  const result = ref<BookingResponse | null>(null)

  type Field = 'branch' | 'doctor' | 'date' | 'time'

  /** Подходит ли слот под все выбранные поля, кроме `except`. */
  function matches(slot: Slot, except: Field): boolean {
    return (
      (except === 'branch' || branchId.value === null || slot.branchId === branchId.value) &&
      (except === 'doctor' || doctorId.value === null || slot.doctorId === doctorId.value) &&
      (except === 'date' || date.value === null || slotDay(slot) === date.value) &&
      (except === 'time' || time.value === null || slotTime(slot) === time.value)
    )
  }

  // Варианты каждого поля — значения из слотов, совместимых с остальными выбранными полями.
  const branchOptions = computed(() => {
    const ids = new Set(slots.value.filter((s) => matches(s, 'branch')).map((s) => s.branchId))
    return branches.value.filter((b) => ids.has(b.id))
  })

  const doctorOptions = computed(() => {
    const ids = new Set(slots.value.filter((s) => matches(s, 'doctor')).map((s) => s.doctorId))
    return doctors.value.filter((d) => ids.has(d.id))
  })

  const availableDays = computed(() => new Set(slots.value.filter((s) => matches(s, 'date')).map(slotDay)))

  const availableTimes = computed(() => [...new Set(slots.value.filter((s) => matches(s, 'time')).map(slotTime))].sort())

  const selectedSlot = computed(() =>
    branchId.value !== null && doctorId.value !== null && date.value !== null && time.value !== null
      ? slots.value.find((s) => matches(s, 'time') && slotTime(s) === time.value)
      : undefined,
  )

  const canProceed = computed(() => !!selectedSlot.value && !loadingSlots.value)

  /** Поля шага 1, которые ещё не выбраны (для подсказки). */
  const missingFields = computed(() =>
    [
      branchId.value === null && 'филиал',
      doctorId.value === null && 'врача',
      date.value === null && 'дату',
      time.value === null && 'время',
    ].filter((f): f is string => !!f),
  )

  /**
   * Если у филиала или врача остался единственный вариант — выбираем его.
   * Вызывается только в ответ на действие пользователя, чтобы «Сбросить» не заполняло поле обратно.
   */
  function autofill() {
    for (let changed = true; changed; ) {
      changed = false
      if (branchId.value === null && branchOptions.value.length === 1) {
        branchId.value = branchOptions.value[0]!.id
        changed = true
      }
      if (doctorId.value === null && doctorOptions.value.length === 1) {
        doctorId.value = doctorOptions.value[0]!.id
        changed = true
      }
    }
  }

  /** Сбрасывает выбранные значения, которых больше нет среди вариантов (после перезагрузки слотов). */
  function prune() {
    if (branchId.value !== null && !branchOptions.value.some((b) => b.id === branchId.value)) branchId.value = null
    if (doctorId.value !== null && !doctorOptions.value.some((d) => d.id === doctorId.value)) doctorId.value = null
    if (date.value !== null && !availableDays.value.has(date.value)) date.value = null
    if (time.value !== null && !availableTimes.value.includes(time.value)) time.value = null
  }

  function setBranch(value: number | null) {
    branchId.value = value
    if (value !== null) autofill()
  }

  function setDoctor(value: number | null) {
    doctorId.value = value
    if (value !== null) autofill()
  }

  function setDate(value: string | null) {
    date.value = value
    if (value !== null) autofill()
  }

  function setTime(value: string | null) {
    time.value = value
    if (value !== null) autofill()
  }

  async function loadDirectory() {
    loadingDirectory.value = true
    loadError.value = null
    try {
      const [b, d] = await Promise.all([getBranches(), getDoctors()])
      branches.value = b
      doctors.value = d
    } catch {
      loadError.value = 'Не удалось загрузить данные'
    } finally {
      loadingDirectory.value = false
    }
    await loadSlots()
    autofill()
  }

  async function loadSlots() {
    loadingSlots.value = true
    try {
      const res = await getSlots({})
      slots.value = res.items
      durationMinutes.value = res.durationMinutes
      slotsLoaded.value = true
      loadError.value = null
      prune()
    } catch {
      loadError.value = 'Не удалось загрузить свободное время'
    } finally {
      loadingSlots.value = false
    }
  }

  function goToContacts() {
    if (!canProceed.value) return
    submitError.value = null
    step.value = 'contacts'
  }

  function goBack() {
    submitError.value = null
    step.value = 'schedule'
  }

  async function submit() {
    const slot = selectedSlot.value
    if (!slot || branchId.value === null || doctorId.value === null) return

    fieldErrors.value = {}
    submitError.value = null
    if (!name.value.trim()) fieldErrors.value.name = 'Укажите имя'
    if (!phone.value.trim()) fieldErrors.value.phone = 'Укажите телефон'
    else if (!isPhoneComplete(phone.value)) fieldErrors.value.phone = 'Проверьте номер телефона'
    if (Object.keys(fieldErrors.value).length) return

    const method = CONTACT_METHODS.find((m) => m.value === contactMethod.value)!
    const comment = [reason.value.trim() && `Причина обращения: ${reason.value.trim()}`, `Способ связи: ${method.label}`]
      .filter(Boolean)
      .join('\n')

    submitting.value = true
    try {
      result.value = await createBooking({
        branchId: branchId.value,
        doctorId: doctorId.value,
        startAt: slot.startAt,
        durationMinutes: durationMinutes.value,
        phone: phone.value.trim(),
        fullName: name.value.trim(),
        comment,
        utm: readUtm(),
        httpReferer: document.referrer || undefined,
      })
      step.value = 'done'
    } catch {
      submitError.value = 'Не удалось отправить заявку. Попробуйте ещё раз.'
    } finally {
      submitting.value = false
    }
  }

  async function reset() {
    step.value = 'schedule'
    branchId.value = null
    doctorId.value = null
    date.value = null
    time.value = null
    reason.value = ''
    name.value = ''
    phone.value = ''
    contactMethod.value = 'call'
    submitError.value = null
    fieldErrors.value = {}
    result.value = null
    await loadSlots()
    autofill()
  }

  return {
    step,
    branches,
    doctors,
    slotsLoaded,
    loadingDirectory,
    loadingSlots,
    loadError,
    branchId,
    doctorId,
    date,
    time,
    reason,
    name,
    phone,
    contactMethod,
    submitting,
    submitError,
    fieldErrors,
    result,
    branchOptions,
    doctorOptions,
    availableDays,
    availableTimes,
    selectedSlot,
    canProceed,
    missingFields,
    loadDirectory,
    loadSlots,
    setBranch,
    setDoctor,
    setDate,
    setTime,
    goToContacts,
    goBack,
    submit,
    reset,
  }
})
