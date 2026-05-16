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

// 토너먼트 단계: 승자끼리 올라가는 진짜 토너먼트 방식으로 다음 쌍 선택
// 비교 횟수가 n-1에 도달하면 null 반환
export function selectTournamentPair(
  itemIds: string[],
  comparisons: Comparison[],
): [string, string] | null {
  if (comparisons.length >= itemIds.length - 1) return null

  // 비교 기록을 라운드 단위로 그룹화
  // 라운드 내에서 각 아이템은 최대 1번만 등장
  const completedRounds: Comparison[][] = []
  let currentRound: Comparison[] = []
  const usedInRound = new Set<string>()

  for (const cmp of comparisons) {
    if (usedInRound.has(cmp.winner_item_id) || usedInRound.has(cmp.loser_item_id)) {
      completedRounds.push(currentRound)
      currentRound = [cmp]
      usedInRound.clear()
    } else {
      currentRound.push(cmp)
    }
    usedInRound.add(cmp.winner_item_id)
    usedInRound.add(cmp.loser_item_id)
  }

  // 현 라운드의 후보 풀 결정
  // 이전 완성된 라운드가 없으면 전체 itemIds가 풀
  // 있으면 직전 완성 라운드의 승자가 풀
  const pool =
    completedRounds.length === 0
      ? itemIds
      : completedRounds[completedRounds.length - 1].map((c) => c.winner_item_id)

  // 현 라운드에서 풀의 아이템이 모두 소진됐는지 확인 (라운드 전환 시점)
  const poolSet = new Set(pool)
  const remainingInPool = pool.filter((id) => !usedInRound.has(id))

  if (remainingInPool.length < 2) {
    // 현 라운드 풀이 소진 → 현 라운드를 완성으로 간주하고 다음 라운드 시작
    const nextPool = currentRound.map((c) => c.winner_item_id)
    if (nextPool.length >= 2) return [nextPool[0], nextPool[1]]
    return null
  }

  // 풀에 속한 아이템 중 현 라운드에서 아직 비교 안 한 후보 선택
  const candidates = remainingInPool.filter((id) => poolSet.has(id))
  if (candidates.length >= 2) return [candidates[0], candidates[1]]
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
