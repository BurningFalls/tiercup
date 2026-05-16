import { buildDirectedGraph } from './topological-sort'

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

// 비교 횟수가 적은 아이템 우선으로, 아직 관계가 없는 쌍을 선택
// 모든 쌍에 경로가 있으면 null 반환
export function selectNextPair(
  itemIds: string[],
  comparisons: Comparison[],
): [string, string] | null {
  const graph = buildDirectedGraph(itemIds, comparisons)

  const matchCount = new Map<string, number>()
  for (const id of itemIds) matchCount.set(id, 0)
  for (const { winner_item_id, loser_item_id } of comparisons) {
    matchCount.set(winner_item_id, (matchCount.get(winner_item_id) ?? 0) + 1)
    matchCount.set(loser_item_id, (matchCount.get(loser_item_id) ?? 0) + 1)
  }

  const sorted = [...itemIds].sort(
    (a, b) => (matchCount.get(a) ?? 0) - (matchCount.get(b) ?? 0),
  )

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i]
      const b = sorted[j]
      if (!hasPath(graph, a, b) && !hasPath(graph, b, a)) {
        return [a, b]
      }
    }
  }

  return null
}
