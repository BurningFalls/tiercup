import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Storage 모킹
const mockGetPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://storage.example.com/item-images/1/abc.jpg' } }))
const mockUpload = vi.fn(() => Promise.resolve({ error: null }))
const mockStorageFrom = vi.fn(() => ({ upload: mockUpload, getPublicUrl: mockGetPublicUrl }))

// DB 모킹
const mockItemSingle = vi.fn()
const mockItemSelect = vi.fn(() => ({ single: mockItemSingle }))
const mockItemInsert = vi.fn(() => ({ select: mockItemSelect }))

const mockCupSingle = vi.fn()
const mockCupEq = vi.fn(() => ({ single: mockCupSingle }))
const mockCupSelect = vi.fn(() => ({ eq: mockCupEq }))

const mockFrom = vi.fn((table: string) => {
  if (table === 'tier_cups') return { select: mockCupSelect }
  return { insert: mockItemInsert }
})

const mockClient = {
  from: mockFrom,
  storage: { from: mockStorageFrom },
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}))

import { POST } from './route'

function makeParams(id: string) {
  return { params: Promise.resolve({ playCode: id }) }
}

// jsdom 환경에서 NextRequest.formData()가 undici File 체크로 실패하므로
// request.formData()를 모킹하는 방식으로 테스트
function makeRequestWithFormData(fields: Record<string, string | { name: string; type: string; size: number }>) {
  const req = new NextRequest('http://localhost/api/tier-cups/JBq6Ud/items', {
    method: 'POST',
  })

  const formDataMap = new Map<string, string | { name: string; type: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> }>()
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'object') {
      formDataMap.set(key, {
        ...value,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(value.size)),
      })
    } else {
      formDataMap.set(key, value)
    }
  }

  vi.spyOn(req, 'formData').mockResolvedValue({
    get: (key: string) => formDataMap.get(key) ?? null,
  } as unknown as FormData)

  return req
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCupSingle.mockResolvedValue({ data: { id: 1 }, error: null })
})

describe('POST /api/tier-cups/[playCode]/items', () => {
  it('유효하지 않은 playCode 형식이면 400 VALIDATION_ERROR를 반환한다', async () => {
    const req = makeRequestWithFormData({ name: '아이템', display_order: '0' })
    const res = await POST(req, makeParams('!!'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('이미지 없이 name만으로 아이템을 생성한다 (201)', async () => {
    mockItemSingle.mockResolvedValue({
      data: { id: 10, name: '케이크', image_url: null },
      error: null,
    })

    const req = makeRequestWithFormData({ name: '케이크', display_order: '0' })
    const res = await POST(req, makeParams('JBq6Ud'))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.name).toBe('케이크')
    expect(body.image_url).toBeNull()
  })

  it('이미지 포함 시 Storage에 업로드하고 image_url을 반환한다 (201)', async () => {
    mockItemSingle.mockResolvedValue({
      data: { id: 11, name: '도넛', image_url: 'https://storage.example.com/item-images/1/abc.jpg' },
      error: null,
    })

    const req = makeRequestWithFormData({
      name: '도넛',
      display_order: '1',
      image: { name: 'donut.jpg', type: 'image/jpeg', size: 4 },
    })
    const res = await POST(req, makeParams('JBq6Ud'))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(mockUpload).toHaveBeenCalledOnce()
    expect(body.image_url).toBe('https://storage.example.com/item-images/1/abc.jpg')
  })

  it('name 누락 시 400 VALIDATION_ERROR를 반환한다', async () => {
    const req = makeRequestWithFormData({ display_order: '0' })
    const res = await POST(req, makeParams('JBq6Ud'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('name이 빈 문자열이면 400을 반환한다', async () => {
    const req = makeRequestWithFormData({ name: '', display_order: '0' })
    const res = await POST(req, makeParams('JBq6Ud'))

    expect(res.status).toBe(400)
  })

  it('name이 50자 초과이면 400을 반환한다', async () => {
    const req = makeRequestWithFormData({ name: 'a'.repeat(51), display_order: '0' })
    const res = await POST(req, makeParams('JBq6Ud'))

    expect(res.status).toBe(400)
  })

  it('5MB 초과 이미지이면 400 VALIDATION_ERROR를 반환한다', async () => {
    const req = makeRequestWithFormData({
      name: '아이템',
      display_order: '0',
      image: { name: 'big.jpg', type: 'image/jpeg', size: 6 * 1024 * 1024 },
    })
    const res = await POST(req, makeParams('JBq6Ud'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('허용되지 않는 이미지 형식이면 400 VALIDATION_ERROR를 반환한다', async () => {
    const req = makeRequestWithFormData({
      name: '아이템',
      display_order: '0',
      image: { name: 'file.pdf', type: 'application/pdf', size: 100 },
    })
    const res = await POST(req, makeParams('JBq6Ud'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('존재하지 않는 play_code이면 404 TIER_CUP_NOT_FOUND를 반환한다', async () => {
    mockCupSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } })

    const req = makeRequestWithFormData({ name: '아이템', display_order: '0' })
    const res = await POST(req, makeParams('NOTEXIST'))
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error.code).toBe('TIER_CUP_NOT_FOUND')
  })

  it('DB 연결 오류(PGRST116 아닌 에러)이면 500 INTERNAL_ERROR를 반환한다', async () => {
    mockCupSingle.mockResolvedValue({ data: null, error: { code: '08006', message: 'connection failure' } })

    const req = makeRequestWithFormData({ name: '아이템', display_order: '0' })
    const res = await POST(req, makeParams('JBq6Ud'))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('유효하지 않은 image_url이면 400 VALIDATION_ERROR를 반환한다', async () => {
    const req = makeRequestWithFormData({ name: '아이템', display_order: '0', image_url: 'not-a-url' })
    const res = await POST(req, makeParams('JBq6Ud'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })
})
