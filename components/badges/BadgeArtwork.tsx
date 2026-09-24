import { badgeFamilies } from '@/lib/badges/identity'
import type { BadgeCategory } from '@/lib/types'

const silhouettes = {
  shield: 'M18 10H82V53Q80 78 50 91Q20 78 18 53Z',
  round: 'M50 8A42 42 0 1 1 49.9 8Z',
  arch: 'M14 88V43A36 36 0 0 1 86 43V88Z',
  scallop: 'M50 7L63 14L78 14L85 28L93 40L88 55L89 70L75 78L65 90L50 86L35 90L25 78L11 70L12 55L7 40L15 28L22 14L37 14Z',
}
const motifs = {
  book: 'M28 35Q39 30 50 37Q61 30 72 35V66Q61 61 50 68Q39 61 28 66ZM50 37V68M34 43L43 44M57 44L66 43M34 51L43 52M57 52L66 51',
  note: 'M45 62V31L69 26V57M45 38L69 33M45 62C45 73 27 75 27 65C27 57 45 54 45 62ZM69 57C69 68 51 70 51 60C51 52 69 49 69 57Z',
  leaf: 'M31 70Q33 34 72 28Q76 65 39 67M31 70L62 40M44 57L43 44M52 49L65 50',
  waves: 'M27 45V55M38 34V66M50 26V74M62 34V66M73 45V55',
  people: 'M32 43A8 8 0 1 1 32 27A8 8 0 0 1 32 43ZM68 43A8 8 0 1 1 68 27A8 8 0 0 1 68 43ZM22 67V57Q32 45 42 57L50 64L58 57Q68 45 78 57V67M42 57V73M58 57V73',
}

/** Decorative original SVG: the adjacent name/description always carries meaning. */
export default function BadgeArtwork({category, earned = false, className = ''}: {category:BadgeCategory;earned?:boolean;className?:string}) {
  const family = badgeFamilies[category] ?? badgeFamilies.social
  return <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={`badge-art badge-ink-${family.ink} ${className}`}>
    <path d={silhouettes[family.shape]} fill="var(--surface-paper)" stroke="currentColor" strokeWidth="4" />
    <path d={silhouettes[family.shape]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" transform="translate(7 7) scale(.86)" />
    <path d={motifs[family.motif]} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    {earned ? <g><circle cx="79" cy="79" r="13" fill="var(--surface-paper)" stroke="currentColor" strokeWidth="3" /><path d="M73 79L77 83L85 74" fill="none" stroke="currentColor" strokeWidth="3" /></g> : null}
  </svg>
}
