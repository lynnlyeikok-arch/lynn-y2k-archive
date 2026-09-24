const STORAGE_KEY = 'lynn-y2k-outfit'
const COUNT = 10

export type SizeId = 'XS' | 'S' | 'M' | 'L' | 'XL'
export type InteractionScreen = 'wardrobe' | 'size' | 'question' | 'yesResult' | 'noResult'

export type OutfitState = {
  selectedTopIndex: number
  selectedBottomIndex: number
  selectedSize: SizeId | null
  currentInteractionScreen: InteractionScreen
  yesEscapeCount: number
}

function wrap(value: number) {
  return ((value % COUNT) + COUNT) % COUNT
}

const DEFAULT_OUTFIT: OutfitState = {
  selectedTopIndex: 2,
  selectedBottomIndex: 2,
  selectedSize: null,
  currentInteractionScreen: 'wardrobe',
  yesEscapeCount: 0,
}

export function loadOutfit(): OutfitState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_OUTFIT }
    const parsed = JSON.parse(raw) as Partial<OutfitState>
    const size = parsed.selectedSize
    return {
      selectedTopIndex: wrap(Number(parsed.selectedTopIndex ?? 2)),
      selectedBottomIndex: wrap(Number(parsed.selectedBottomIndex ?? 2)),
      selectedSize: size === 'XS' || size === 'S' || size === 'M' || size === 'L' || size === 'XL' ? size : null,
      currentInteractionScreen: parsed.currentInteractionScreen ?? 'wardrobe',
      yesEscapeCount: Number(parsed.yesEscapeCount ?? 0),
    }
  } catch {
    return { ...DEFAULT_OUTFIT }
  }
}

export function saveOutfit(partial: Partial<OutfitState>) {
  const current = loadOutfit()
  const next: OutfitState = {
    selectedTopIndex: wrap(partial.selectedTopIndex ?? current.selectedTopIndex),
    selectedBottomIndex: wrap(partial.selectedBottomIndex ?? current.selectedBottomIndex),
    selectedSize: partial.selectedSize === undefined ? current.selectedSize : partial.selectedSize,
    currentInteractionScreen: partial.currentInteractionScreen ?? current.currentInteractionScreen,
    yesEscapeCount: partial.yesEscapeCount ?? current.yesEscapeCount,
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
