export const YES_DETECT_RADIUS = 88
export const YES_ESCAPE_LIMIT = 5
export const SAFE_MARGIN = 24
export const MIN_TRAVEL_FACTOR = 0.28
export const NO_GROWTH_PER_ESCAPE = 0.14
export const YES_MOVE_MS = 220
export const NO_GROW_MS = 380

export type Box = { left: number; top: number; width: number; height: number }
export type Point = { left: number; top: number }

const ZONE_COUNT = 9

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function rectsOverlap(a: Box, b: Box, pad = 12) {
  return !(
    a.left + a.width + pad < b.left ||
    b.left + b.width + pad < a.left ||
    a.top + a.height + pad < b.top ||
    b.top + b.height + pad < a.top
  )
}

export function distanceToRect(x: number, y: number, box: Box) {
  const dx = Math.max(box.left - x, 0, x - (box.left + box.width))
  const dy = Math.max(box.top - y, 0, y - (box.top + box.height))
  return Math.hypot(dx, dy)
}

export function maxNoScale(viewW: number, viewH: number, buttonW: number, buttonH: number) {
  return Math.max(
    1,
    Math.min((viewW * 0.55) / buttonW, (viewH * 0.32) / buttonH),
  )
}

export function noScaleForCount(count: number, maximum: number) {
  return Math.min(1 + count * NO_GROWTH_PER_ESCAPE, maximum)
}

export function scaledBox(left: number, top: number, width: number, height: number, scale: number): Box {
  const visualW = width * scale
  const visualH = height * scale
  return {
    left: left - (visualW - width) / 2,
    top: top - (visualH - height) / 2,
    width: visualW,
    height: visualH,
  }
}

function zoneRange(viewW: number, viewH: number, btnW: number, btnH: number, zone: number) {
  const minX = SAFE_MARGIN
  const minY = SAFE_MARGIN
  const maxX = Math.max(minX, viewW - btnW - SAFE_MARGIN)
  const maxY = Math.max(minY, viewH - btnH - SAFE_MARGIN)
  const col = zone % 3
  const row = Math.floor(zone / 3)
  const cellW = (maxX - minX) / 3
  const cellH = (maxY - minY) / 3
  return {
    minX: minX + col * cellW,
    maxX: minX + (col + 1) * cellW,
    minY: minY + row * cellH,
    maxY: minY + (row + 1) * cellH,
  }
}

function randomIn(min: number, max: number) {
  if (max <= min) return min
  return min + Math.random() * (max - min)
}

export function pickYesPosition(options: {
  viewW: number
  viewH: number
  btnW: number
  btnH: number
  current: Point
  pointer: { x: number; y: number } | null
  exclusions: Box[]
  lastZone: number | null
  prevZone: number | null
}): { point: Point; zone: number; rotate: number } {
  const { viewW, viewH, btnW, btnH, current, pointer, exclusions, lastZone, prevZone } = options
  const minX = SAFE_MARGIN
  const minY = SAFE_MARGIN
  const maxX = Math.max(minX, viewW - btnW - SAFE_MARGIN)
  const maxY = Math.max(minY, viewH - btnH - SAFE_MARGIN)
  const minTravel = Math.min(viewW, viewH) * MIN_TRAVEL_FACTOR
  const pointerBox: Box | null = pointer
    ? { left: pointer.x - 90, top: pointer.y - 90, width: 180, height: 180 }
    : null

  const zones = Array.from({ length: ZONE_COUNT }, (_, zone) => zone).sort(() => Math.random() - 0.5)
  const preferred = zones.filter((zone) => zone !== lastZone && zone !== prevZone)
  const fallback = zones.filter((zone) => zone !== lastZone)
  const order = preferred.length > 0 ? preferred.concat(fallback) : fallback.concat(zones)

  const tries: Array<{ point: Point; zone: number }> = []
  for (const zone of order) {
    const range = zoneRange(viewW, viewH, btnW, btnH, zone)
    for (let i = 0; i < 8; i += 1) {
      const left = clamp(randomIn(range.minX, Math.max(range.minX, range.maxX - btnW)), minX, maxX)
      const top = clamp(randomIn(range.minY, Math.max(range.minY, range.maxY - btnH)), minY, maxY)
      tries.push({ point: { left, top }, zone })
    }
  }

  const valid = tries.find((candidate) => {
    const box = { left: candidate.point.left, top: candidate.point.top, width: btnW, height: btnH }
    const travel = Math.hypot(candidate.point.left - current.left, candidate.point.top - current.top)
    if (travel < minTravel) return false
    if (exclusions.some((item) => rectsOverlap(box, item, 18))) return false
    if (pointerBox && rectsOverlap(box, pointerBox, 0)) return false
    return true
  })

  if (valid) {
    return {
      point: valid.point,
      zone: valid.zone,
      rotate: randomIn(-5, 5),
    }
  }

  const safePoint = {
    left: clamp(current.left < viewW / 2 ? maxX : minX, minX, maxX),
    top: clamp(current.top < viewH / 2 ? maxY : minY, minY, maxY),
  }
  return { point: safePoint, zone: lastZone === 8 ? 0 : 8, rotate: randomIn(-5, 5) }
}
