import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { selectNextPair } from '@/lib/utils/comparison-order'
import { buildDirectedGraph, calculateLevels, assignTiers } from '@/lib/utils/topological-sort'
import { z } from 'zod'
import type { Tier } from '@/lib/types'

const comparisonSchema = z.object({
  winner_item_id: z.string().min(1),
  loser_item_id: z.string().min(1),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resultCode: string }> },
) {
  const { resultCode } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '요청 본문이 올바르지 않습니다.' } },
      { status: 400 },
    )
  }

  const parsed = comparisonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
      { status: 400 },
    )
  }

  const { winner_item_id, loser_item_id } = parsed.data

  if (winner_item_id === loser_item_id) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '같은 아이템을 비교할 수 없습니다.' } },
      { status: 400 },
    )
  }

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
    return NextResponse.json(
      { error: { code: 'SESSION_ALREADY_COMPLETED', message: '이미 완료된 세션입니다.' } },
      { status: 400 },
    )
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

  const itemIds = (items ?? []).map((i) => String(i.id))
  const itemIdSet = new Set(itemIds)

  if (!itemIdSet.has(winner_item_id) || !itemIdSet.has(loser_item_id)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '해당 세션에 속하지 않는 아이템입니다.' } },
      { status: 400 },
    )
  }

  // 기존 비교 목록 조회 (다음 쌍 결정 및 티어 계산용)
  const { data: existingComparisons, error: comparisonsError } = await supabase
    .from('comparisons')
    .select('winner_item_id, loser_item_id')
    .eq('play_session_id', session.id)

  if (comparisonsError) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }

  // 현재 예상 비교 쌍 검증 — 임의 쌍 제출로 인한 사이클/오염 방지
  const existingList = (existingComparisons ?? []).map((c) => ({
    winner_item_id: String(c.winner_item_id),
    loser_item_id: String(c.loser_item_id),
  }))
  const expectedPair = selectNextPair(itemIds, existingList)
  if (
    expectedPair === null ||
    !(
      (expectedPair[0] === winner_item_id && expectedPair[1] === loser_item_id) ||
      (expectedPair[0] === loser_item_id && expectedPair[1] === winner_item_id)
    )
  ) {
    return NextResponse.json(
      { error: { code: 'INVALID_PAIR', message: '현재 비교 순서에 맞지 않는 쌍입니다.' } },
      { status: 400 },
    )
  }

  // 방금 비교한 결과 포함해서 티어 계산
  const comparisonList = [...existingList, { winner_item_id, loser_item_id }]

  // 위상정렬로 현재 티어 계산
  const graph = buildDirectedGraph(itemIds, comparisonList)
  const levels = calculateLevels(graph, itemIds)
  const comparedItemIds = new Set<string>()
  for (const [winner, losers] of graph) {
    if (losers.size > 0) comparedItemIds.add(winner)
    for (const loser of losers) comparedItemIds.add(loser)
  }
  const tierMap = assignTiers(levels, comparedItemIds)

  // 다음 비교 쌍 결정
  const nextPairIds = selectNextPair(itemIds, comparisonList)
  const isComplete = nextPairIds === null

  // comparisons INSERT + play_results UPSERT + comparison_count increment를 단일 트랜잭션으로 처리
  const resultRows = itemIds.map((id, idx) => ({
    item_id: id,
    tier: (tierMap[id] ?? '?') as Tier,
    tier_order: idx,
  }))

  const { data: newComparisonCount, error: saveError } = await supabase.rpc('save_comparison', {
    p_session_id: session.id,
    p_winner_item_id: Number(winner_item_id),
    p_loser_item_id: Number(loser_item_id),
    p_result_rows: resultRows,
    p_is_complete: isComplete,
  })

  if (saveError) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '비교 결과 저장에 실패했습니다.' } },
      { status: 500 },
    )
  }

  // current_tiers 조립 (S→A→B→C→D→F→? 순)
  const TIER_ORDER: Tier[] = ['S', 'A', 'B', 'C', 'D', 'F', '?']
  const itemMap = new Map((items ?? []).map((i) => [String(i.id), i]))

  const tierGroups = new Map<Tier, Array<{ id: string; name: string; image_url: string | null }>>(
    TIER_ORDER.map((t) => [t, []]),
  )
  for (const id of itemIds) {
    const tier = (tierMap[id] ?? '?') as Tier
    tierGroups.get(tier)!.push({
      id,
      name: itemMap.get(id)!.name,
      image_url: itemMap.get(id)!.image_url,
    })
  }

  const current_tiers = TIER_ORDER.filter((t) => tierGroups.get(t)!.length > 0).map((t) => ({
    tier: t,
    items: tierGroups.get(t)!,
  }))

  const toItemDto = (id: string) => ({
    id,
    name: itemMap.get(id)!.name,
    image_url: itemMap.get(id)!.image_url,
  })

  const next_pair = nextPairIds
    ? { item_a: toItemDto(nextPairIds[0]), item_b: toItemDto(nextPairIds[1]) }
    : null

  return NextResponse.json(
    {
      comparison_count: newComparisonCount,
      current_tiers,
      next_pair,
      is_complete: isComplete,
    },
    { status: 201 },
  )
}
