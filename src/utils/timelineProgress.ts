export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

export function easeInOutCubic(t: number) {
  const x = clamp(t)
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

export type TextMotion = {
  opacity: number
  y: number
  scale: number
  blur: number
  letterSpacing: number
  glow: number
  holding: boolean
  pulse: number
}

const YEAR_ENTER = 0.18
const YEAR_HOLD = 0.57
const QUOTE_ENTER = 0.18
const QUOTE_HOLD = 0.57

export function yearMotion(
  progress: number,
  start: number,
  end: number,
  overlapIn: number,
  overlapOut: number,
  millenium = false,
): TextMotion {
  const span = Math.max(0.0001, end - start)
  const enterEnd = start + span * YEAR_ENTER
  const holdEnd = start + span * (YEAR_ENTER + YEAR_HOLD)
  const appear = start - overlapIn
  const vanish = end + overlapOut
  const holdScale = millenium ? 1.12 : 1
  const hidden = {
    opacity: 0,
    y: 0,
    scale: 0.78,
    blur: 8,
    letterSpacing: 0.16,
    glow: 0,
    holding: false,
    pulse: 0,
  }

  if (progress < appear || progress > vanish) return hidden
  if (overlapIn <= 0 && progress >= start && progress <= holdEnd) {
    const holdT = clamp((progress - enterEnd) / Math.max(0.0001, holdEnd - enterEnd))
    const pulse = millenium ? Math.sin(holdT * Math.PI) * 0.035 : 0
    return {
      opacity: 1,
      y: 0,
      scale: holdScale + pulse,
      blur: 0,
      letterSpacing: 0.04,
      glow: 1,
      holding: true,
      pulse,
    }
  }

  if (progress >= enterEnd && progress <= holdEnd) {
    const holdT = clamp((progress - enterEnd) / Math.max(0.0001, holdEnd - enterEnd))
    const pulse = millenium ? Math.sin(holdT * Math.PI) * 0.035 : 0
    return {
      opacity: 1,
      y: 0,
      scale: holdScale + pulse,
      blur: 0,
      letterSpacing: 0.04,
      glow: 1,
      holding: true,
      pulse,
    }
  }

  if (progress < enterEnd) {
    const t = easeInOutCubic((progress - appear) / Math.max(0.0001, enterEnd - appear))
    return {
      opacity: t,
      y: 0,
      scale: 0.78 + (holdScale - 0.78) * t,
      blur: 8 * (1 - t),
      letterSpacing: 0.16 - 0.12 * t,
      glow: t,
      holding: false,
      pulse: 0,
    }
  }

  const t = easeInOutCubic((progress - holdEnd) / Math.max(0.0001, vanish - holdEnd))
  return {
    opacity: 1 - t,
    y: 0,
    scale: holdScale + 0.3 * t,
    blur: 6 * t,
    letterSpacing: 0.04,
    glow: 1 - t,
    holding: false,
    pulse: 0,
  }
}

export function quoteMotion(
  progress: number,
  start: number,
  end: number,
  overlapIn: number,
  overlapOut: number,
): TextMotion {
  const span = Math.max(0.0001, end - start)
  const enterEnd = start + span * QUOTE_ENTER
  const holdEnd = start + span * (QUOTE_ENTER + QUOTE_HOLD)
  const appear = start - overlapIn
  const vanish = end + overlapOut
  const hidden = {
    opacity: 0,
    y: 24,
    scale: 0.94,
    blur: 7,
    letterSpacing: 0.1,
    glow: 0,
    holding: false,
    pulse: 0,
  }

  if (progress < appear || progress > vanish) return hidden
  if (progress >= enterEnd && progress <= holdEnd) {
    return {
      opacity: 1,
      y: 0,
      scale: 1,
      blur: 0,
      letterSpacing: 0.03,
      glow: 1,
      holding: true,
      pulse: 0,
    }
  }

  if (progress < enterEnd) {
    const t = easeInOutCubic((progress - appear) / Math.max(0.0001, enterEnd - appear))
    return {
      opacity: t,
      y: 24 * (1 - t),
      scale: 0.94 + 0.06 * t,
      blur: 7 * (1 - t),
      letterSpacing: 0.1 - 0.07 * t,
      glow: t,
      holding: false,
      pulse: 0,
    }
  }

  const t = easeInOutCubic((progress - holdEnd) / Math.max(0.0001, vanish - holdEnd))
  return {
    opacity: 1 - t,
    y: -20 * t,
    scale: 1 + 0.06 * t,
    blur: 5 * t,
    letterSpacing: 0.03,
    glow: 1 - t,
    holding: false,
    pulse: 0,
  }
}

export function neighborOverlap(
  start: number,
  end: number,
  items: readonly { start: number; end: number }[],
) {
  const index = items.findIndex((item) => item.start === start && item.end === end)
  const prev = index > 0 ? items[index - 1] : undefined
  const next = index >= 0 ? items[index + 1] : undefined
  return {
    in: prev ? (prev.end - prev.start) * 0.125 : 0,
    out: next ? (next.end - next.start) * 0.125 : 0.02,
  }
}

export const YEAR_STAGES = [
  { year: '1997', start: 0.0, end: 0.047, glow: false },
  { year: '1998', start: 0.047, end: 0.093, glow: false },
  { year: '1999', start: 0.093, end: 0.14, glow: false },
  { year: '2000', start: 0.14, end: 0.186, glow: true },
  { year: '2001', start: 0.186, end: 0.233, glow: false },
  { year: '2002', start: 0.233, end: 0.279, glow: false },
  { year: '2003', start: 0.279, end: 0.325, glow: false },
  { year: '2004', start: 0.325, end: 0.372, glow: false },
  { year: '2026', start: 0.73, end: 0.776, glow: true },
] as const

export const QUOTE_STAGES = [
  {
    id: 'era',
    start: 0.372,
    end: 0.443,
    groups: [['THE ERA FADED…']],
    size: 'medium',
  },
  {
    id: 'never',
    start: 0.443,
    end: 0.533,
    groups: [['BUT THE STYLE'], ['NEVER DISAPPEARED.']],
    size: 'medium',
  },
  {
    id: 'back',
    start: 0.533,
    end: 0.61,
    groups: [['Y2K IS BACK.']],
    size: 'hero',
  },
  {
    id: 'limits',
    start: 0.61,
    end: 0.73,
    groups: [['THE STYLE RETURNED.'], ['BUT DID ITS SIZE LIMITS CHANGE?']],
    size: 'question',
  },
  {
    id: 'welcome',
    start: 0.776,
    end: 0.86,
    groups: [['WELCOME TO THE Y2K REVIVAL']],
    size: 'medium',
  },
  {
    id: 'create',
    start: 0.86,
    end: 0.925,
    groups: [['CREATE YOUR LOOK.']],
    size: 'medium',
  },
] as const

export const TEXT_FLOW = [
  { start: 0.0, end: 0.047 },
  { start: 0.047, end: 0.093 },
  { start: 0.093, end: 0.14 },
  { start: 0.14, end: 0.186 },
  { start: 0.186, end: 0.233 },
  { start: 0.233, end: 0.279 },
  { start: 0.279, end: 0.325 },
  { start: 0.325, end: 0.372 },
  { start: 0.372, end: 0.443 },
  { start: 0.443, end: 0.533 },
  { start: 0.533, end: 0.61 },
  { start: 0.61, end: 0.73 },
  { start: 0.73, end: 0.776 },
  { start: 0.776, end: 0.86 },
  { start: 0.86, end: 0.925 },
] as const

export function holdOpacity(
  progress: number,
  start: number,
  end: number,
  fadeIn = 0.2,
  fadeOut = 0.2,
) {
  if (end <= start) return 0
  if (progress < start || progress > end) return 0
  const t = (progress - start) / (end - start)
  if (t < fadeIn) return fadeIn <= 0 ? 1 : t / fadeIn
  if (t > 1 - fadeOut) return fadeOut <= 0 ? 1 : (1 - t) / fadeOut
  return 1
}

export function activeTextIndex(progress: number) {
  const p = clamp(progress)
  const index = TEXT_FLOW.findIndex((item) => p >= item.start && p < item.end)
  return index < 0 ? TEXT_FLOW.length - 1 : index
}

export const TUNNEL_SPEED = 1.42
export const WARDROBE_START = 0.925

export type TunnelMood = {
  speed: number
  streakOpacity: number
  brightness: number
  blur: number
  veil: number
  expand: number
  hideCenter: number
  darken: number
  exit: number
}

export function getTunnelMood(progress: number): TunnelMood {
  const p = clamp(progress)
  const exit = clamp((p - WARDROBE_START) / (1 - WARDROBE_START))
  const fade = clamp((exit - 0.28) / 0.72)
  return {
    speed: TUNNEL_SPEED,
    streakOpacity: 0.92 * (1 - fade),
    brightness: 1,
    blur: 0,
    veil: 0,
    expand: 0,
    hideCenter: 0.12,
    darken: 0.15,
    exit,
  }
}
