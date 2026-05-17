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

// play_sessions: select → eq → single
const mockSessionSingle = vi.fn()
const mockSessionEq = vi.fn(() => ({ single: mockSessionSingle }))
const mockSessionSelect = vi.fn(() => ({ eq: mockSessionEq }))

// items: select → eq
const mockItemsResult = vi.fn()
const mockItemsEq = vi.fn(() => mockItemsResult())
const mockItemsSelect = vi.fn(() => ({ eq: mockItemsEq }))

// comparisons: select → eq (기존 비교 목록 조회)
const mockComparisonsResult = vi.fn()
const mockComparisonsEq = vi.fn(() => mockComparisonsResult())
const mockComparisonsSelect = vi.fn(() => ({ eq: mockComparisonsEq }))

// rpc (save_comparison)
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

vi.mock('@/lib/utils/comparison-order', () => ({
  selectNextPair: vi.fn(() => ['3', '4']),
}))

vi.mock('@/lib/utils/topological-sort', () => ({
  buildDirectedGraph: vi.fn(() => new Map([['1', new Set(['2'])]])),
  calculateLevels: vi.fn(() => new Map([['1', 1], ['2', 0], ['3', 0], ['4', 0]])),
  assignTiers: vi.fn(() => ({ '1': 'S', '2': 'A', '3': 'B', '4': 'C' })),
}))

import { POST } from './route'

function makeRequest(resultCode: string, body: unknown) {
  return new NextRequest(
    `http://localhost/api/play-sessions/${resultCode}/comparisons`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}

function makeParams(resultCode: string) {
  return { params: Promise.resolve({ resultCode }) }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSessionSingle.mockResolvedValue({ data: mockSession, error: null })
  mockItemsResult.mockResolvedValue({ data: mockItems, error: null })
  mockComparisonsResult.mockResolvedValue({
    data: [{ winner_item_id: 1, loser_item_id: 2 }],
    error: null,
  })
  mockRpc.mockResolvedValue({ data: 3, error: null })
})

describe('POST /api/play-sessions/:resultCode/comparisons', () => {
  it('정상 비교 저장 시 201과 current_tiers, next_pair를 반환한다', async () => {
    const res = await POST(
      makeRequest('RESULT1', { winner_item_id: '1', loser_item_id: '2' }),
      makeParams('RESULT1'),
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.comparison_count).toBe(3)
    expect(body.current_tiers).toBeInstanceOf(Array)
    expect(body.next_pair.item_a.id).toBe('3')
    expect(body.is_complete).toBe(false)
    expect(mockRpc).toHaveBeenCalledWith('save_comparison', expect.objectContaining({
      p_winner_item_id: 1,
      p_loser_item_id: 2,
      p_is_complete: false,
    }))
  })

  it('잘못된 JSON body이면 400을 반환한다', async () => {
    const req = new NextRequest(
      'http://localhost/api/play-sessions/RESULT1/comparisons',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'bad' },
    )
    const res = await POST(req, makeParams('RESULT1'))
    expect(res.status).toBe(400)
  })

  it('winner_item_id와 loser_item_id가 같으면 400을 반환한다', async () => {
    const res = await POST(
      makeRequest('RESULT1', { winner_item_id: '1', loser_item_id: '1' }),
      makeParams('RESULT1'),
    )
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('세션을 찾을 수 없으면 404를 반환한다', async () => {
    mockSessionSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    const res = await POST(
      makeRequest('NOTFOUND', { winner_item_id: '1', loser_item_id: '2' }),
      makeParams('NOTFOUND'),
    )
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error.code).toBe('SESSION_NOT_FOUND')
  })

  it('완료된 세션이면 400 SESSION_ALREADY_COMPLETED를 반환한다', async () => {
    mockSessionSingle.mockResolvedValue({
      data: { ...mockSession, status: 'completed' },
      error: null,
    })

    const res = await POST(
      makeRequest('RESULT1', { winner_item_id: '1', loser_item_id: '2' }),
      makeParams('RESULT1'),
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('SESSION_ALREADY_COMPLETED')
  })

  it('세션에 속하지 않는 아이템 ID이면 400을 반환한다', async () => {
    const res = await POST(
      makeRequest('RESULT1', { winner_item_id: '99', loser_item_id: '2' }),
      makeParams('RESULT1'),
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('selectNextPair가 null이면 is_complete: true, next_pair: null을 반환한다', async () => {
    const { selectNextPair } = await import('@/lib/utils/comparison-order')
    vi.mocked(selectNextPair).mockReturnValueOnce(null)

    const res = await POST(
      makeRequest('RESULT1', { winner_item_id: '1', loser_item_id: '2' }),
      makeParams('RESULT1'),
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.is_complete).toBe(true)
    expect(body.next_pair).toBeNull()
    expect(mockRpc).toHaveBeenCalledWith('save_comparison', expect.objectContaining({
      p_is_complete: true,
    }))
  })

  it('save_comparison RPC 실패 시 500을 반환한다', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '99999', message: 'fail' } })

    const res = await POST(
      makeRequest('RESULT1', { winner_item_id: '1', loser_item_id: '2' }),
      makeParams('RESULT1'),
    )
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })
})
