import { describe, it, expect } from 'vitest'
import { generatePlayCode, generateManageCode, generateResultCode } from '@/lib/utils/code'

const EXCLUDED_CHARS = new Set(['0', 'O', '1', 'I', 'l'])

describe('generatePlayCode', () => {
  it('6자리를 생성한다', () => {
    expect(generatePlayCode()).toHaveLength(6)
  })

  it('혼동 문자(0,O,1,I,l)를 포함하지 않는다', () => {
    for (let i = 0; i < 50; i++) {
      const code = generatePlayCode()
      for (const ch of code) {
        expect(EXCLUDED_CHARS.has(ch)).toBe(false)
      }
    }
  })

  it('호출마다 다른 값을 반환한다', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generatePlayCode()))
    expect(codes.size).toBeGreaterThan(1)
  })
})

describe('generateManageCode', () => {
  it('12자리를 생성한다', () => {
    expect(generateManageCode()).toHaveLength(12)
  })

  it('혼동 문자(0,O,1,I,l)를 포함하지 않는다', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateManageCode()
      for (const ch of code) {
        expect(EXCLUDED_CHARS.has(ch)).toBe(false)
      }
    }
  })
})

describe('generateResultCode', () => {
  it('6자리를 생성한다', () => {
    expect(generateResultCode()).toHaveLength(6)
  })

  it('혼동 문자(0,O,1,I,l)를 포함하지 않는다', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateResultCode()
      for (const ch of code) {
        expect(EXCLUDED_CHARS.has(ch)).toBe(false)
      }
    }
  })
})
