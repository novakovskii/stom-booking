<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import AirDatepicker from 'air-datepicker'
import localeRu from 'air-datepicker/locale/ru'
import { icon } from '@fortawesome/fontawesome-svg-core'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

const props = defineProps<{
  /** Дни (`YYYY-MM-DD`), в которые есть свободное время. Если не передано — доступны все дни. */
  availableDays?: Set<string>
}>()

/** Выбранный день в формате `YYYY-MM-DD`. */
const model = defineModel<string | null>({ default: null })

const el = useTemplateRef<HTMLDivElement>('el')
let dp: AirDatepicker<HTMLDivElement> | undefined

const pad = (n: number) => String(n).padStart(2, '0')
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

onMounted(() => {
  dp = new AirDatepicker(el.value!, {
    locale: localeRu,
    selectedDates: model.value ? [fromKey(model.value)] : [],
    navTitles: { days: 'MMMM, yyyy' },
    prevHtml: icon(faChevronLeft).html.join(''),
    nextHtml: icon(faChevronRight).html.join(''),
    moveToOtherMonthsOnSelect: true,
    onRenderCell: ({ date, cellType }) => {
      if (cellType !== 'day' || !props.availableDays) return
      return props.availableDays.has(toKey(date)) ? { classes: '-has-slots-' } : { disabled: true }
    },
    onSelect: ({ date }) => {
      const value = Array.isArray(date) ? date[0] : date
      model.value = value ? toKey(value) : null
    },
  })
})

watch(model, (value) => {
  if (!dp) return
  const current = dp.selectedDates[0]
  if (value === (current ? toKey(current) : null)) return
  if (value) dp.selectDate(fromKey(value), { silent: true })
  else dp.clear({ silent: true })
})

watch(
  () => props.availableDays,
  (days) => {
    if (!dp) return
    // update() заново применяет opts.selectedDates — передаём актуальную дату, иначе выделение сбросится.
    dp.update({ selectedDates: model.value ? [fromKey(model.value)] : [] }, { silent: true })
    // Если в текущем месяце нет свободных дней — показываем месяц с ближайшим свободным днём.
    if (!days?.size || model.value) return
    const view = dp.viewDate
    const prefix = `${view.getFullYear()}-${pad(view.getMonth() + 1)}`
    if (![...days].some((d) => d.startsWith(prefix))) dp.setViewDate(fromKey([...days].sort()[0]!))
  },
)

onBeforeUnmount(() => dp?.destroy())
</script>

<template>
  <div ref="el" class="booking-datepicker" />
</template>
