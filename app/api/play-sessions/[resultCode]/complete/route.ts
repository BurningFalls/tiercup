import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ resultCode: string }> },
) {
  const { resultCode } = await params
  const supabase = await createClient()

  const { data: session, error: sessionError } = await supabase
    .from('play_sessions')
    .select('id, status, result_code')
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

  const { error: updateError } = await supabase
    .from('play_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', session.id)

  if (updateError) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '세션 완료 처리에 실패했습니다.' } },
      { status: 500 },
    )
  }

  return NextResponse.json({ result_code: session.result_code })
}
