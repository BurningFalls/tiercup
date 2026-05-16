import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Supabase server client 모킹
const mockSingle = vi.fn()
const mockSelect = vi.fn(() => ({ single: mockSingle }))
const mockInsert = vi.fn(() => ({ select: mockSelect }))
const mockFrom = vi.fn(() => ({ insert: mockInsert }))
const mockClient = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}))

// nanoid 모킹
vi.mock('@/lib/utils/code', () => ({
  generatePlayCode: vi.fn(() => 'ABC123'),
  generateManageCode: vi.fn(() => 'XYZ789abcdef'),
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/tier-cups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/tier-cups', () => {
  it('정상 생성 시 201과 play_code, manage_code를 반환한다', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 1, play_code: 'ABC123', manage_code: 'XYZ789abcdef' },
      error: null,
    })

    const res = await POST(makeRequest({ title: '디저트 월드컵' }))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.play_code).toBe('ABC123')
    expect(body.manage_code).toBe('XYZ789abcdef')
  })

  it('title 누락 시 400 VALIDATION_ERROR를 반환한다', async () => {
    const res = await POST(makeRequest({}))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('title이 빈 문자열이면 400 VALIDATION_ERROR를 반환한다', async () => {
    const res = await POST(makeRequest({ title: '' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('title이 30자 초과이면 400 VALIDATION_ERROR를 반환한다', async () => {
    const res = await POST(makeRequest({ title: 'a'.repeat(31) }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('Supabase INSERT 실패(non-unique) 시 500을 반환한다', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: '99999', message: 'fail' } })

    const res = await POST(makeRequest({ title: '디저트 월드컵' }))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('잘못된 JSON body이면 400을 반환한다', async () => {
    const req = new NextRequest('http://localhost/api/tier-cups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })
})
