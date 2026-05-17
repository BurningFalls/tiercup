import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockSession = {
  id: 1,
  status: 'in_progress',
  comparison_count: 2,
  tier_cup_id: 10,
}

const mockItems = [
  { id: 1, name: '케이크', image_url: null },
  { id: 2, name: '도넛', image_url: null },
  { id: 3, name: '아이스크림', image_url: null },
  { id: 4, name: '마카롱', image_url: null },
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

const mockFrom = vi.fn((table: string) => {
  if (table === 'play_sessions') return { select: mockSessionSelect }
  if (table === 'items') return { select: mockItemsSelect }
  if (table === 'comparisons') return { select: mockComparisonsSelect }
  return {}
})

const mockClient = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}))

vi.mock('@/lib/utils/comparison-order', () => ({
  selectNextPair: vi.fn(() => ['3', '4']),
}))

import { GET } from './route'

function makeRequest(resultCode: string) {
  return new NextRequest(`http://localhost/api/play-sessions/${resultCode}/next-pair`)
}

function makeParams(resultCode: string) {
  return { params: Promise.resolve({ resultCode }) }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSessionSingle.mockResolvedValue({ data: mockSession, error: null })
  mockItemsResult.mockResolvedValue({ data: mockItems, error: null })
  mockComparisonsResult.mockResolvedValue({ data: mockComparisons, error: null })
})

describe('GET /api/play-sessions/:resultCode/next-pair', () => {
  it('정상 조회 시 200과 item_a, item_b, comparison_count를 반환한다', async () => {
    const res = await GET(makeRequest('RESULT1'), makeParams('RESULT1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.item_a.id).toBe('3')
    expect(body.item_b.id).toBe('4')
    expect(body.comparison_count).toBe(2)
    expect(body.is_complete).toBe(false)
  })

  it('세션을 찾을 수 없으면 404 SESSION_NOT_FOUND를 반환한다', async () => {
    mockSessionSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    const res = await GET(makeRequest('NOTFOUND'), makeParams('NOTFOUND'))
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error.code).toBe('SESSION_NOT_FOUND')
  })

  it('완료된 세션이면 is_complete: true, item_a/b: null을 반환한다', async () => {
    mockSessionSingle.mockResolvedValue({
      data: { ...mockSession, status: 'completed' },
      error: null,
    })

    const res = await GET(makeRequest('RESULT1'), makeParams('RESULT1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.is_complete).toBe(true)
    expect(body.item_a).toBeNull()
    expect(body.item_b).toBeNull()
  })

  it('selectNextPair가 null이면 is_complete: true를 반환한다', async () => {
    const { selectNextPair } = await import('@/lib/utils/comparison-order')
    vi.mocked(selectNextPair).mockReturnValueOnce(null)

    const res = await GET(makeRequest('RESULT1'), makeParams('RESULT1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.is_complete).toBe(true)
    expect(body.item_a).toBeNull()
  })

  it('Supabase 세션 조회 오류 시 500을 반환한다', async () => {
    mockSessionSingle.mockResolvedValue({ data: null, error: { code: '99999' } })

    const res = await GET(makeRequest('RESULT1'), makeParams('RESULT1'))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })
})
