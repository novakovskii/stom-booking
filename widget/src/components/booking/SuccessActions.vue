<script setup lang="ts">
import { closeWidget, isEmbedded } from '@/lib/embed'
import { useBookingStore } from '@/stores/booking'

const booking = useBookingStore()
</script>

<template>
  <div class="space-y-3 px-4 py-4">
    <button
      v-if="isEmbedded"
      type="button"
      class="h-14 w-full rounded-xl bg-accent text-base font-semibold text-white transition-colors hover:bg-accent-hover cursor-pointer"
      @click="closeWidget()"
    >
      Готово
    </button>
    <button
      type="button"
      class="h-14 w-full rounded-xl bg-white text-base font-medium transition-colors hover:bg-white/70 cursor-pointer"
      @click="booking.reset()"
    >
      Записаться ещё раз
    </button>
  </div>
</template>
