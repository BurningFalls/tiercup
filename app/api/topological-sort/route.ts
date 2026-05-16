import { NextRequest, NextResponse } from 'next/server'
import { buildDirectedGraph, calculateLevels, assignTiers } from '@/lib/utils/topological-sort'
import { topologicalSortSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '요청 본문이 올바르지 않습니다.' } },
      { status: 400 },
    )
  }

  const parsed = topologicalSortSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
      { status: 400 },
    )
  }

  const { item_ids, comparisons } = parsed.data

  const itemIdSet = new Set<string>(item_ids)
  for (const c of comparisons) {
    if (!itemIdSet.has(c.winner_item_id) || !itemIdSet.has(c.loser_item_id)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'comparisons의 아이템 ID가 item_ids에 포함되지 않습니다.' } },
        { status: 400 },
      )
    }
  }

  const graph = buildDirectedGraph(item_ids, comparisons)
  const levels = calculateLevels(graph, item_ids)

  const comparedItemIds = new Set<string>()
  for (const [winner, losers] of graph) {
    if (losers.size > 0) comparedItemIds.add(winner)
    for (const loser of losers) comparedItemIds.add(loser)
  }

  const tier_map = assignTiers(levels, comparedItemIds)

  return NextResponse.json({ tier_map }, { status: 200 })
}
