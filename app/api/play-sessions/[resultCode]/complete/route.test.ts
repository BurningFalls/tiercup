import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockSession = { id: 1, status: 'in_progress', result_code: 'RESULT1', tier_cup_id: 10 }

const mockItems = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
]

const mockComparisons = [
  { winner_item_id: 1, loser_item_id: 2 },
]

// play_sessions: select → eq → single
const mockSessionSingle = vi.fn()
const mockSessionEq = vi.fn(() => ({ single: mockSessionSingle }))
const mockSessionSelect = vi.fn(() => ({ eq: mockSessionEq }))

// items: select → eq
const mockItemsResult = vi.fn()
const mockItemsEq = vi.fn(() => mockItemsResult())
const mockItemsSelect = vi.fn(() => ({ eq: mockItemsEq }))

// comparisons: select → eq
const mockComparisonsResult = vi.fn()
const mockComparisonsEq = vi.fn(() => mockComparisonsResult())
const mockComparisonsSelect = vi.fn(() => ({ eq: mockComparisonsEq }))

// rpc (complete_session)
const mockRpc = vi.fn()

const mockFrom = vi.fn((table: string) => {
  if (table === 'play_sessions') return { select: mockSessionSelect }
  if (table === 'items') return { select: mockItemsSelect }
  if (table === 'comparisons') return { select: mockComparisonsSelect }
  return {}
})

const mockClient = { from: mockFrom, rpc: mockRpc }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}))

vi.mock('@/lib/utils/topological-sort', () => ({
  buildDirectedGraph: vi.fn(() => new Map([['1', new Set(['2'])]])),
  calculateLevels: vi.fn(() => new Map([['1', 1], ['2', 0], ['3', 0], ['4', 0]])),
  assignTiers: vi.fn(() => ({ '1': 'S', '2': 'A', '3': 'B', '4': 'C' })),
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
  mockItemsResult.mockResolvedValue({ data: mockItems, error: null })
  mockComparisonsResult.mockResolvedValue({ data: mockComparisons, error: null })
  mockRpc.mockResolvedValue({ error: null })
})

describe('POST /api/play-sessions/:resultCode/complete', () => {
  it('정상 완료 처리 시 200과 result_code를 반환한다', async () => {
    const res = await POST(makeRequest('RESULT1'), makeParams('RESULT1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.result_code).toBe('RESULT1')
    expect(mockRpc).toHaveBeenCalledWith('complete_session', expect.objectContaining({
      p_session_id: 1,
    }))
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
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('비교가 없는 빈 세션도 정상 완료 처리된다', async () => {
    mockComparisonsResult.mockResolvedValue({ data: [], error: null })

    const res = await POST(makeRequest('RESULT1'), makeParams('RESULT1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.result_code).toBe('RESULT1')
    expect(mockRpc).toHaveBeenCalledWith('complete_session', expect.objectContaining({
      p_session_id: 1,
      p_result_rows: expect.any(Array),
    }))
  })

  it('Supabase 조회 오류 시 500을 반환한다', async () => {
    mockSessionSingle.mockResolvedValue({ data: null, error: { code: '99999' } })

    const res = await POST(makeRequest('RESULT1'), makeParams('RESULT1'))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('complete_session RPC 실패 시 500을 반환한다', async () => {
    mockRpc.mockResolvedValue({ error: { code: '99999', message: 'fail' } })

    const res = await POST(makeRequest('RESULT1'), makeParams('RESULT1'))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })
})
