import { describe, it, expect } from 'vitest'
import {
  hasPath,
  selectTournamentPair,
  selectRefinementPair,
  selectNextPair,
} from './comparison-order'
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

describe('selectTournamentPair', () => {
  it('첫 비교 시 임의의 쌍을 반환한다', () => {
    const pair = selectTournamentPair(['a', 'b', 'c'], [])
    expect(pair).not.toBeNull()
    expect(pair).toHaveLength(2)
    expect(pair![0]).not.toBe(pair![1])
  })

  it('이미 비교된 쌍은 반환하지 않는다', () => {
    const comparisons = [{ winner_item_id: 'a', loser_item_id: 'b' }]
    const pair = selectTournamentPair(['a', 'b', 'c'], comparisons)
    expect(pair).not.toBeNull()
    const [x, y] = pair!
    const isDuplicate =
      (x === 'a' && y === 'b') || (x === 'b' && y === 'a')
    expect(isDuplicate).toBe(false)
  })

  it('n-1번 비교 완료 후 null을 반환한다', () => {
    // 3개 아이템, 2번 비교 완료
    const comparisons = [
      { winner_item_id: 'a', loser_item_id: 'b' },
      { winner_item_id: 'a', loser_item_id: 'c' },
    ]
    expect(selectTournamentPair(['a', 'b', 'c'], comparisons)).toBeNull()
  })

  it('4개 아이템: 3번 비교 완료 후 null을 반환한다', () => {
    const comparisons = [
      { winner_item_id: 'a', loser_item_id: 'b' },
      { winner_item_id: 'c', loser_item_id: 'd' },
      { winner_item_id: 'a', loser_item_id: 'c' },
    ]
    expect(selectTournamentPair(['a', 'b', 'c', 'd'], comparisons)).toBeNull()
  })

  it('반환된 쌍의 두 아이템은 itemIds에 속한다', () => {
    const ids = ['a', 'b', 'c', 'd']
    const pair = selectTournamentPair(ids, [])
    expect(ids).toContain(pair![0])
    expect(ids).toContain(pair![1])
  })
})

describe('selectRefinementPair', () => {
  it('같은 계층에 경로 없는 쌍이 있으면 반환한다', () => {
    // a→c, b→d: a,b는 같은 계층(1), c,d는 같은 계층(0)이고 서로 경로 없음
    const comparisons = [
      { winner_item_id: 'a', loser_item_id: 'c' },
      { winner_item_id: 'b', loser_item_id: 'd' },
    ]
    const pair = selectRefinementPair(['a', 'b', 'c', 'd'], comparisons)
    expect(pair).not.toBeNull()
  })

  it('이미 간접 경로가 있는 쌍은 건너뛴다', () => {
    // a→b→c: a와 c는 간접 경로 존재 → 세분화 대상 아님
    // 같은 계층(0): b,c가 있지만 b→c로 직접 연결됨
    // 실제로 세분화 가능한 쌍이 없으면 null
    const comparisons = [
      { winner_item_id: 'a', loser_item_id: 'b' },
      { winner_item_id: 'b', loser_item_id: 'c' },
    ]
    const pair = selectRefinementPair(['a', 'b', 'c'], comparisons)
    // a: level 2, b: level 1, c: level 0 → 각 계층에 1명씩 → 세분화 대상 없음
    expect(pair).toBeNull()
  })

  it('세분화 가능한 쌍이 없으면 null을 반환한다', () => {
    // 완전히 정렬된 체인: 세분화 없음
    const comparisons = [
      { winner_item_id: 'a', loser_item_id: 'b' },
      { winner_item_id: 'b', loser_item_id: 'c' },
      { winner_item_id: 'c', loser_item_id: 'd' },
    ]
    expect(selectRefinementPair(['a', 'b', 'c', 'd'], comparisons)).toBeNull()
  })

  it('상위 계층 쌍을 하위 계층보다 우선 반환한다', () => {
    // a→c, a→d, b→c: a=level1, b=level1, c=level0, d=level0
    // level 1(a, b)과 level 0(c, d) 두 그룹에 각각 경로 없는 쌍 존재
    // 상위 계층(level 1) 우선이므로 a↔b 쌍이 먼저 선택됨
    const comparisons = [
      { winner_item_id: 'a', loser_item_id: 'c' },
      { winner_item_id: 'a', loser_item_id: 'd' },
      { winner_item_id: 'b', loser_item_id: 'c' },
    ]
    const pair = selectRefinementPair(['a', 'b', 'c', 'd'], comparisons)
    expect(pair).not.toBeNull()
    const [x, y] = pair!
    // a,b는 같은 level 1이고 서로 경로 없음 → 상위 계층 우선으로 선택됨
    expect(new Set([x, y])).toEqual(new Set(['a', 'b']))
  })
})

describe('selectNextPair', () => {
  it('토너먼트 미완료 시 토너먼트 쌍을 반환한다', () => {
    const pair = selectNextPair(['a', 'b', 'c'], [])
    expect(pair).not.toBeNull()
  })

  it('토너먼트 완료 후 세분화 쌍을 반환한다', () => {
    // 3개 아이템, 2번 비교 완료(토너먼트 끝), 같은 계층에 비교 가능한 쌍 있음
    // a→c, b→c: a,b가 같은 계층(1)이고 a↔b 경로 없음 → 세분화 쌍 = [a,b]
    const comparisons = [
      { winner_item_id: 'a', loser_item_id: 'c' },
      { winner_item_id: 'b', loser_item_id: 'c' },
    ]
    const pair = selectNextPair(['a', 'b', 'c'], comparisons)
    expect(pair).not.toBeNull()
    expect(new Set(pair!)).toEqual(new Set(['a', 'b']))
  })

  it('모든 비교가 완료되면 null을 반환한다', () => {
    // 완전 정렬 체인: 토너먼트 완료 + 세분화 없음
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
})
