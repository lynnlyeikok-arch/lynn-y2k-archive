const MAGAZINE_ASSET_DIR = '/images/magazine'
const MAGAZINE_PAGE_COUNT = 52

export const MAGAZINE_PAGE_WIDTH = 210
export const MAGAZINE_PAGE_HEIGHT = 297

export const MAGAZINE_PAGES = Array.from({ length: MAGAZINE_PAGE_COUNT }, (_, index) => {
  const number = index + 1
  const isCover = number === 1 || number === MAGAZINE_PAGE_COUNT
  return {
    id: `magazine-${number}`,
    src: `${MAGAZINE_ASSET_DIR}/page-${String(number).padStart(2, '0')}.jpg`,
    label: number === 1 ? 'Cover' : number === MAGAZINE_PAGE_COUNT ? 'Back cover' : `Page ${number}`,
    density: isCover ? ('hard' as const) : ('soft' as const),
  }
})
