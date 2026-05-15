import type { StatsResponse } from '@/lib/types'
import { mockItems } from '@/lib/mock/play-session'

export const mockStatsData: StatsResponse = {
  tier_distribution: {
    'item-01': { S: 45, A: 30, B: 15, C: 7, D: 2, F: 1, '?': 0 }, // 마카롱 - S티어 압도적
    'item-02': { S: 5, A: 15, B: 35, C: 25, D: 15, F: 5, '?': 0 }, // 티라미수 - B티어 중심
    'item-03': { S: 30, A: 35, B: 20, C: 10, D: 3, F: 2, '?': 0 }, // 크레이프 케이크 - A~S
    'item-04': { S: 2, A: 8, B: 20, C: 30, D: 25, F: 15, '?': 0 }, // 브라우니 - C~D
    'item-05': { S: 10, A: 25, B: 30, C: 20, D: 10, F: 5, '?': 0 }, // 와플 - B~A
    'item-06': { S: 3, A: 7, B: 15, C: 20, D: 30, F: 25, '?': 0 }, // 판나코타 - D~F
    'item-07': { S: 15, A: 25, B: 25, C: 20, D: 10, F: 5, '?': 0 }, // 에클레어 - 균등
    'item-08': { S: 1, A: 5, B: 10, C: 18, D: 28, F: 38, '?': 0 }, // 츄러스 - F티어 압도적
  },
  total_plays: 100,
  total_comparisons: 1247,
  avg_duration_seconds: 154,
  top_s_tier: mockItems[0], // 마카롱
  top_f_tier: mockItems[7], // 츄러스
  most_contested: { item_a: mockItems[2], item_b: mockItems[6] }, // 크레이프 케이크 vs 에클레어
}
