import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePlayCode, generateManageCode } from '@/lib/utils/code'
import { z } from 'zod'

const PAGE_SIZE = 12
const SORT_COLUMNS = {
  popular: 'play_count',
  likes: 'like_count',
  latest: 'created_at',
} as const

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const sortParam = searchParams.get('sort') ?? 'popular'
  const sortColumn = SORT_COLUMNS[sortParam as keyof typeof SORT_COLUMNS] ?? SORT_COLUMNS.popular
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? String(PAGE_SIZE), 10) || PAGE_SIZE))
  const search = searchParams.get('search')?.trim() ?? ''

  const supabase = await createClient()

  let query = supabase
    .from('tier_cups')
    .select('id, play_code, title, play_count, like_count, created_at, updated_at', { count: 'exact' })
    .order(sortColumn, { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '목록 조회에 실패했습니다.' } },
      { status: 500 },
    )
  }

  return NextResponse.json({ data: data ?? [], total: count ?? 0, page })
}

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

  const titleSchema = z.string().min(1, '제목을 입력하세요').max(30, '제목은 30자 이하로 입력하세요')
  const parsed = titleSchema.safeParse((body as Record<string, unknown>)?.title)
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
      .select('play_code, manage_code')
      .single()

    if (!error) {
      return NextResponse.json(
        { play_code: data.play_code, manage_code: data.manage_code },
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
