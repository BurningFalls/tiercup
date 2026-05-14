import { Suspense } from 'react'
import { mockResultData, mockTierCupForResult } from '@/lib/mock/result'
import { ResultClient } from '@/components/result/result-client'

// TODO: 실제 API 연동 시 resultCode 기반으로 데이터를 fetch
// TODO: isSharedMode는 서버에서 세션 소유권 확인으로 교체
interface ResultPageProps {
  params: Promise<{ resultCode: string }>
}

export default function ResultPage({ params }: ResultPageProps) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-muted-foreground">로딩 중...</div></div>}>
      <ResultContent params={params} />
    </Suspense>
  )
}

async function ResultContent({ params }: ResultPageProps) {
  const { resultCode } = await params

  return (
    <ResultClient
      resultData={mockResultData}
      tierCup={mockTierCupForResult}
      resultCode={resultCode}
    />
  )
}
