/**
 * Связь с сайтом, на который виджет встроен через iframe.
 * Сайт → виджет: `booking:open` при каждом открытии модалки.
 * Виджет → сайт: `booking:close` — просьба закрыть модалку.
 */

export const isEmbedded = window.parent !== window

export function closeWidget() {
  window.parent.postMessage({ type: 'booking:close' }, '*')
}

export function onWidgetOpen(handler: () => void) {
  window.addEventListener('message', (e) => {
    if (e.source === window.parent && e.data?.type === 'booking:open') handler()
  })
}

// Esc внутри iframe не доходит до сайта — закрываем сами, если клавишу не обработал, например, открытый селект.
if (isEmbedded) {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !e.defaultPrevented) closeWidget()
  })
}
