<script setup lang="ts">
  import { useBookingStore } from '@/stores/booking'
  import ScheduleActions from '@/components/booking/ScheduleActions.vue'
  import ContactsActions from '@/components/booking/ContactsActions.vue'
  import SuccessActions from '@/components/booking/SuccessActions.vue'

  const booking = useBookingStore()
</script>

<template>
  <footer class="the-footer shrink-0 border-t border-line bg-surface">
    <div class="mx-auto max-w-[480px]">
      <ScheduleActions v-if="booking.step === 'schedule'" />
      <ContactsActions v-else-if="booking.step === 'contacts'" />
      <SuccessActions v-else />
    </div>
  </footer>
</template>
