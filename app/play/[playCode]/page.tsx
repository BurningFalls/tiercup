import { mockTierCupForPlay, mockItems, mockPairs } from '@/lib/mock/play-session'
import { PlayClient } from '@/components/play/play-client'

export default function PlayPage() {
  return (
    <PlayClient
      tierCup={mockTierCupForPlay}
      items={mockItems}
      initialPairs={mockPairs}
    />
  )
}
