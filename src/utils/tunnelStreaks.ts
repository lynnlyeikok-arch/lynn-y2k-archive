export type LaneKind = 'thin' | 'medium' | 'thick'

export type LaneSegment = {
  angle: number
  u0: number
  length: number
  width: number
  kind: LaneKind
  color: string
  speed: number
  overshoot: number
  laneGap: number
}

export const TUNNEL_PALETTE = [
  '#7A1646',
  '#A91C61',
  '#D72B87',
  '#FF3FA4',
  '#FF73B9',
  '#FFA8D2',
  '#FFD1E7',
  '#FFF1F8',
] as const

const TWO_PI = Math.PI * 2

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function wrapUnit(value: number) {
  const min = 0.028
  const span = 1.12
  let t = (value - min) % span
  if (t < 0) t += span
  return min + t
}

function normalizeAngle(angle: number) {
  let a = angle % TWO_PI
  if (a < 0) a += TWO_PI
  return a
}

function angularDelta(a: number, b: number) {
  let d = Math.abs(normalizeAngle(a) - normalizeAngle(b))
  if (d > Math.PI) d = TWO_PI - d
  return d
}

export function rayToRect(dx: number, dy: number, halfW: number, halfH: number) {
  const tx = Math.abs(dx) < 1e-6 ? Number.POSITIVE_INFINITY : halfW / Math.abs(dx)
  const ty = Math.abs(dy) < 1e-6 ? Number.POSITIVE_INFINITY : halfH / Math.abs(dy)
  return Math.min(tx, ty)
}

function cornerAngles(aspect: number) {
  return [
    Math.atan2(1, aspect),
    Math.atan2(1, -aspect),
    Math.atan2(-1, -aspect),
    Math.atan2(-1, aspect),
  ]
}

function separateAngles(angles: number[], minGap: number) {
  const sorted = angles.map(normalizeAngle).sort((a, b) => a - b)
  const n = sorted.length
  for (let pass = 0; pass < 10; pass += 1) {
    for (let i = 0; i < n; i += 1) {
      const prev = sorted[(i - 1 + n) % n] ?? 0
      const next = sorted[(i + 1) % n] ?? 0
      const current = sorted[i] ?? 0
      let dPrev = current - prev
      if (dPrev < 0) dPrev += TWO_PI
      let dNext = next - current
      if (dNext < 0) dNext += TWO_PI
      let nextAngle = current
      if (dPrev < minGap) nextAngle += (minGap - dPrev) * 0.5
      if (dNext < minGap) nextAngle -= (minGap - dNext) * 0.5
      sorted[i] = normalizeAngle(nextAngle)
    }
  }
  return sorted
}

function pickColor(index: number, prev: string | undefined, rand: () => number) {
  const bag = [
    ...Array.from({ length: 15 }, () => TUNNEL_PALETTE[0]),
    ...Array.from({ length: 10 }, () => TUNNEL_PALETTE[1]),
    ...Array.from({ length: 10 }, () => TUNNEL_PALETTE[2]),
    ...Array.from({ length: 25 }, () => TUNNEL_PALETTE[3]),
    ...Array.from({ length: 20 }, () => TUNNEL_PALETTE[4]),
    ...Array.from({ length: 8 }, () => TUNNEL_PALETTE[5]),
    ...Array.from({ length: 7 }, () => TUNNEL_PALETTE[6]),
    ...Array.from({ length: 5 }, () => TUNNEL_PALETTE[7]),
  ]
  let color = bag[(index * 17 + Math.floor(rand() * bag.length)) % bag.length] ?? TUNNEL_PALETTE[3]
  if (color === prev) {
    color = bag[(index * 31 + 11) % bag.length] ?? TUNNEL_PALETTE[4]
  }
  if (color === prev) {
    color = TUNNEL_PALETTE[(TUNNEL_PALETTE.indexOf(color as (typeof TUNNEL_PALETTE)[number]) + 3) % TUNNEL_PALETTE.length] ?? TUNNEL_PALETTE[3]
  }
  return color
}

function assignKinds(gaps: number[]): LaneKind[] {
  const laneCount = gaps.length
  const kinds: LaneKind[] = Array.from({ length: laneCount }, () => 'thin')
  const meanGap = gaps.reduce((sum, gap) => sum + gap, 0) / Math.max(1, laneCount)
  const ranked = gaps
    .map((gap, index) => ({ gap, index }))
    .sort((a, b) => b.gap - a.gap)
  const used = new Set<number>()
  const thickWanted = Math.round(laneCount * 0.15)
  const mediumWanted = Math.round(laneCount * 0.3)

  for (const item of ranked) {
    if (used.size >= thickWanted) break
    const prev = (item.index - 1 + laneCount) % laneCount
    const next = (item.index + 1) % laneCount
    if (used.has(item.index) || used.has(prev) || used.has(next)) continue
    if (item.gap < meanGap * 0.72) continue
    kinds[item.index] = 'thick'
    used.add(item.index)
  }

  let medium = 0
  for (const item of ranked) {
    if (medium >= mediumWanted) break
    if (kinds[item.index] !== 'thin') continue
    kinds[item.index] = 'medium'
    medium += 1
  }

  return kinds
}

export type LaneField = {
  laneCount: number
  extraPerCorner: number
  extraRatio: number
  segments: LaneSegment[]
}

export function createLaneField(baseLanes: number, extraPerCorner: number, seed = 2400): LaneField {
  const rand = mulberry32(seed + baseLanes * 13 + extraPerCorner)
  const step = TWO_PI / baseLanes
  const jitter = step * 0.1
  const angles: number[] = []

  for (let i = 0; i < baseLanes; i += 1) {
    angles.push(i * step + (rand() - 0.5) * jitter)
  }

  const sector = (18 * Math.PI) / 180
  for (const corner of cornerAngles(1366 / 765)) {
    for (let k = 0; k < extraPerCorner; k += 1) {
      const t = (k + 0.5) / extraPerCorner
      angles.push(corner - sector + t * sector * 2 + (rand() - 0.5) * sector * 0.06)
    }
  }

  const minGap = (TWO_PI / angles.length) * 0.42
  const lanes = separateAngles(angles, minGap)
  const laneCount = lanes.length
  const extraRatio = (extraPerCorner * 4) / baseLanes

  const gaps = lanes.map((angle, index) => {
    const prev = lanes[(index - 1 + laneCount) % laneCount] ?? angle
    const next = lanes[(index + 1) % laneCount] ?? angle
    return Math.min(angularDelta(angle, prev), angularDelta(angle, next))
  })
  const meanGap = gaps.reduce((sum, gap) => sum + gap, 0) / Math.max(1, gaps.length)

  const kinds = assignKinds(gaps)

  const segments: LaneSegment[] = []
  let prevColor: string | undefined

  lanes.forEach((angle, index) => {
    const kind = kinds[index] ?? 'thin'
    const laneGap = gaps[index] ?? meanGap
    const color = pickColor(index, prevColor, rand)
    prevColor = color
    const speed = 0.72 + (index % 5) * 0.05 + rand() * 0.08
    const overshoot = 1.08 + (laneGap < meanGap ? 0.06 : 0.03) + rand() * 0.04
    const mainU = 0.04 + ((index * 0.6180339887) % 1) * 0.88
    const addInner = kind !== 'thin' || index % 5 !== 0
    const innerLength = 0.045 + rand() * 0.035
    const radialGap = 0.065 + rand() * 0.03

    if (addInner) {
      segments.push({
        angle,
        u0: wrapUnit(mainU - innerLength - radialGap),
        length: innerLength,
        width: 1.05 + rand() * 1.05,
        kind: 'thin',
        color: TUNNEL_PALETTE[(index * 3 + 1) % 4] ?? '#7A1646',
        speed,
        overshoot,
        laneGap,
      })
    }

    const length =
      kind === 'thick' ? 0.48 + rand() * 0.2 : kind === 'medium' ? 0.38 + rand() * 0.18 : 0.32 + rand() * 0.16
    const width =
      kind === 'thick' ? 7.5 + rand() * 5.5 : kind === 'medium' ? 3.6 + rand() * 2.6 : 1.3 + rand() * 1.5
    segments.push({
      angle,
      u0: mainU,
      length,
      width,
      kind,
      color,
      speed,
      overshoot,
      laneGap,
    })
  })

  return { laneCount, extraPerCorner, extraRatio, segments }
}

export const DESKTOP_FIELD = createLaneField(184, 13)
export const MOBILE_FIELD = createLaneField(118, 8)
