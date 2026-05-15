import { describe, it, expect } from 'vitest'
import { buildDirectedGraph, calculateLevels, assignTiers } from '@/lib/utils/topological-sort'

describe('buildDirectedGraph', () => {
  it('비교 없으면 모든 노드에 빈 Set을 반환한다', () => {
    const graph = buildDirectedGraph(['a', 'b'], [])
    expect(graph.get('a')?.size).toBe(0)
    expect(graph.get('b')?.size).toBe(0)
  })

  it('winner → loser 엣지를 올바르게 구성한다', () => {
    const graph = buildDirectedGraph(['a', 'b', 'c'], [
      { winner_item_id: 'a', loser_item_id: 'b' },
      { winner_item_id: 'a', loser_item_id: 'c' },
    ])
    expect(graph.get('a')).toEqual(new Set(['b', 'c']))
    expect(graph.get('b')?.size).toBe(0)
  })

  it('동일 쌍 중복 비교 시 엣지가 중복되지 않는다', () => {
    const graph = buildDirectedGraph(['a', 'b'], [
      { winner_item_id: 'a', loser_item_id: 'b' },
      { winner_item_id: 'a', loser_item_id: 'b' },
    ])
    expect(graph.get('a')?.size).toBe(1)
  })
})

describe('calculateLevels', () => {
  it('단방향 A→B: A level=1, B level=0', () => {
    const graph = buildDirectedGraph(['a', 'b'], [
      { winner_item_id: 'a', loser_item_id: 'b' },
    ])
    const levels = calculateLevels(graph, ['a', 'b'])
    expect(levels.get('a')).toBe(1)
    expect(levels.get('b')).toBe(0)
  })

  it('체인 A→B→C: A level=2, B level=1, C level=0', () => {
    const graph = buildDirectedGraph(['a', 'b', 'c'], [
      { winner_item_id: 'a', loser_item_id: 'b' },
      { winner_item_id: 'b', loser_item_id: 'c' },
    ])
    const levels = calculateLevels(graph, ['a', 'b', 'c'])
    expect(levels.get('a')).toBe(2)
    expect(levels.get('b')).toBe(1)
    expect(levels.get('c')).toBe(0)
  })

  it('비교 없는 독립 노드는 level=0이다', () => {
    const graph = buildDirectedGraph(['a', 'b', 'c'], [])
    const levels = calculateLevels(graph, ['a', 'b', 'c'])
    expect(levels.get('a')).toBe(0)
    expect(levels.get('b')).toBe(0)
    expect(levels.get('c')).toBe(0)
  })

  it('여러 winner가 같은 loser를 이기면 max(level) 적용', () => {
    // a→c, b→c: c의 winner(a,b)는 각각 level=1
    // a도 b를 이기면: a→b→c, a도 c를 이김
    // a: level=2 (b→c 거쳐서), b: level=1, c: level=0
    const graph = buildDirectedGraph(['a', 'b', 'c'], [
      { winner_item_id: 'a', loser_item_id: 'b' },
      { winner_item_id: 'a', loser_item_id: 'c' },
      { winner_item_id: 'b', loser_item_id: 'c' },
    ])
    const levels = calculateLevels(graph, ['a', 'b', 'c'])
    expect(levels.get('a')).toBe(2)
    expect(levels.get('b')).toBe(1)
    expect(levels.get('c')).toBe(0)
  })
})

describe('assignTiers', () => {
  it('비교 참여 아이템이 없으면 모두 ? 티어', () => {
    const levels = new Map([['a', 0], ['b', 0]])
    const result = assignTiers(levels, new Set())
    expect(result['a']).toBe('?')
    expect(result['b']).toBe('?')
  })

  it('비교 미참여 아이템은 ? 티어', () => {
    const levels = new Map([['a', 1], ['b', 0], ['c', 0]])
    const result = assignTiers(levels, new Set(['a', 'b']))
    expect(result['c']).toBe('?')
  })

  it('6개 아이템 완전 비교 → 각 티어 정확히 1개씩 할당', () => {
    const levels = new Map([
      ['a', 5], ['b', 4], ['c', 3], ['d', 2], ['e', 1], ['f', 0],
    ])
    const ids = new Set(['a', 'b', 'c', 'd', 'e', 'f'])
    const result = assignTiers(levels, ids)
    expect(result['a']).toBe('S')
    expect(result['b']).toBe('A')
    expect(result['c']).toBe('B')
    expect(result['d']).toBe('C')
    expect(result['e']).toBe('D')
    expect(result['f']).toBe('F')
  })

  it('level 높은 아이템이 더 높은 티어에 배정된다', () => {
    const levels = new Map([['a', 10], ['b', 5], ['c', 1], ['d', 0]])
    const result = assignTiers(levels, new Set(['a', 'b', 'c', 'd']))
    const tierOrder = ['S', 'A', 'B', 'C', 'D', 'F']
    const aIdx = tierOrder.indexOf(result['a'])
    const dIdx = tierOrder.indexOf(result['d'])
    expect(aIdx).toBeLessThan(dIdx)
  })

  it('모든 아이템이 비교되면 ? 티어가 없다', () => {
    const levels = new Map([
      ['a', 3], ['b', 2], ['c', 1], ['d', 0],
    ])
    const result = assignTiers(levels, new Set(['a', 'b', 'c', 'd']))
    expect(Object.values(result).every((t) => t !== '?')).toBe(true)
  })

  it('tier_map의 총 아이템 수는 levels의 크기와 같다', () => {
    const levels = new Map([
      ['a', 4], ['b', 3], ['c', 2], ['d', 1], ['e', 0], ['f', 0], ['g', 0], ['h', 0],
    ])
    const ids = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])
    const result = assignTiers(levels, ids)
    expect(Object.keys(result).length).toBe(8)
  })
})
