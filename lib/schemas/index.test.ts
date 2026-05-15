import { describe, it, expect } from 'vitest'
import { itemSchema, tierCupSchema, comparisonSchema, updateResultSchema } from '@/lib/schemas'

const makeFile = (size: number, type = 'image/jpeg') =>
  new File([new Uint8Array(size)], 'test.jpg', { type })

describe('itemSchema', () => {
  it('유효한 name(1자)을 통과한다', () => {
    expect(itemSchema.safeParse({ name: 'a' }).success).toBe(true)
  })

  it('유효한 name(50자)을 통과한다', () => {
    expect(itemSchema.safeParse({ name: 'a'.repeat(50) }).success).toBe(true)
  })

  it('name이 빈 문자열이면 실패한다', () => {
    expect(itemSchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('name이 51자이면 실패한다', () => {
    expect(itemSchema.safeParse({ name: 'a'.repeat(51) }).success).toBe(false)
  })

  it('image 없이도 통과한다', () => {
    expect(itemSchema.safeParse({ name: '아이템' }).success).toBe(true)
  })

  it('유효한 JPEG 이미지(1MB)를 통과한다', () => {
    const file = makeFile(1 * 1024 * 1024)
    expect(itemSchema.safeParse({ name: '아이템', image: file }).success).toBe(true)
  })

  it('이미지 크기가 5MB 초과면 실패한다', () => {
    const file = makeFile(6 * 1024 * 1024)
    const result = itemSchema.safeParse({ name: '아이템', image: file })
    expect(result.success).toBe(false)
  })

  it('허용되지 않는 MIME 타입이면 실패한다', () => {
    const file = makeFile(1024, 'image/webp')
    const result = itemSchema.safeParse({ name: '아이템', image: file })
    expect(result.success).toBe(false)
  })

  it('PNG 이미지를 통과한다', () => {
    const file = makeFile(1024, 'image/png')
    expect(itemSchema.safeParse({ name: '아이템', image: file }).success).toBe(true)
  })

  it('GIF 이미지를 통과한다', () => {
    const file = makeFile(1024, 'image/gif')
    expect(itemSchema.safeParse({ name: '아이템', image: file }).success).toBe(true)
  })
})

describe('tierCupSchema', () => {
  const makeItem = (name = '아이템') => ({ name })
  const makeItems = (count: number) => Array.from({ length: count }, (_, i) => makeItem(`아이템${i}`))

  it('유효한 title(1자)과 아이템 4개를 통과한다', () => {
    expect(tierCupSchema.safeParse({ title: '제', items: makeItems(4) }).success).toBe(true)
  })

  it('유효한 title(30자)과 아이템 64개를 통과한다', () => {
    expect(
      tierCupSchema.safeParse({ title: '제'.repeat(30), items: makeItems(64) }).success,
    ).toBe(true)
  })

  it('title이 빈 문자열이면 실패한다', () => {
    expect(tierCupSchema.safeParse({ title: '', items: makeItems(4) }).success).toBe(false)
  })

  it('title이 31자이면 실패한다', () => {
    expect(
      tierCupSchema.safeParse({ title: '제'.repeat(31), items: makeItems(4) }).success,
    ).toBe(false)
  })

  it('아이템이 3개면 실패한다', () => {
    expect(tierCupSchema.safeParse({ title: '제목', items: makeItems(3) }).success).toBe(false)
  })

  it('아이템이 65개면 실패한다', () => {
    expect(tierCupSchema.safeParse({ title: '제목', items: makeItems(65) }).success).toBe(false)
  })
})

describe('comparisonSchema', () => {
  it('유효한 winner/loser ID를 통과한다', () => {
    expect(
      comparisonSchema.safeParse({ winner_item_id: 'item-1', loser_item_id: 'item-2' }).success,
    ).toBe(true)
  })

  it('winner_item_id가 없으면 실패한다', () => {
    expect(comparisonSchema.safeParse({ loser_item_id: 'item-2' }).success).toBe(false)
  })

  it('loser_item_id가 없으면 실패한다', () => {
    expect(comparisonSchema.safeParse({ winner_item_id: 'item-1' }).success).toBe(false)
  })

  it('winner_item_id가 빈 문자열이면 실패한다', () => {
    expect(
      comparisonSchema.safeParse({ winner_item_id: '', loser_item_id: 'item-2' }).success,
    ).toBe(false)
  })

  it('loser_item_id가 빈 문자열이면 실패한다', () => {
    expect(
      comparisonSchema.safeParse({ winner_item_id: 'item-1', loser_item_id: '' }).success,
    ).toBe(false)
  })
})

describe('updateResultSchema', () => {
  const makeResult = (tier: string, tier_order = 0) => ({
    item_id: 'item-1',
    tier,
    tier_order,
  })

  it('유효한 결과 배열을 통과한다', () => {
    expect(
      updateResultSchema.safeParse({
        results: [makeResult('S', 1), makeResult('A', 1), makeResult('?', 2)],
      }).success,
    ).toBe(true)
  })

  it('모든 Tier 값(S/A/B/C/D/F/?)을 통과한다', () => {
    const tiers = ['S', 'A', 'B', 'C', 'D', 'F', '?']
    tiers.forEach((tier) => {
      expect(
        updateResultSchema.safeParse({ results: [makeResult(tier)] }).success,
      ).toBe(true)
    })
  })

  it('허용되지 않는 tier 값이면 실패한다', () => {
    expect(
      updateResultSchema.safeParse({ results: [makeResult('X')] }).success,
    ).toBe(false)
  })

  it('tier_order가 음수이면 실패한다', () => {
    expect(
      updateResultSchema.safeParse({ results: [makeResult('S', -1)] }).success,
    ).toBe(false)
  })

  it('빈 results 배열을 통과한다', () => {
    expect(updateResultSchema.safeParse({ results: [] }).success).toBe(true)
  })
})
