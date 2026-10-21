<script setup lang="ts">
import { CONTACTS_FORM_ID, PRIVACY_POLICY_URL } from '@/lib/constants'
import { useBookingStore } from '@/stores/booking'

const booking = useBookingStore()
</script>

<template>
  <div class="px-4 pt-4 pb-5">
    <p v-if="booking.submitError" class="mb-3 text-center text-sm text-danger">{{ booking.submitError }}</p>
    <button
      type="submit"
      :form="CONTACTS_FORM_ID"
      class="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent text-base font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="booking.submitting || !booking.name.trim() || !booking.phone"
    >
      <span
        v-if="booking.submitting"
        class="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        aria-hidden="true"
      />
      Записаться
    </button>
    <p class="mt-4 text-center text-sm leading-snug text-ink/80">
      Нажимая кнопку, вы соглашаетесь с
      <a
        :href="PRIVACY_POLICY_URL"
        target="_blank"
        rel="noopener"
        class="text-accent underline-offset-2 hover:underline"
        >политикой обработки персональных данных</a
      >
    </p>
  </div>
</template>
