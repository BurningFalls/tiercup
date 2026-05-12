export type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'F' | '?'

export interface TierCup {
  id: string
  play_code: string
  manage_code: string
  title: string
  play_count: number
  like_count: number
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  tier_cup_id: string
  name: string
  image_url: string | null
  display_order: number
  created_at: string
}

export interface PlaySession {
  id: string
  tier_cup_id: string
  result_code: string
  status: 'in_progress' | 'completed'
  comparison_count: number
  started_at: string
  completed_at: string | null
}

export interface Comparison {
  id: string
  play_session_id: string
  winner_item_id: string
  loser_item_id: string
  created_at: string
}

export interface PlayResult {
  id: string
  play_session_id: string
  item_id: string
  tier: Tier
  tier_order: number
}

export interface Like {
  id: string
  tier_cup_id: string
  client_id: string
  created_at: string
}

// API 요청/응답 타입

export interface CreateTierCupRequest {
  title: string
}

export interface CreateTierCupResponse {
  id: string
  play_code: string
  manage_code: string
}

export interface CreateItemRequest {
  tier_cup_id: string
  name: string
  image_url: string
  display_order: number
}

export interface GetTierCupsQuery {
  sort?: 'popular' | 'likes' | 'latest'
  page?: number
  search?: string
}

export interface GetTierCupsResponse {
  data: TierCup[]
  total: number
  page: number
}

export interface CreatePlaySessionResponse {
  id: string
  result_code: string
}

export interface NextPairResponse {
  item_a: Item
  item_b: Item
  estimated_total: number
}

export interface SubmitComparisonRequest {
  winner_item_id: string
  loser_item_id: string
}

export interface PlayResultsResponse {
  results: (PlayResult & { item: Item })[]
  comparison_count: number
  started_at: string
  completed_at: string | null
}

export interface StatsResponse {
  tier_distribution: Record<string, Record<Tier, number>> // key: item_id
  total_plays: number
  total_comparisons: number
  avg_duration_seconds: number
  top_s_tier: Item | null
  top_f_tier: Item | null
  most_contested: { item_a: Item; item_b: Item } | null
}
