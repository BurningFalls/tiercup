import { mockResultData, mockTierCupForResult } from '@/lib/mock/result'
import { ResultClient } from '@/components/result/result-client'

// TODO: 실제 API 연동 시 resultCode 기반으로 데이터를 fetch
// TODO: isSharedMode는 서버에서 세션 소유권 확인으로 교체
interface ResultPageProps {
  params: Promise<{ resultCode: string }>
  searchParams: Promise<{ mode?: string }>
}

export default async function ResultPage({ params, searchParams }: ResultPageProps) {
  const { resultCode } = await params
  const { mode } = await searchParams
  const isSharedMode = mode === 'shared'

  return (
    <ResultClient
      resultData={mockResultData}
      tierCup={mockTierCupForResult}
      resultCode={resultCode}
      isSharedMode={isSharedMode}
    />
  )
}
