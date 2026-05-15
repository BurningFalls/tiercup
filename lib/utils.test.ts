import { describe, it, expect } from 'vitest'
import { cn, groupItemsByTier } from '@/lib/utils'
import { TIER_ORDER } from '@/lib/constants'
import type { Item, Tier } from '@/lib/types'

describe('cn', () => {
  it('단일 클래스를 그대로 반환한다', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('여러 클래스를 공백으로 병합한다', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('Tailwind 충돌 시 나중 값이 우선된다', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('falsy 값은 무시한다', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar')
  })

  it('빈 입력은 빈 문자열을 반환한다', () => {
    expect(cn()).toBe('')
  })

  it('조건부 클래스를 처리한다', () => {
    expect(cn('base', true && 'active', false && 'inactive')).toBe('base active')
  })
})

describe('groupItemsByTier', () => {
  const makeItem = (id: string): Item => ({
    id,
    tier_cup_id: 'cup-1',
    name: `item-${id}`,
    image_url: null,
    display_order: 1,
    created_at: '2026-01-01T00:00:00Z',
  })

  it('TIER_ORDER의 모든 티어 키를 반환한다', () => {
    const result = groupItemsByTier([], {})
    expect(Object.keys(result)).toEqual(TIER_ORDER)
  })

  it('아이템이 없으면 모든 티어가 빈 배열이다', () => {
    const result = groupItemsByTier([], {})
    TIER_ORDER.forEach((tier) => {
      expect(result[tier]).toEqual([])
    })
  })

  it('아이템을 올바른 티어로 그룹핑한다', () => {
    const items = [makeItem('a'), makeItem('b'), makeItem('c')]
    const tierMap: Record<string, Tier> = { a: 'S', b: 'A', c: 'S' }
    const result = groupItemsByTier(items, tierMap)

    expect(result['S']).toHaveLength(2)
    expect(result['S'].map((i) => i.id)).toEqual(['a', 'c'])
    expect(result['A']).toHaveLength(1)
    expect(result['A'][0].id).toBe('b')
  })

  it('tierMap에 없는 아이템은 어느 티어에도 포함되지 않는다', () => {
    const items = [makeItem('x')]
    const result = groupItemsByTier(items, {})
    TIER_ORDER.forEach((tier) => {
      expect(result[tier]).toEqual([])
    })
  })

  it('? 티어 아이템을 올바르게 그룹핑한다', () => {
    const items = [makeItem('u')]
    const tierMap: Record<string, Tier> = { u: '?' }
    const result = groupItemsByTier(items, tierMap)
    expect(result['?']).toHaveLength(1)
    expect(result['?'][0].id).toBe('u')
  })
})
