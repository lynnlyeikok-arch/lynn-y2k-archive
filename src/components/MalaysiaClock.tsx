import { useLayoutEffect, useState } from 'react'

const SEGMENTS: Record<string, string> = {
  '0': 'ABCEDF',
  '1': 'BC',
  '2': 'ABDEG',
  '3': 'ABCDG',
  '4': 'BCFG',
  '5': 'ACDFG',
  '6': 'ACDEFG',
  '7': 'ABC',
  '8': 'ABCDEFG',
  '9': 'ABCDFG',
}

const DIGIT_X = [0, 56, 124, 181]

function horizontal(x: number, y: number, width: number, height: number) {
  const point = height / 2
  return `M ${x + point} ${y} L ${x + width - point} ${y} L ${x + width} ${y + point} L ${x + width - point} ${y + height} L ${x + point} ${y + height} L ${x} ${y + point} Z`
}

function vertical(x: number, y: number, width: number, height: number) {
  const point = width / 2
  return `M ${x + point} ${y} L ${x + width} ${y + point} L ${x + width} ${y + height - point} L ${x + point} ${y + height} L ${x} ${y + height - point} L ${x} ${y + point} Z`
}

const SEGMENT_PATHS: Record<string, string> = {
  A: horizontal(7, 0, 36, 10),
  B: vertical(41, 6, 9, 36),
  C: vertical(41, 48, 9, 36),
  D: horizontal(7, 80, 36, 10),
  E: vertical(0, 48, 9, 36),
  F: vertical(0, 6, 9, 36),
  G: horizontal(7, 40, 36, 10),
}

function malaysiaDigits(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(date)
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00'
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00'
  return `${hour}${minute}`.replace(/\D/g, '').padStart(4, '0').slice(-4)
}

function msUntilNextMinute(date = new Date()) {
  return (60 - date.getSeconds()) * 1000 - date.getMilliseconds() + 20
}

export function MalaysiaClock() {
  const [digits, setDigits] = useState(() => malaysiaDigits())

  useLayoutEffect(() => {
    let timer = 0
    const tick = () => {
      setDigits(malaysiaDigits())
      timer = window.setTimeout(tick, msUntilNextMinute())
    }
    setDigits(malaysiaDigits())
    timer = window.setTimeout(tick, msUntilNextMinute())
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <svg
      className="personal-clock-digits"
      viewBox="0 0 231 90"
      aria-hidden="true"
    >
      {digits.split('').map((digit, index) => (
        <g key={index} transform={`translate(${DIGIT_X[index]} 0)`}>
          {(SEGMENTS[digit] ?? SEGMENTS['0']).split('').map((segment) => (
            <path key={segment} d={SEGMENT_PATHS[segment]} />
          ))}
        </g>
      ))}
      <circle cx="114.5" cy="30" r="3.4" />
      <circle cx="114.5" cy="60" r="3.4" />
    </svg>
  )
}
