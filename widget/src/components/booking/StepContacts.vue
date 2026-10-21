<script setup lang="ts">
import { formatPhone } from '@/lib/phone'
import { CONTACTS_FORM_ID } from '@/lib/constants'
import { CONTACT_METHODS, useBookingStore } from '@/stores/booking'
import SectionHeader from './SectionHeader.vue'

const booking = useBookingStore()

const inputClass =
  'h-14 w-full rounded-xl bg-white px-4 text-[15px] outline-none placeholder:text-muted transition-shadow focus:ring-2 focus:ring-accent/40'

function onPhoneInput(e: Event) {
  const input = e.target as HTMLInputElement
  booking.phone = formatPhone(input.value)
  input.value = booking.phone
  delete booking.fieldErrors.phone
}

function onNameInput() {
  delete booking.fieldErrors.name
}
</script>

<template>
  <form :id="CONTACTS_FORM_ID" class="px-4 pb-5" novalidate @submit.prevent="booking.submit()">
    <SectionHeader title="Причина обращения" />
    <input
      v-model="booking.reason"
      type="text"
      maxlength="500"
      placeholder="Болит передний зуб"
      aria-label="Причина обращения"
      :class="inputClass"
    />

    <SectionHeader title="Как вас зовут?" required />
    <input
      v-model="booking.name"
      type="text"
      name="name"
      autocomplete="name"
      maxlength="300"
      placeholder="Имя"
      aria-label="Имя"
      :aria-invalid="!!booking.fieldErrors.name"
      :class="[inputClass, booking.fieldErrors.name && 'ring-2 ring-danger/60']"
      @input="onNameInput"
    />
    <p v-if="booking.fieldErrors.name" class="mt-1.5 px-1 text-sm text-danger">{{ booking.fieldErrors.name }}</p>

    <SectionHeader title="Телефон для связи" required />
    <input
      :value="booking.phone"
      type="tel"
      name="phone"
      autocomplete="tel"
      inputmode="tel"
      placeholder="Номер телефона"
      aria-label="Номер телефона"
      :aria-invalid="!!booking.fieldErrors.phone"
      :class="[inputClass, booking.fieldErrors.phone && 'ring-2 ring-danger/60']"
      @input="onPhoneInput"
    />
    <p v-if="booking.fieldErrors.phone" class="mt-1.5 px-1 text-sm text-danger">{{ booking.fieldErrors.phone }}</p>

    <SectionHeader title="Как с вами связаться?" required />
    <div class="divide-y divide-line overflow-hidden rounded-xl bg-white" role="radiogroup">
      <label
        v-for="method in CONTACT_METHODS"
        :key="method.value"
        class="flex cursor-pointer items-center gap-4 px-4 py-4 text-[15px] font-medium"
      >
        <input
          v-model="booking.contactMethod"
          type="radio"
          name="contactMethod"
          :value="method.value"
          class="peer sr-only"
        />
        <span
          class="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40"
        >
          <span v-if="booking.contactMethod === method.value" class="size-2.5 rounded-full bg-accent" />
        </span>
        {{ method.label }}
      </label>
    </div>
  </form>
</template>
