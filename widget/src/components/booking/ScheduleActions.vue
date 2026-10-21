<script setup lang="ts">
import { computed } from 'vue'
import { useBookingStore } from '@/stores/booking'

const booking = useBookingStore()

/** «Выберите дату и время» — подсказка, что ещё не выбрано. */
const missingHint = computed(() => {
  const fields = booking.missingFields
  if (!fields.length || fields.length === 4) return null
  const list = fields.length === 1 ? fields[0] : `${fields.slice(0, -1).join(', ')} и ${fields.at(-1)}`
  return `Выберите ${list}`
})
</script>

<template>
  <div class="px-4 py-4">
    <p v-if="booking.submitError" class="mb-3 text-center text-sm text-danger">{{ booking.submitError }}</p>
    <p v-else-if="missingHint" class="mb-3 text-center text-sm text-muted">{{ missingHint }}</p>
    <button
      type="button"
      class="h-14 w-full rounded-xl bg-accent text-base font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      :disabled="!booking.canProceed"
      @click="booking.goToContacts()"
    >
      Далее
    </button>
  </div>
</template>
