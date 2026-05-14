import type { Item, Tier, TierCup } from '@/lib/types'
import type { NextPairResponse } from '@/lib/types'

// 주의: manage_code는 플레이 화면에서 사용되지 않는 관리용 코드입니다.
// 실제 API 연동 시 플레이 화면에 manage_code를 노출하지 않도록 서버 응답을 제한해야 합니다.
export const mockTierCupForPlay: TierCup = {
  id: 'mock-tier-cup-001',
  play_code: 'abc123',
  manage_code: 'mock-manage-001',
  title: '디저트 월드컵',
  play_count: 142,
  like_count: 38,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
}

export const mockItems: Item[] = [
  { id: 'item-01', tier_cup_id: 'mock-tier-cup-001', name: '마카롱', image_url: 'https://picsum.photos/seed/macaron/400/400', display_order: 1, created_at: '2026-05-01T00:00:00Z' },
  { id: 'item-02', tier_cup_id: 'mock-tier-cup-001', name: '티라미수', image_url: 'https://picsum.photos/seed/tiramisu/400/400', display_order: 2, created_at: '2026-05-01T00:00:00Z' },
  { id: 'item-03', tier_cup_id: 'mock-tier-cup-001', name: '크레이프 케이크', image_url: 'https://picsum.photos/seed/crepe/400/400', display_order: 3, created_at: '2026-05-01T00:00:00Z' },
  { id: 'item-04', tier_cup_id: 'mock-tier-cup-001', name: '브라우니', image_url: 'https://picsum.photos/seed/brownie/400/400', display_order: 4, created_at: '2026-05-01T00:00:00Z' },
  { id: 'item-05', tier_cup_id: 'mock-tier-cup-001', name: '와플', image_url: 'https://picsum.photos/seed/waffle/400/400', display_order: 5, created_at: '2026-05-01T00:00:00Z' },
  { id: 'item-06', tier_cup_id: 'mock-tier-cup-001', name: '판나코타', image_url: 'https://picsum.photos/seed/pannacotta/400/400', display_order: 6, created_at: '2026-05-01T00:00:00Z' },
  { id: 'item-07', tier_cup_id: 'mock-tier-cup-001', name: '에클레어', image_url: 'https://picsum.photos/seed/eclair/400/400', display_order: 7, created_at: '2026-05-01T00:00:00Z' },
  { id: 'item-08', tier_cup_id: 'mock-tier-cup-001', name: '츄러스', image_url: 'https://picsum.photos/seed/churros/400/400', display_order: 8, created_at: '2026-05-01T00:00:00Z' },
]

export function mockInitialTierMap(items: Item[]): Record<string, Tier> {
  return Object.fromEntries(items.map((item) => [item.id, '?' as Tier]))
}

// 12쌍 비교 시퀀스
export const mockPairs: NextPairResponse[] = [
  { item_a: mockItems[0], item_b: mockItems[1], estimated_total: 12 },
  { item_a: mockItems[2], item_b: mockItems[3], estimated_total: 12 },
  { item_a: mockItems[4], item_b: mockItems[5], estimated_total: 12 },
  { item_a: mockItems[6], item_b: mockItems[7], estimated_total: 12 },
  { item_a: mockItems[0], item_b: mockItems[2], estimated_total: 12 },
  { item_a: mockItems[1], item_b: mockItems[3], estimated_total: 12 },
  { item_a: mockItems[4], item_b: mockItems[6], estimated_total: 12 },
  { item_a: mockItems[5], item_b: mockItems[7], estimated_total: 12 },
  { item_a: mockItems[0], item_b: mockItems[4], estimated_total: 12 },
  { item_a: mockItems[1], item_b: mockItems[5], estimated_total: 12 },
  { item_a: mockItems[2], item_b: mockItems[6], estimated_total: 12 },
  { item_a: mockItems[3], item_b: mockItems[7], estimated_total: 12 },
]

// 특정 비교 횟수 완료 후 반영되는 티어 업데이트
export const mockTierUpdates: Record<number, Record<string, Tier>> = {
  3: {
    'item-01': 'S',
    'item-02': 'B',
    'item-05': 'A',
    'item-06': 'C',
  },
  6: {
    'item-03': 'A',
    'item-04': 'D',
    'item-07': 'B',
    'item-08': 'F',
  },
  9: {
    'item-01': 'S',
    'item-03': 'S',
    'item-05': 'A',
    'item-07': 'A',
    'item-02': 'B',
    'item-06': 'B',
    'item-04': 'C',
    'item-08': 'D',
  },
}
