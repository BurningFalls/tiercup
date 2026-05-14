import { HomeClient } from "@/components/home/home-client"
import {
  mockPopularTierCups,
  mockLikedTierCups,
  mockRecentTierCups,
} from "@/lib/mock/tier-cups"

export default function HomePage() {
  // Task 025에서 Supabase 쿼리로 교체 예정
  return (
    <HomeClient
      popularTierCups={mockPopularTierCups}
      likedTierCups={mockLikedTierCups}
      recentTierCups={mockRecentTierCups}
    />
  )
}
