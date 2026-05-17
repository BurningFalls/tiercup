import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockSession = { id: 1, status: 'in_progress', result_code: 'RESULT1' }

// play_sessions: select → eq → single
const mockSessionSingle = vi.fn()
const mockSessionEq = vi.fn(() => ({ single: mockSessionSingle }))
const mockSessionSelect = vi.fn(() => ({ eq: mockSessionEq }))

// play_sessions: update → eq
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdateEq = vi.fn(() => Promise.resolve({ error: null as any }))
const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }))

const mockFrom = vi.fn(() => ({
  select: mockSessionSelect,
  update: mockUpdate,
}))

const mockClient = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}))

import { POST } from './route'

function makeRequest(resultCode: string) {
  return new NextRequest(
    `http://localhost/api/play-sessions/${resultCode}/complete`,
    { method: 'POST' },
  )
}

function makeParams(resultCode: string) {
  return { params: Promise.resolve({ resultCode }) }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSessionSingle.mockResolvedValue({ data: mockSession, error: null })
  mockUpdateEq.mockResolvedValue({ error: null })
})

describe('POST /api/play-sessions/:resultCode/complete', () => {
  it('정상 완료 처리 시 200과 result_code를 반환한다', async () => {
    const res = await POST(makeRequest('RESULT1'), makeParams('RESULT1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.result_code).toBe('RESULT1')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed' }),
    )
  })

  it('세션을 찾을 수 없으면 404 SESSION_NOT_FOUND를 반환한다', async () => {
    mockSessionSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    const res = await POST(makeRequest('NOTFOUND'), makeParams('NOTFOUND'))
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error.code).toBe('SESSION_NOT_FOUND')
  })

  it('이미 완료된 세션이면 200과 result_code를 바로 반환한다', async () => {
    mockSessionSingle.mockResolvedValue({
      data: { ...mockSession, status: 'completed' },
      error: null,
    })

    const res = await POST(makeRequest('RESULT1'), makeParams('RESULT1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.result_code).toBe('RESULT1')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('Supabase 조회 오류 시 500을 반환한다', async () => {
    mockSessionSingle.mockResolvedValue({ data: null, error: { code: '99999' } })

    const res = await POST(makeRequest('RESULT1'), makeParams('RESULT1'))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('UPDATE 실패 시 500을 반환한다', async () => {
    mockUpdateEq.mockResolvedValue({ error: { code: '99999' } })

    const res = await POST(makeRequest('RESULT1'), makeParams('RESULT1'))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })
})
