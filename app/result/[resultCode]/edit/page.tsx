import { Suspense } from 'react'
import { mockResultData, mockTierCupForResult } from '@/lib/mock/result'
import { ResultEditClient } from '@/components/result/result-edit-client'

// TODO: 실제 API 연동 시 resultCode 기반으로 데이터를 fetch
interface ResultEditPageProps {
  params: Promise<{ resultCode: string }>
}

export default function ResultEditPage({ params }: ResultEditPageProps) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-muted-foreground">로딩 중...</div></div>}>
      <ResultEditContent params={params} />
    </Suspense>
  )
}

async function ResultEditContent({ params }: ResultEditPageProps) {
  const { resultCode } = await params

  return (
    <ResultEditClient
      resultData={mockResultData}
      tierCup={mockTierCupForResult}
      resultCode={resultCode}
    />
  )
}
