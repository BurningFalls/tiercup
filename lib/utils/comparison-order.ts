import { buildDirectedGraph, calculateLevels } from './topological-sort'

type Comparison = { winner_item_id: string; loser_item_id: string }

// BFS로 from → to 방향 경로 존재 여부 확인 (자기 자신은 false)
export function hasPath(
  graph: Map<string, Set<string>>,
  from: string,
  to: string,
): boolean {
  if (from === to) return false
  const visited = new Set<string>()
  const queue = [from]
  while (queue.length > 0) {
    const node = queue.shift()!
    if (visited.has(node)) continue
    visited.add(node)
    for (const next of graph.get(node) ?? []) {
      if (next === to) return true
      queue.push(next)
    }
  }
  return false
}

// 토너먼트 단계: 각 아이템의 직접 비교 횟수가 균등하도록 다음 쌍 선택
// 비교 횟수가 n-1에 도달하면 null 반환
export function selectTournamentPair(
  itemIds: string[],
  comparisons: Comparison[],
): [string, string] | null {
  const n = itemIds.length
  if (comparisons.length >= n - 1) return null

  // 각 아이템의 직접 비교 참여 횟수
  const matchCount = new Map<string, number>()
  for (const id of itemIds) matchCount.set(id, 0)
  for (const { winner_item_id, loser_item_id } of comparisons) {
    matchCount.set(winner_item_id, (matchCount.get(winner_item_id) ?? 0) + 1)
    matchCount.set(loser_item_id, (matchCount.get(loser_item_id) ?? 0) + 1)
  }

  // 이미 직접 비교된 쌍 집합
  const compared = new Set<string>()
  for (const { winner_item_id, loser_item_id } of comparisons) {
    compared.add(`${winner_item_id}:${loser_item_id}`)
    compared.add(`${loser_item_id}:${winner_item_id}`)
  }

  // 비교 횟수 오름차순으로 정렬하여 가장 덜 비교된 아이템부터 탐색
  const sorted = [...itemIds].sort(
    (a, b) => (matchCount.get(a) ?? 0) - (matchCount.get(b) ?? 0),
  )

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i]
      const b = sorted[j]
      if (!compared.has(`${a}:${b}`)) return [a, b]
    }
  }

  return null
}

// 세분화 단계: 같은 계층 내에서 간접 경로도 없는 쌍 선택 (상위 계층 우선)
export function selectRefinementPair(
  itemIds: string[],
  comparisons: Comparison[],
): [string, string] | null {
  const graph = buildDirectedGraph(itemIds, comparisons)
  const levels = calculateLevels(graph, itemIds)

  // 계층별로 그룹화 (내림차순 = 상위 계층 우선)
  const levelGroups = new Map<number, string[]>()
  for (const id of itemIds) {
    const lv = levels.get(id) ?? 0
    if (!levelGroups.has(lv)) levelGroups.set(lv, [])
    levelGroups.get(lv)!.push(id)
  }

  const sortedLevels = [...levelGroups.keys()].sort((a, b) => b - a)

  for (const lv of sortedLevels) {
    const group = levelGroups.get(lv)!
    if (group.length < 2) continue

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]
        const b = group[j]
        // 양방향 모두 경로가 없는 쌍만 선택
        if (!hasPath(graph, a, b) && !hasPath(graph, b, a)) {
          return [a, b]
        }
      }
    }
  }

  return null
}

// 통합 진입점: 토너먼트 완료 전이면 토너먼트 쌍, 완료 후이면 세분화 쌍 반환
export function selectNextPair(
  itemIds: string[],
  comparisons: Comparison[],
): [string, string] | null {
  const tournament = selectTournamentPair(itemIds, comparisons)
  if (tournament !== null) return tournament
  return selectRefinementPair(itemIds, comparisons)
}
