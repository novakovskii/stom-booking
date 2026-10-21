<script setup lang="ts" generic="T extends { id: number }">
import { computed, nextTick, onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    options: T[]
    placeholder?: string
    loading?: boolean
    emptyMessage?: string
    ariaLabel?: string
  }>(),
  { placeholder: 'Не выбран', emptyMessage: 'Нет вариантов' },
)

/** `id` выбранной опции. */
const model = defineModel<number | null>({ default: null })

defineSlots<{
  value(props: { option: T }): unknown
  option(props: { option: T; selected: boolean }): unknown
}>()

const id = useId()
const root = useTemplateRef<HTMLDivElement>('root')
const list = useTemplateRef<HTMLUListElement>('list')

const open = ref(false)
const activeIndex = ref(-1)

const selected = computed(() => props.options.find((o) => o.id === model.value))
const optionId = (index: number) => `${id}-option-${index}`

function show() {
  if (open.value) return
  open.value = true
  const index = props.options.findIndex((o) => o.id === model.value)
  activeIndex.value = index >= 0 ? index : 0
  void nextTick(scrollToActive)
}

function hide() {
  open.value = false
}

function select(option: T) {
  model.value = option.id
  hide()
}

function move(delta: number) {
  if (!open.value) return show()
  const count = props.options.length
  if (!count) return
  activeIndex.value = (activeIndex.value + delta + count) % count
  scrollToActive()
}

function scrollToActive() {
  list.value?.querySelector<HTMLElement>(`#${CSS.escape(optionId(activeIndex.value))}`)?.scrollIntoView({ block: 'nearest' })
}

function onKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      e.preventDefault()
      move(-1)
      break
    case 'Home':
    case 'End':
      if (!open.value) return
      e.preventDefault()
      activeIndex.value = e.key === 'Home' ? 0 : props.options.length - 1
      scrollToActive()
      break
    case 'Enter':
    case ' ': {
      e.preventDefault()
      const option = props.options[activeIndex.value]
      if (open.value && option) select(option)
      else show()
      break
    }
    case 'Escape':
      if (open.value) {
        e.preventDefault()
        hide()
      }
      break
    case 'Tab':
      hide()
      break
  }
}

function onDocumentPointerDown(e: PointerEvent) {
  if (!root.value?.contains(e.target as Node)) hide()
}

watch(open, (value) => {
  if (value) document.addEventListener('pointerdown', onDocumentPointerDown)
  else document.removeEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-label="ariaLabel"
      :aria-expanded="open"
      :aria-controls="`${id}-list`"
      :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
      class="flex min-h-14 w-full cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 text-left outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-accent/40"
      :class="{ 'ring-2 ring-accent/40': open }"
      @click="open ? hide() : show()"
      @keydown="onKeydown"
    >
      <span class="min-w-0 flex-1">
        <slot v-if="selected" name="value" :option="selected" />
        <span v-else class="text-muted">{{ placeholder }}</span>
      </span>
      <span
        v-if="loading"
        class="size-4 shrink-0 animate-spin rounded-full border-2 border-muted/40 border-t-muted"
        aria-hidden="true"
      />
      <FontAwesomeIcon
        v-else
        icon="chevron-down"
        class="shrink-0 text-sm text-muted transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <Transition
      enter-from-class="opacity-0 -translate-y-1"
      enter-active-class="transition duration-150"
      leave-active-class="transition duration-100"
      leave-to-class="opacity-0"
    >
      <ul
        v-show="open"
        :id="`${id}-list`"
        ref="list"
        role="listbox"
        :aria-label="ariaLabel"
        class="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-xl bg-white py-1 shadow-xl ring-1 ring-black/5"
      >
        <li
          v-for="(option, index) in options"
          :id="optionId(index)"
          :key="option.id"
          role="option"
          :aria-selected="option.id === model"
          class="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors"
          :class="[index === activeIndex && 'bg-surface', option.id === model && 'text-accent']"
          @mousemove="activeIndex = index"
          @click="select(option)"
        >
          <slot name="option" :option="option" :selected="option.id === model" />
        </li>
        <li v-if="!options.length" class="px-4 py-3 text-muted">{{ emptyMessage }}</li>
      </ul>
    </Transition>
  </div>
</template>
