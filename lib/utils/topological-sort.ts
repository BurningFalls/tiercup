import type { Tier } from '@/lib/types'

export function buildDirectedGraph(
  itemIds: string[],
  comparisons: Array<{ winner_item_id: string; loser_item_id: string }>,
): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>()
  for (const id of itemIds) {
    graph.set(id, new Set())
  }
  for (const { winner_item_id, loser_item_id } of comparisons) {
    graph.get(winner_item_id)?.add(loser_item_id)
  }
  return graph
}

export function calculateLevels(
  graph: Map<string, Set<string>>,
  itemIds: string[],
): Map<string, number> {
  // loser → [winners] 역방향 그래프 구성
  const reverseGraph = new Map<string, string[]>()
  for (const id of itemIds) reverseGraph.set(id, [])
  for (const [winner, losers] of graph) {
    for (const loser of losers) {
      reverseGraph.get(loser)?.push(winner)
    }
  }

  // outDegree: winner→loser 방향에서 각 노드가 이긴 아이템 수
  // losers가 없는 노드(outDegree=0)부터 BFS 시작 (가장 아래 계층)
  const outDegree = new Map<string, number>()
  for (const id of itemIds) outDegree.set(id, (graph.get(id)?.size ?? 0))

  const levels = new Map<string, number>()
  for (const id of itemIds) levels.set(id, 0)

  // BFS: outDegree=0인 노드 (아무도 못 이긴 노드) 부터 시작
  const queue: string[] = []
  for (const id of itemIds) {
    if (outDegree.get(id) === 0) queue.push(id)
  }

  // 방문 추적: 각 노드는 모든 loser가 처리된 뒤 큐에 진입
  const loserCount = new Map<string, number>() // 각 winner의 아직 처리 안 된 loser 수
  for (const [winner, losers] of graph) {
    loserCount.set(winner, losers.size)
  }

  while (queue.length > 0) {
    const current = queue.shift()!
    const currentLevel = levels.get(current) ?? 0

    for (const winner of reverseGraph.get(current) ?? []) {
      const newLevel = currentLevel + 1
      if (newLevel > (levels.get(winner) ?? 0)) {
        levels.set(winner, newLevel)
      }
      const remaining = (loserCount.get(winner) ?? 1) - 1
      loserCount.set(winner, remaining)
      if (remaining === 0) queue.push(winner)
    }
  }

  return levels
}

const TIER_RATIOS: Array<{ tier: Tier; ratio: number }> = [
  { tier: 'S', ratio: 0.1 },
  { tier: 'A', ratio: 0.2 },
  { tier: 'B', ratio: 0.3 },
  { tier: 'C', ratio: 0.2 },
  { tier: 'D', ratio: 0.1 },
  { tier: 'F', ratio: 0.1 },
]

export function assignTiers(
  levels: Map<string, number>,
  comparedItemIds: Set<string>,
): Record<string, Tier> {
  const result: Record<string, Tier> = {}

  // 비교에 참여하지 않은 아이템 → '?'
  for (const [id] of levels) {
    if (!comparedItemIds.has(id)) result[id] = '?'
  }

  const compared = [...comparedItemIds].filter((id) => levels.has(id))
  if (compared.length === 0) return result

  // level 내림차순 정렬 (level 높을수록 상위 티어)
  compared.sort((a, b) => (levels.get(b) ?? 0) - (levels.get(a) ?? 0))

  const n = compared.length
  // 각 티어별 아이템 수 계산 (최소 1개 보장)
  const counts = TIER_RATIOS.map(({ ratio }) => Math.max(1, Math.round(n * ratio)))

  // 합계가 n을 초과하면 B(index=2)에서 차감
  let total = counts.reduce((s, c) => s + c, 0)
  while (total > n && counts[2] > 1) {
    counts[2]--
    total--
  }
  // 합계가 n 미만이면 B에 추가
  while (total < n) {
    counts[2]++
    total++
  }

  let idx = 0
  for (let t = 0; t < TIER_RATIOS.length; t++) {
    const tier = TIER_RATIOS[t].tier
    for (let k = 0; k < counts[t]; k++) {
      if (idx < compared.length) {
        result[compared[idx++]] = tier
      }
    }
  }

  return result
}
