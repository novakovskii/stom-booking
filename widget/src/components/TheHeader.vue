<script setup lang="ts">
  import { closeWidget, isEmbedded } from '@/lib/embed'
  import { useBookingStore } from '@/stores/booking'

  const booking = useBookingStore()

  const iconButtonClass =
    'absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-ink transition-colors hover:bg-line/60 disabled:opacity-50 cursor-pointer'
</script>

<template>
  <header class="the-header shrink-0 border-b border-line bg-surface">
    <div class="relative mx-auto max-w-[480px] px-14 py-4 text-center">
      <button
        v-if="booking.step === 'contacts'"
        type="button"
        aria-label="Назад"
        :class="[iconButtonClass, 'left-3']"
        :disabled="booking.submitting"
        @click="booking.goBack()"
      >
        <FontAwesomeIcon icon="chevron-left" class="text-lg" />
      </button>
      <h1 class="text-lg font-semibold">Онлайн-запись</h1>
      <button v-if="isEmbedded" type="button" aria-label="Закрыть" :class="[iconButtonClass, 'right-3']" @click="closeWidget()">
        <FontAwesomeIcon icon="xmark" class="text-xl" />
      </button>
    </div>
  </header>
</template>
