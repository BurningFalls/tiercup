import { describe, it, expect } from 'vitest'
import { hasPath, selectNextPair } from './comparison-order'
import { buildDirectedGraph } from './topological-sort'

describe('hasPath', () => {
  it('직접 연결된 경로를 감지한다', () => {
    const graph = buildDirectedGraph(['a', 'b'], [{ winner_item_id: 'a', loser_item_id: 'b' }])
    expect(hasPath(graph, 'a', 'b')).toBe(true)
  })

  it('간접 경로(A→B→C)를 감지한다', () => {
    const graph = buildDirectedGraph(['a', 'b', 'c'], [
      { winner_item_id: 'a', loser_item_id: 'b' },
      { winner_item_id: 'b', loser_item_id: 'c' },
    ])
    expect(hasPath(graph, 'a', 'c')).toBe(true)
  })

  it('역방향 경로는 감지하지 않는다', () => {
    const graph = buildDirectedGraph(['a', 'b'], [{ winner_item_id: 'a', loser_item_id: 'b' }])
    expect(hasPath(graph, 'b', 'a')).toBe(false)
  })

  it('경로가 없으면 false를 반환한다', () => {
    const graph = buildDirectedGraph(['a', 'b', 'c'], [
      { winner_item_id: 'a', loser_item_id: 'b' },
    ])
    expect(hasPath(graph, 'a', 'c')).toBe(false)
  })

  it('자기 자신에 대한 경로는 false를 반환한다', () => {
    const graph = buildDirectedGraph(['a'], [])
    expect(hasPath(graph, 'a', 'a')).toBe(false)
  })
})

describe('selectNextPair', () => {
  it('비교가 없으면 첫 두 아이템을 반환한다', () => {
    const pair = selectNextPair(['a', 'b', 'c'], [])
    expect(pair).not.toBeNull()
    expect(pair).toHaveLength(2)
  })

  it('반환된 쌍의 두 아이템은 itemIds에 속한다', () => {
    const ids = ['a', 'b', 'c', 'd']
    const pair = selectNextPair(ids, [])
    expect(ids).toContain(pair![0])
    expect(ids).toContain(pair![1])
  })

  it('이미 직접 비교된 쌍은 반환하지 않는다', () => {
    const comparisons = [{ winner_item_id: 'a', loser_item_id: 'b' }]
    const pair = selectNextPair(['a', 'b', 'c'], comparisons)
    expect(pair).not.toBeNull()
    const [x, y] = pair!
    expect((x === 'a' && y === 'b') || (x === 'b' && y === 'a')).toBe(false)
  })

  it('간접 경로가 있는 쌍도 건너뛴다', () => {
    // a→b→c: a↔c는 간접 경로 존재 → 건너뜀
    // 비교 가능한 쌍: a↔d, b↔d, c↔d
    const comparisons = [
      { winner_item_id: 'a', loser_item_id: 'b' },
      { winner_item_id: 'b', loser_item_id: 'c' },
    ]
    const pair = selectNextPair(['a', 'b', 'c', 'd'], comparisons)
    expect(pair).not.toBeNull()
    expect(pair).toContain('d')
  })

  it('비교 횟수가 적은 아이템을 우선 선택한다', () => {
    // a는 2번 비교, b·c·d는 1번, e·f는 0번
    // e, f가 가장 적으므로 e↔f 또는 e/f와 다른 미연결 쌍이 선택됨
    const comparisons = [
      { winner_item_id: 'a', loser_item_id: 'b' },
      { winner_item_id: 'a', loser_item_id: 'c' },
      { winner_item_id: 'b', loser_item_id: 'd' },
    ]
    const ids = ['a', 'b', 'c', 'd', 'e', 'f']
    const pair = selectNextPair(ids, comparisons)
    expect(pair).not.toBeNull()
    // e, f는 0번 비교 → 둘 중 하나 이상이 포함되어야 함
    const hasLeastCompared = pair!.includes('e') || pair!.includes('f')
    expect(hasLeastCompared).toBe(true)
  })

  it('모든 쌍에 경로가 있으면 null을 반환한다', () => {
    // 완전 정렬 체인: a→b→c
    const comparisons = [
      { winner_item_id: 'a', loser_item_id: 'b' },
      { winner_item_id: 'b', loser_item_id: 'c' },
    ]
    expect(selectNextPair(['a', 'b', 'c'], comparisons)).toBeNull()
  })

  it('아이템이 2개면 1번 비교 후 null을 반환한다', () => {
    const comparisons = [{ winner_item_id: 'a', loser_item_id: 'b' }]
    expect(selectNextPair(['a', 'b'], comparisons)).toBeNull()
  })

  it('같은 계층 아이템끼리도 비교 대상이 된다', () => {
    // a→c, b→c: a,b는 같은 계층이고 서로 경로 없음 → 선택됨
    const comparisons = [
      { winner_item_id: 'a', loser_item_id: 'c' },
      { winner_item_id: 'b', loser_item_id: 'c' },
    ]
    const pair = selectNextPair(['a', 'b', 'c'], comparisons)
    expect(pair).not.toBeNull()
    expect(new Set(pair!)).toEqual(new Set(['a', 'b']))
  })
})
