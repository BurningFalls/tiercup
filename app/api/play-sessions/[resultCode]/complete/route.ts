import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildDirectedGraph, calculateLevels, assignTiers } from '@/lib/utils/topological-sort'
import type { Tier } from '@/lib/types'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ resultCode: string }> },
) {
  const { resultCode } = await params
  const supabase = await createClient()

  const { data: session, error: sessionError } = await supabase
    .from('play_sessions')
    .select('id, status, result_code, tier_cup_id')
    .eq('result_code', resultCode)
    .single()

  if (sessionError) {
    const isNotFound = sessionError.code === 'PGRST116'
    return NextResponse.json(
      {
        error: {
          code: isNotFound ? 'SESSION_NOT_FOUND' : 'INTERNAL_ERROR',
          message: isNotFound ? '플레이 세션을 찾을 수 없습니다.' : '서버 오류가 발생했습니다.',
        },
      },
      { status: isNotFound ? 404 : 500 },
    )
  }

  if (session.status === 'completed') {
    return NextResponse.json({ result_code: session.result_code })
  }

  // 아이템 목록 조회
  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('id')
    .eq('tier_cup_id', session.tier_cup_id)

  if (itemsError) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }

  // 기존 비교 목록 조회
  const { data: comparisons, error: comparisonsError } = await supabase
    .from('comparisons')
    .select('winner_item_id, loser_item_id')
    .eq('play_session_id', session.id)

  if (comparisonsError) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }

  const itemIds = (items ?? []).map((i) => String(i.id))
  const comparisonList = (comparisons ?? []).map((c) => ({
    winner_item_id: String(c.winner_item_id),
    loser_item_id: String(c.loser_item_id),
  }))

  // 위상정렬로 현재 티어 계산
  const graph = buildDirectedGraph(itemIds, comparisonList)
  const levels = calculateLevels(graph, itemIds)
  const comparedItemIds = new Set<string>()
  for (const [winner, losers] of graph) {
    if (losers.size > 0) comparedItemIds.add(winner)
    for (const loser of losers) comparedItemIds.add(loser)
  }
  const tierMap = assignTiers(levels, comparedItemIds)

  const resultRows = itemIds.map((id, idx) => ({
    item_id: id,
    tier: (tierMap[id] ?? '?') as Tier,
    tier_order: idx,
  }))

  // play_results upsert + status 완료 처리를 단일 트랜잭션으로
  const { error: completeError } = await supabase.rpc('complete_session', {
    p_session_id: session.id,
    p_result_rows: resultRows,
  })

  if (completeError) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '세션 완료 처리에 실패했습니다.' } },
      { status: 500 },
    )
  }

  return NextResponse.json({ result_code: session.result_code })
}
