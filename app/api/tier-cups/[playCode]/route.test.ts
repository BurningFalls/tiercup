import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockSingle = vi.fn()
const mockOrder = vi.fn(() => ({ single: mockSingle }))
const mockEq = vi.fn(() => ({ order: mockOrder }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))
const mockClient = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}))

import { GET } from './route'

function makeRequest(playCode: string) {
  return new NextRequest(`http://localhost/api/tier-cups/${playCode}`)
}

function makeParams(playCode: string) {
  return { params: Promise.resolve({ playCode }) }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/tier-cups/[playCode]', () => {
  it('유효하지 않은 playCode 형식이면 400 VALIDATION_ERROR를 반환한다', async () => {
    const res = await GET(makeRequest('!!bad'), makeParams('!!bad'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  const mockTierCup = {
    id: 1,
    play_code: 'abc123',
    title: '테스트 티어컵',
    play_count: 10,
    like_count: 5,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    items: [
      { id: 1, name: '아이템1', image_url: null, display_order: 0 },
      { id: 2, name: '아이템2', image_url: 'https://example.com/img.jpg', display_order: 1 },
    ],
  }

  it('유효한 playCode로 조회 시 200과 tier_cup + items를 반환한다', async () => {
    mockSingle.mockResolvedValue({ data: mockTierCup, error: null })

    const res = await GET(makeRequest('abc123'), makeParams('abc123'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.play_code).toBe('abc123')
    expect(body.title).toBe('테스트 티어컵')
    expect(body.items).toHaveLength(2)
    expect(body.id).toBe('1')
    expect(body.items[0].id).toBe('1')
  })

  it('manage_code를 응답에 포함하지 않는다', async () => {
    mockSingle.mockResolvedValue({
      data: { ...mockTierCup, manage_code: 'secret' },
      error: null,
    })

    const res = await GET(makeRequest('abc123'), makeParams('abc123'))
    const body = await res.json()

    expect(body.manage_code).toBeUndefined()
  })

  it('존재하지 않는 playCode 조회 시 404를 반환한다', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    const res = await GET(makeRequest('notfound'), makeParams('notfound'))
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error.code).toBe('TIER_CUP_NOT_FOUND')
  })

  it('Supabase 오류 시 500을 반환한다', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: '99999' } })

    const res = await GET(makeRequest('abc123'), makeParams('abc123'))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })
})
