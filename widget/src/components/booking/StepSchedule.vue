<script setup lang="ts">
import BaseSelect from '@/components/BaseSelect.vue'
import DatePicker from '@/components/DatePicker.vue'
import { doctorAvatar } from '@/lib/avatars'
import { useBookingStore } from '@/stores/booking'
import SectionHeader from './SectionHeader.vue'

const booking = useBookingStore()
</script>

<template>
  <div class="px-4 pb-5">
    <p v-if="booking.loadError" class="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
      {{ booking.loadError }}
      <button type="button" class="ml-1 underline" @click="booking.loadDirectory()">Повторить</button>
    </p>

    <SectionHeader title="Выберите филиал" :resettable="booking.branchId !== null" @reset="booking.setBranch(null)" />
    <BaseSelect
      :model-value="booking.branchId"
      :options="booking.branchOptions"
      :loading="booking.loadingDirectory"
      empty-message="Нет филиалов"
      aria-label="Филиал"
      @update:model-value="booking.setBranch"
    >
      <template #value="{ option }">
        <span class="block truncate font-medium">{{ option.name }}</span>
      </template>
      <template #option="{ option }">
        <span class="font-medium">{{ option.name }}</span>
      </template>
    </BaseSelect>

    <SectionHeader title="Выберите врача" :resettable="booking.doctorId !== null" @reset="booking.setDoctor(null)" />
    <BaseSelect
      :model-value="booking.doctorId"
      :options="booking.doctorOptions"
      :loading="booking.loadingDirectory"
      empty-message="Нет врачей"
      aria-label="Врач"
      @update:model-value="booking.setDoctor"
    >
      <template #value="{ option }">
        <span class="flex items-center gap-3">
          <img :src="doctorAvatar(option.id)" alt="" class="size-9 shrink-0 rounded-full bg-surface object-cover" />
          <span class="truncate font-medium">{{ option.name }}</span>
        </span>
      </template>
      <template #option="{ option }">
        <img :src="doctorAvatar(option.id)" alt="" class="size-9 shrink-0 rounded-full bg-surface object-cover" />
        <span class="font-medium">{{ option.name }}</span>
      </template>
    </BaseSelect>

    <SectionHeader title="Выберите дату" :resettable="booking.date !== null" @reset="booking.setDate(null)" />
    <div class="rounded-2xl bg-white p-4" :class="{ 'opacity-60': booking.loadingSlots }">
      <DatePicker
        :model-value="booking.date"
        :available-days="booking.slotsLoaded ? booking.availableDays : undefined"
        @update:model-value="booking.setDate"
      />
    </div>

    <SectionHeader title="Выберите время" :resettable="booking.time !== null" @reset="booking.setTime(null)" />
    <div class="rounded-2xl bg-white p-4">
      <p v-if="!booking.availableTimes.length" class="py-2 text-center text-sm text-muted">
        {{ booking.loadingSlots ? 'Загрузка…' : 'Нет свободного времени' }}
      </p>
      <div v-else class="grid grid-cols-4 gap-2.5">
        <button
          v-for="t in booking.availableTimes"
          :key="t"
          type="button"
          class="h-10 cursor-pointer rounded-lg text-[15px] font-medium transition-colors"
          :class="t === booking.time ? 'bg-accent text-white' : 'bg-accent-soft text-ink hover:bg-accent-soft-hover'"
          :aria-pressed="t === booking.time"
          @click="booking.setTime(t === booking.time ? null : t)"
        >
          {{ t }}
        </button>
      </div>
    </div>
  </div>
</template>
