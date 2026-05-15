import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/topological-sort', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/topological-sort', () => {
  it('정상 요청 시 200과 tier_map을 반환한다', async () => {
    const res = await POST(makeRequest({
      item_ids: ['a', 'b', 'c', 'd'],
      comparisons: [
        { winner_item_id: 'a', loser_item_id: 'b' },
        { winner_item_id: 'a', loser_item_id: 'c' },
        { winner_item_id: 'b', loser_item_id: 'd' },
        { winner_item_id: 'c', loser_item_id: 'd' },
      ],
    }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.tier_map).toBeDefined()
    expect(Object.keys(body.tier_map)).toHaveLength(4)
  })

  it('비교 없어도 200을 반환하며 모두 ? 티어', async () => {
    const res = await POST(makeRequest({
      item_ids: ['a', 'b'],
      comparisons: [],
    }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.tier_map['a']).toBe('?')
    expect(body.tier_map['b']).toBe('?')
  })

  it('item_ids가 빈 배열이면 400을 반환한다', async () => {
    const res = await POST(makeRequest({ item_ids: [], comparisons: [] }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('item_ids가 없으면 400을 반환한다', async () => {
    const res = await POST(makeRequest({ comparisons: [] }))
    expect(res.status).toBe(400)
  })

  it('comparisons의 winner_item_id가 item_ids에 없으면 400을 반환한다', async () => {
    const res = await POST(makeRequest({
      item_ids: ['a', 'b'],
      comparisons: [{ winner_item_id: 'z', loser_item_id: 'b' }],
    }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('comparisons의 loser_item_id가 item_ids에 없으면 400을 반환한다', async () => {
    const res = await POST(makeRequest({
      item_ids: ['a', 'b'],
      comparisons: [{ winner_item_id: 'a', loser_item_id: 'z' }],
    }))
    expect(res.status).toBe(400)
  })

  it('잘못된 JSON body이면 400을 반환한다', async () => {
    const req = new NextRequest('http://localhost/api/topological-sort', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('comparisons 형식이 잘못되면 400을 반환한다', async () => {
    const res = await POST(makeRequest({
      item_ids: ['a', 'b'],
      comparisons: [{ invalid: true }],
    }))
    expect(res.status).toBe(400)
  })

  it('최상위 아이템이 S 티어에 배정된다', async () => {
    // a가 모두를 이김 → 최고 level → S 티어
    const res = await POST(makeRequest({
      item_ids: ['a', 'b', 'c', 'd', 'e', 'f'],
      comparisons: [
        { winner_item_id: 'a', loser_item_id: 'b' },
        { winner_item_id: 'a', loser_item_id: 'c' },
        { winner_item_id: 'a', loser_item_id: 'd' },
        { winner_item_id: 'a', loser_item_id: 'e' },
        { winner_item_id: 'a', loser_item_id: 'f' },
        { winner_item_id: 'b', loser_item_id: 'c' },
        { winner_item_id: 'b', loser_item_id: 'd' },
        { winner_item_id: 'b', loser_item_id: 'e' },
        { winner_item_id: 'b', loser_item_id: 'f' },
        { winner_item_id: 'c', loser_item_id: 'd' },
        { winner_item_id: 'c', loser_item_id: 'e' },
        { winner_item_id: 'c', loser_item_id: 'f' },
        { winner_item_id: 'd', loser_item_id: 'e' },
        { winner_item_id: 'd', loser_item_id: 'f' },
        { winner_item_id: 'e', loser_item_id: 'f' },
      ],
    }))
    const body = await res.json()
    expect(body.tier_map['a']).toBe('S')
    expect(body.tier_map['f']).toBe('F')
  })
})
