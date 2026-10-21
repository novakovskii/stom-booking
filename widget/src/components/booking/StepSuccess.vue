<script setup lang="ts">
import { computed } from 'vue'
import { useBookingStore } from '@/stores/booking'

const booking = useBookingStore()

/** Дата и время приёма в часовом поясе клиники (берём из строки, без пересчёта в пояс браузера). */
const when = computed(() => {
  const iso = booking.result?.planStart
  if (!iso) return null
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  const day = new Date(y!, m! - 1, d!).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' })
  return `${day}, ${iso.slice(11, 16)}`
})
</script>

<template>
  <div class="px-6 py-10 text-center">
    <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent">
      <FontAwesomeIcon icon="check" class="text-[28px]" />
    </div>
    <h3 class="mt-5 text-xl font-semibold">Заявка отправлена</h3>
    <p class="mt-2 text-[15px] text-ink/70">Администратор свяжется с вами для подтверждения записи.</p>

    <dl v-if="booking.result" class="mt-6 space-y-3 rounded-2xl bg-white p-4 text-left text-[15px]">
      <div v-if="booking.result.branch">
        <dt class="text-sm text-muted">Филиал</dt>
        <dd class="font-medium">{{ booking.result.branch.name }}</dd>
      </div>
      <div v-if="booking.result.doctor">
        <dt class="text-sm text-muted">Врач</dt>
        <dd class="font-medium">{{ booking.result.doctor.name }}</dd>
      </div>
      <div v-if="when">
        <dt class="text-sm text-muted">Дата и время</dt>
        <dd class="font-medium first-letter:uppercase">{{ when }}</dd>
      </div>
    </dl>
  </div>
</template>
