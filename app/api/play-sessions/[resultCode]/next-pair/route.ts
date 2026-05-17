import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { selectNextPair } from '@/lib/utils/comparison-order'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ resultCode: string }> },
) {
  const { resultCode } = await params
  const supabase = await createClient()

  // 세션 조회
  const { data: session, error: sessionError } = await supabase
    .from('play_sessions')
    .select('id, status, comparison_count, tier_cup_id')
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
    return NextResponse.json({
      item_a: null,
      item_b: null,
      comparison_count: session.comparison_count,
      is_complete: true,
    })
  }

  // 아이템 목록 조회
  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('id, name, image_url')
    .eq('tier_cup_id', session.tier_cup_id)

  if (itemsError) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }

  // 기존 비교 결과 조회
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

  const nextPairIds = selectNextPair(itemIds, comparisonList)
  const itemMap = new Map((items ?? []).map((i) => [String(i.id), i]))

  if (!nextPairIds) {
    return NextResponse.json({
      item_a: null,
      item_b: null,
      comparison_count: session.comparison_count,
      is_complete: true,
    })
  }

  const toItemDto = (id: string) => {
    const item = itemMap.get(id)!
    return { id, name: item.name, image_url: item.image_url }
  }

  return NextResponse.json({
    item_a: toItemDto(nextPairIds[0]),
    item_b: toItemDto(nextPairIds[1]),
    comparison_count: session.comparison_count,
    is_complete: false,
  })
}
