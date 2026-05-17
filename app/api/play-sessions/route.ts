import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateResultCode } from '@/lib/utils/code'
import { selectNextPair } from '@/lib/utils/comparison-order'
import { z } from 'zod'

const createSessionSchema = z.object({
  play_code: z.string().min(1),
})

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

  const parsed = createSessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'play_code가 필요합니다.' } },
      { status: 400 },
    )
  }

  const { play_code } = parsed.data
  const supabase = await createClient()

  // 티어컵 + 아이템 조회
  const { data: tierCup, error: tierCupError } = await supabase
    .from('tier_cups')
    .select('id, title, items(id, name, image_url, display_order)')
    .eq('play_code', play_code)
    .order('display_order', { referencedTable: 'items', ascending: true })
    .single()

  if (tierCupError) {
    const isNotFound = tierCupError.code === 'PGRST116'
    return NextResponse.json(
      {
        error: {
          code: isNotFound ? 'TIER_CUP_NOT_FOUND' : 'INTERNAL_ERROR',
          message: isNotFound ? '티어컵을 찾을 수 없습니다.' : '서버 오류가 발생했습니다.',
        },
      },
      { status: isNotFound ? 404 : 500 },
    )
  }

  const items = (tierCup.items ?? []) as Array<{
    id: number
    name: string
    image_url: string | null
    display_order: number
  }>

  if (items.length < 2) {
    return NextResponse.json(
      { error: { code: 'INSUFFICIENT_ITEMS', message: '플레이하려면 아이템이 2개 이상 필요합니다.' } },
      { status: 400 },
    )
  }

  // result_code 중복 방지 재시도
  for (let attempt = 0; attempt < 3; attempt++) {
    const result_code = generateResultCode()

    const { data: session, error: sessionError } = await supabase
      .from('play_sessions')
      .insert({ tier_cup_id: tierCup.id, result_code, status: 'in_progress' })
      .select('id, result_code')
      .single()

    if (sessionError) {
      if (sessionError.code !== '23505') {
        return NextResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: '세션 생성에 실패했습니다.' } },
          { status: 500 },
        )
      }
      continue
    }

    // play_count atomic increment
    await supabase.rpc('increment_play_count', { cup_id: tierCup.id })

    const itemIds = items.map((i) => String(i.id))
    const firstPairIds = selectNextPair(itemIds, [])
    const itemMap = new Map(items.map((i) => [String(i.id), i]))

    const toItemDto = (id: string) => {
      const item = itemMap.get(id)!
      return { id, name: item.name, image_url: item.image_url }
    }

    const first_pair = firstPairIds
      ? { item_a: toItemDto(firstPairIds[0]), item_b: toItemDto(firstPairIds[1]) }
      : null

    return NextResponse.json(
      {
        result_code: session.result_code,
        title: tierCup.title,
        items: items.map((i) => ({ id: String(i.id), name: i.name, image_url: i.image_url })),
        first_pair,
      },
      { status: 201 },
    )
  }

  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: '세션 생성에 실패했습니다.' } },
    { status: 500 },
  )
}
