<script setup lang="ts">
defineProps<{ title: string; required?: boolean; resettable?: boolean }>()
defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="flex items-baseline justify-between gap-3 px-1 pt-5 pb-3">
    <h3 class="text-[15px] font-medium text-ink">
      {{ title }}<span v-if="required" class="ml-0.5 align-super text-xs text-danger">*</span>
    </h3>
    <button
      v-if="resettable"
      type="button"
      class="text-sm text-muted transition-colors hover:text-ink"
      @click="$emit('reset')"
    >
      Сбросить
    </button>
  </div>
</template>
