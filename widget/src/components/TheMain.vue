<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useBookingStore } from '@/stores/booking'
  import StepSchedule from '@/components/booking/StepSchedule.vue'
  import StepContacts from '@/components/booking/StepContacts.vue'
  import StepSuccess from '@/components/booking/StepSuccess.vue'

  const booking = useBookingStore()

  onMounted(() => booking.loadDirectory())
</script>

<template>
  <main class="the-main min-h-0 flex-1 overflow-y-auto">
    <div class="mx-auto max-w-[480px]">
      <StepSchedule v-if="booking.step === 'schedule'" />
      <StepContacts v-else-if="booking.step === 'contacts'" />
      <StepSuccess v-else />
    </div>
  </main>
</template>
