import { mockTierCupForPlay, mockItems, mockPairs } from '@/lib/mock/play-session'
import { PlayClient } from '@/components/play/play-client'

// Next.js 15 App Router (params는 현재 mock 단계에서 미사용)
// TODO: 실제 API 연동 시 params.playCode 기반으로 데이터를 fetch
// TODO: router.push('/result/mock-result-001') → 실제 result_code로 교체 (play-client.tsx)
export default function PlayPage() {
  return (
    <PlayClient
      tierCup={mockTierCupForPlay}
      items={mockItems}
      initialPairs={mockPairs}
    />
  )
}
