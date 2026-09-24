export const MOODBOARD_ASSET_DIR = '/assets/moodboard'

export const PAGE_VIEWBOX_WIDTH = 1024.5
export const PAGE_VIEWBOX_HEIGHT = 576
export const PAGE_RATIO = PAGE_VIEWBOX_WIDTH / PAGE_VIEWBOX_HEIGHT

export const MOODBOARD_PAGES = [
  {
    id: 'cover',
    src: `${MOODBOARD_ASSET_DIR}/moodboard front page.svg`,
    label: 'Cover',
    density: 'hard' as const,
  },
  ...Array.from({ length: 24 }, (_, index) => ({
    id: `page-${index + 1}`,
    src: `${MOODBOARD_ASSET_DIR}/Page ${index + 1}.svg`,
    label: `Page ${index + 1}`,
    density: 'soft' as const,
  })),
  {
    id: 'back',
    src: `${MOODBOARD_ASSET_DIR}/moodboard back page.svg`,
    label: 'Back cover',
    density: 'hard' as const,
  },
] as const

export const MOODBOARD_PAGE_COUNT = MOODBOARD_PAGES.length
export const LAST_PAGE = MOODBOARD_PAGE_COUNT - 1
