import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePlayCode, generateManageCode } from '@/lib/utils/code'
import { tierCupSchema } from '@/lib/schemas'

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

  const parsed = tierCupSchema.shape.title.safeParse((body as Record<string, unknown>)?.title)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
      { status: 400 },
    )
  }

  const supabase = await createClient()

  for (let attempt = 0; attempt < 3; attempt++) {
    const play_code = generatePlayCode()
    const manage_code = generateManageCode()

    const { data, error } = await supabase
      .from('tier_cups')
      .insert({ title: parsed.data, play_code, manage_code })
      .select('id, play_code, manage_code')
      .single()

    if (!error) {
      return NextResponse.json(
        { id: String(data.id), play_code: data.play_code, manage_code: data.manage_code },
        { status: 201 },
      )
    }

    // UNIQUE violation — 코드 충돌, 재시도
    if (error.code !== '23505') {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: '티어컵 생성에 실패했습니다.' } },
        { status: 500 },
      )
    }
  }

  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: '티어컵 생성에 실패했습니다.' } },
    { status: 500 },
  )
}
