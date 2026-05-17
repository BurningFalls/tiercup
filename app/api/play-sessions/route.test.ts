import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockItems = [
  { id: 1, name: '케이크', image_url: null, display_order: 1 },
  { id: 2, name: '도넛', image_url: null, display_order: 2 },
  { id: 3, name: '아이스크림', image_url: null, display_order: 3 },
  { id: 4, name: '마카롱', image_url: null, display_order: 4 },
]

const mockTierCup = { id: 10, title: '디저트 월드컵', items: mockItems }

// tier_cups 조회 (select → eq → order → single)
const mockTierCupSingle = vi.fn()
const mockTierCupOrder = vi.fn(() => ({ single: mockTierCupSingle }))
const mockTierCupEq = vi.fn(() => ({ order: mockTierCupOrder }))
const mockTierCupSelect = vi.fn(() => ({ eq: mockTierCupEq }))

// play_sessions insert (insert → select → single)
const mockSessionSingle = vi.fn()
const mockSessionInsertSelect = vi.fn(() => ({ single: mockSessionSingle }))
const mockSessionInsert = vi.fn(() => ({ select: mockSessionInsertSelect }))

// rpc
const mockRpc = vi.fn(() => Promise.resolve({ error: null }))

const mockFrom = vi.fn((table: string) => {
  if (table === 'tier_cups') return { select: mockTierCupSelect }
  if (table === 'play_sessions') return { insert: mockSessionInsert }
  return {}
})

const mockClient = { from: mockFrom, rpc: mockRpc }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}))

vi.mock('@/lib/utils/code', () => ({
  generateResultCode: vi.fn(() => 'RESULT1'),
}))

vi.mock('@/lib/utils/comparison-order', () => ({
  selectNextPair: vi.fn(() => ['1', '2']),
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/play-sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockTierCupSingle.mockResolvedValue({ data: mockTierCup, error: null })
  mockSessionSingle.mockResolvedValue({ data: { id: 1, result_code: 'RESULT1' }, error: null })
  mockRpc.mockResolvedValue({ error: null })
})

describe('POST /api/play-sessions', () => {
  it('정상 생성 시 201과 result_code, title, items, first_pair를 반환한다', async () => {
    const res = await POST(makeRequest({ play_code: 'ABC123' }))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.result_code).toBe('RESULT1')
    expect(body.title).toBe('디저트 월드컵')
    expect(body.items).toHaveLength(4)
    expect(body.first_pair).not.toBeNull()
    expect(body.first_pair.item_a.id).toBe('1')
    expect(body.first_pair.item_b.id).toBe('2')
  })

  it('play_code 누락 시 400 VALIDATION_ERROR를 반환한다', async () => {
    const res = await POST(makeRequest({}))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('잘못된 JSON body이면 400을 반환한다', async () => {
    const req = new NextRequest('http://localhost/api/play-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('티어컵을 찾을 수 없으면 404 TIER_CUP_NOT_FOUND를 반환한다', async () => {
    mockTierCupSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    const res = await POST(makeRequest({ play_code: 'NOTFOUND' }))
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error.code).toBe('TIER_CUP_NOT_FOUND')
  })

  it('Supabase 조회 오류 시 500을 반환한다', async () => {
    mockTierCupSingle.mockResolvedValue({ data: null, error: { code: '99999' } })

    const res = await POST(makeRequest({ play_code: 'ABC123' }))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('세션 INSERT 실패(non-unique) 시 500을 반환한다', async () => {
    mockSessionSingle.mockResolvedValue({ data: null, error: { code: '99999' } })

    const res = await POST(makeRequest({ play_code: 'ABC123' }))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('selectNextPair가 null이면 first_pair가 null이다', async () => {
    const { selectNextPair } = await import('@/lib/utils/comparison-order')
    vi.mocked(selectNextPair).mockReturnValueOnce(null)

    const res = await POST(makeRequest({ play_code: 'ABC123' }))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.first_pair).toBeNull()
  })
})
