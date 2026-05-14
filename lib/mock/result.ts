import type { PlayResultsResponse } from '@/lib/types'
import { mockItems, mockTierCupForPlay } from '@/lib/mock/play-session'

export { mockTierCupForPlay as mockTierCupForResult }

export const mockResultData: PlayResultsResponse = {
  results: [
    { id: 'pr-01', play_session_id: 'mock-session-001', item_id: 'item-01', tier: 'S', tier_order: 1, item: mockItems[0] },
    { id: 'pr-03', play_session_id: 'mock-session-001', item_id: 'item-03', tier: 'S', tier_order: 2, item: mockItems[2] },
    { id: 'pr-05', play_session_id: 'mock-session-001', item_id: 'item-05', tier: 'A', tier_order: 1, item: mockItems[4] },
    { id: 'pr-07', play_session_id: 'mock-session-001', item_id: 'item-07', tier: 'A', tier_order: 2, item: mockItems[6] },
    { id: 'pr-02', play_session_id: 'mock-session-001', item_id: 'item-02', tier: 'B', tier_order: 1, item: mockItems[1] },
    { id: 'pr-06', play_session_id: 'mock-session-001', item_id: 'item-06', tier: 'B', tier_order: 2, item: mockItems[5] },
    { id: 'pr-04', play_session_id: 'mock-session-001', item_id: 'item-04', tier: 'C', tier_order: 1, item: mockItems[3] },
    { id: 'pr-08', play_session_id: 'mock-session-001', item_id: 'item-08', tier: 'D', tier_order: 1, item: mockItems[7] },
  ],
  comparison_count: 12,
  started_at: '2026-05-14T10:00:00Z',
  completed_at: '2026-05-14T10:02:34Z',
}
