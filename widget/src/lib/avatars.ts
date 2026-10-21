import { DOCTORS } from '@/data/mock'

const BACKGROUNDS = ['#d4ecd6', '#dfe6f5', '#f5e3d4', '#ead9f2']
const HAIR = ['#4a3426', '#2b2522', '#8a5a36', '#5c4033']

/** Силуэт врача в халате; у женщин — длинные волосы. */
function silhouette(gender: 'm' | 'f', bg: string, hair: string): string {
  const hairBack = gender === 'f' ? `<path d="M27 46c0-17 9-27 21-27s21 10 21 27v24c0 4-3 6-7 6H34c-4 0-7-2-7-6z" fill="${hair}"/>` : ''
  const hairFront =
    gender === 'f'
      ? `<path d="M33 45c0-14 6-22 15-22s15 8 15 22c-6-2-11-7-13-13-3 7-9 11-17 13z" fill="${hair}"/>`
      : `<path d="M33 43c-1-14 6-21 15-21s16 7 15 21c-2-6-7-10-15-10s-13 4-15 10z" fill="${hair}"/>`
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 16 76 76">` +
    `<rect width="96" height="96" fill="${bg}"/>` +
    hairBack +
    `<rect x="42" y="56" width="12" height="16" fill="#e8b994"/>` +
    `<path d="M12 96c2-17 16-25 36-25s34 8 36 25z" fill="#fff"/>` +
    `<path d="M40 71l8 13 8-13z" fill="#7fb3ac"/>` +
    `<ellipse cx="48" cy="44" rx="15" ry="17" fill="#f1c9a5"/>` +
    hairFront +
    `</svg>`
  )
}

/** Фото-заглушка врача по полу (SVG data URI — без сетевых запросов). */
export function doctorAvatar(doctorId: number): string {
  const doctor = DOCTORS.find((d) => d.id === doctorId)
  const svg = silhouette(doctor?.gender ?? 'm', BACKGROUNDS[doctorId % BACKGROUNDS.length]!, HAIR[doctorId % HAIR.length]!)
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
