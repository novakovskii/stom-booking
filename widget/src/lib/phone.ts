/** Форматирует ввод в маску `+7 (___) ___-__-__`. */
export function formatPhone(input: string): string {
  let digits = input.replace(/\D/g, '')
  if (digits.startsWith('8') || digits.startsWith('7')) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  if (!digits) return ''

  let out = '+7 (' + digits.slice(0, 3)
  if (digits.length > 3) out += ') ' + digits.slice(3, 6)
  if (digits.length > 6) out += '-' + digits.slice(6, 8)
  if (digits.length > 8) out += '-' + digits.slice(8, 10)
  return out
}

export function isPhoneComplete(value: string): boolean {
  return value.replace(/\D/g, '').length === 11
}
