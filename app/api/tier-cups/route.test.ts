import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// GET용 쿼리 결과를 담을 변수 (각 테스트에서 직접 설정)
let getQueryResult: { data: unknown; error: unknown; count: number | null } = {
  data: [],
  error: null,
  count: 0,
}

// ilike 호출 여부 추적용
const mockIlike = vi.fn()

// GET mock chain: select → order → range → thenable (search 없을 때)
//                select → order → ilike → range → thenable (search 있을 때)
const mockRange = vi.fn()
const mockOrder = vi.fn()
const mockGetSelect = vi.fn()

function buildGetChain() {
  // range를 호출하면 thenable 반환 (검색 여부와 무관하게 마지막 단계)
  mockRange.mockImplementation(() => Promise.resolve(getQueryResult))

  // ilike를 호출하면 { range }를 반환
  mockIlike.mockImplementation(() => ({ range: mockRange }))

  // order → { range, ilike } 둘 다 지원
  mockOrder.mockImplementation(() => ({ range: mockRange, ilike: mockIlike }))

  // select → { order }
  mockGetSelect.mockImplementation(() => ({ order: mockOrder }))
}

// POST용 mock chain: insert → select → single
const mockSingle = vi.fn()
const mockPostSelect = vi.fn(() => ({ single: mockSingle }))
const mockInsert = vi.fn(() => ({ select: mockPostSelect }))

const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  select: mockGetSelect,
}))
const mockClient = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}))

vi.mock('@/lib/utils/code', () => ({
  generatePlayCode: vi.fn(() => 'ABC123'),
  generateManageCode: vi.fn(() => 'XYZ789abcdef'),
}))

import { GET, POST } from './route'

function makeGetRequest(params?: Record<string, string>) {
  const url = new URL('http://localhost/api/tier-cups')
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  return new NextRequest(url)
}

function makePostRequest(body: unknown) {
  return new NextRequest('http://localhost/api/tier-cups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  getQueryResult = { data: [], error: null, count: 0 }
  buildGetChain()
})

describe('GET /api/tier-cups', () => {
  const mockData = [
    { id: 1, play_code: 'abc123', title: '테스트', play_count: 10, like_count: 5, created_at: '2026-01-01', updated_at: '2026-01-01' },
  ]

  it('기본 목록 조회 시 200과 data/total/page를 반환한다', async () => {
    getQueryResult = { data: mockData, error: null, count: 1 }

    const res = await GET(makeGetRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(body.total).toBe(1)
    expect(body.page).toBe(1)
  })

  it('sort=latest 파라미터 전달 시 created_at 기준으로 정렬한다', async () => {
    getQueryResult = { data: mockData, error: null, count: 1 }

    const res = await GET(makeGetRequest({ sort: 'latest' }))
    expect(res.status).toBe(200)
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('sort=likes 파라미터 전달 시 like_count 기준으로 정렬한다', async () => {
    getQueryResult = { data: mockData, error: null, count: 1 }

    const res = await GET(makeGetRequest({ sort: 'likes' }))
    expect(res.status).toBe(200)
    expect(mockOrder).toHaveBeenCalledWith('like_count', { ascending: false })
  })

  it('page=2 파라미터 전달 시 올바른 offset으로 range를 호출한다', async () => {
    getQueryResult = { data: [], error: null, count: 0 }

    const res = await GET(makeGetRequest({ page: '2' }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.page).toBe(2)
    expect(mockRange).toHaveBeenCalledWith(12, 23)
  })

  it('search 파라미터가 있으면 ilike를 호출한다', async () => {
    getQueryResult = { data: mockData, error: null, count: 1 }

    const res = await GET(makeGetRequest({ search: '테스트' }))
    expect(res.status).toBe(200)
    expect(mockIlike).toHaveBeenCalledWith('title', '%테스트%')
  })

  it('Supabase 오류 시 500을 반환한다', async () => {
    getQueryResult = { data: null, error: { code: '99999' }, count: null }

    const res = await GET(makeGetRequest())
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })
})

describe('POST /api/tier-cups', () => {
  it('정상 생성 시 201과 play_code, manage_code를 반환한다', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 1, play_code: 'ABC123', manage_code: 'XYZ789abcdef' },
      error: null,
    })

    const res = await POST(makePostRequest({ title: '디저트 월드컵' }))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.play_code).toBe('ABC123')
    expect(body.manage_code).toBe('XYZ789abcdef')
  })

  it('title 누락 시 400 VALIDATION_ERROR를 반환한다', async () => {
    const res = await POST(makePostRequest({}))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('title이 빈 문자열이면 400 VALIDATION_ERROR를 반환한다', async () => {
    const res = await POST(makePostRequest({ title: '' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('title이 30자 초과이면 400 VALIDATION_ERROR를 반환한다', async () => {
    const res = await POST(makePostRequest({ title: 'a'.repeat(31) }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('Supabase INSERT 실패(non-unique) 시 500을 반환한다', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: '99999', message: 'fail' } })

    const res = await POST(makePostRequest({ title: '디저트 월드컵' }))
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
