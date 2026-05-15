import { describe, it, expect } from 'vitest'
import { formatDuration, calcDurationSeconds } from '@/lib/utils/date'

describe('formatDuration', () => {
  it('0초를 반환한다', () => {
    expect(formatDuration(0)).toBe('0초')
  })

  it('59초 이하는 "N초" 형식이다', () => {
    expect(formatDuration(59)).toBe('59초')
  })

  it('정확히 60초는 "1분 0초"이다', () => {
    expect(formatDuration(60)).toBe('1분 0초')
  })

  it('1분 30초를 올바르게 포맷한다', () => {
    expect(formatDuration(90)).toBe('1분 30초')
  })

  it('2분 5초를 올바르게 포맷한다', () => {
    expect(formatDuration(125)).toBe('2분 5초')
  })

  it('분이 0일 때 "N분 0초" 형식이 아닌 "N초" 형식이다', () => {
    expect(formatDuration(45)).toBe('45초')
    expect(formatDuration(45)).not.toContain('분')
  })
})

describe('calcDurationSeconds', () => {
  const start = '2026-01-01T00:00:00.000Z'

  it('completedAt이 null이면 0을 반환한다', () => {
    expect(calcDurationSeconds(start, null)).toBe(0)
  })

  it('30초 차이를 올바르게 계산한다', () => {
    expect(calcDurationSeconds(start, '2026-01-01T00:00:30.000Z')).toBe(30)
  })

  it('1분 30초 차이를 올바르게 계산한다', () => {
    expect(calcDurationSeconds(start, '2026-01-01T00:01:30.000Z')).toBe(90)
  })

  it('소수점 이하는 버린다(floor)', () => {
    expect(calcDurationSeconds(start, '2026-01-01T00:00:00.999Z')).toBe(0)
    expect(calcDurationSeconds(start, '2026-01-01T00:00:01.999Z')).toBe(1)
  })

  it('잘못된 날짜 문자열이면 0을 반환한다', () => {
    expect(calcDurationSeconds('invalid', '2026-01-01T00:00:30.000Z')).toBe(0)
    expect(calcDurationSeconds(start, 'invalid')).toBe(0)
  })
})
