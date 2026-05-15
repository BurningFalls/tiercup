import { NextRequest, NextResponse } from 'next/server'
import { buildDirectedGraph, calculateLevels, assignTiers } from '@/lib/utils/topological-sort'

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

  const { item_ids, comparisons } = (body ?? {}) as Record<string, unknown>

  if (!Array.isArray(item_ids) || item_ids.length === 0 || !item_ids.every((id) => typeof id === 'string')) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'item_ids는 비어있지 않은 문자열 배열이어야 합니다.' } },
      { status: 400 },
    )
  }

  if (!Array.isArray(comparisons) || !comparisons.every(
    (c) =>
      c !== null &&
      typeof c === 'object' &&
      typeof c.winner_item_id === 'string' &&
      typeof c.loser_item_id === 'string',
  )) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'comparisons 형식이 올바르지 않습니다.' } },
      { status: 400 },
    )
  }

  const itemIdSet = new Set<string>(item_ids as string[])
  for (const c of comparisons as Array<{ winner_item_id: string; loser_item_id: string }>) {
    if (!itemIdSet.has(c.winner_item_id) || !itemIdSet.has(c.loser_item_id)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'comparisons의 아이템 ID가 item_ids에 포함되지 않습니다.' } },
        { status: 400 },
      )
    }
  }

  const graph = buildDirectedGraph(item_ids as string[], comparisons as Array<{ winner_item_id: string; loser_item_id: string }>)
  const levels = calculateLevels(graph, item_ids as string[])

  const comparedItemIds = new Set<string>()
  for (const c of comparisons as Array<{ winner_item_id: string; loser_item_id: string }>) {
    comparedItemIds.add(c.winner_item_id)
    comparedItemIds.add(c.loser_item_id)
  }

  const tier_map = assignTiers(levels, comparedItemIds)

  return NextResponse.json({ tier_map }, { status: 200 })
}
