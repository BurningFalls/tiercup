import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ playCode: string }> },
) {
  const { playCode } = await params
  if (!/^[a-zA-Z0-9]{6,}$/.test(playCode)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 티어컵 코드입니다.' } },
      { status: 400 },
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tier_cups')
    .select('id, play_code, title, play_count, like_count, created_at, updated_at, items(id, name, image_url, display_order)')
    .eq('play_code', playCode)
    .order('display_order', { referencedTable: 'items', ascending: true })
    .single()

  if (error) {
    const isNotFound = error.code === 'PGRST116'
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

  return NextResponse.json({
    id: String(data.id),
    play_code: data.play_code,
    title: data.title,
    play_count: data.play_count,
    like_count: data.like_count,
    created_at: data.created_at,
    updated_at: data.updated_at,
    items: (data.items ?? []).map((item: { id: number; name: string; image_url: string | null; display_order: number }) => ({
      id: String(item.id),
      name: item.name,
      image_url: item.image_url,
      display_order: item.display_order,
    })),
  })
}
