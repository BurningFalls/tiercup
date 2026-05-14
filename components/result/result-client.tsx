"use client"

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BarChart2Icon, HeartIcon, PencilIcon, RefreshCwIcon, Share2Icon, TrophyIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResultTierList } from '@/components/result/result-tier-list'
import { ResultStats } from '@/components/result/result-stats'
import { ShareModal } from '@/components/result/share-modal'
import { copyToClipboard } from '@/lib/utils/clipboard'
import { cn } from '@/lib/utils'
import type { Item, PlayResult, PlayResultsResponse, TierCup } from '@/lib/types'

type ResultWithItem = PlayResult & { item: Item }

interface ResultClientProps {
  resultData: PlayResultsResponse
  tierCup: TierCup
  resultCode: string
}

export function ResultClient({ resultData, tierCup, resultCode }: ResultClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSharedMode = searchParams.get('mode') === 'shared'
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [liked, setLiked] = useState(false)

  const results = resultData.results as ResultWithItem[]
  const totalItems = results.length

  const handleLike = useCallback(() => {
    setLiked((prev) => !prev)
    // TODO: API 연동 시 POST/DELETE /api/tier-cups/:id/likes 호출
  }, [])

  const handleShareCopy = useCallback(async () => {
    const url = `${window.location.origin}/result/${resultCode}?mode=shared`
    await copyToClipboard(url)
  }, [resultCode])

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <TrophyIcon className="size-7 text-yellow-500" />
          <h1 className="text-2xl font-bold">{tierCup.title}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{tierCup.title} 결과</p>
      </div>

      {/* 본문 */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[1fr_280px]">
        {/* 좌측: 티어 목록 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">최종 티어</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultTierList results={results} />
          </CardContent>
        </Card>

        {/* 우측 사이드바 */}
        <aside className="flex flex-col gap-4">
          {isSharedMode ? (
            <>
              {/* 공유 링크 모드 */}
              <div className="rounded-lg border bg-muted/30 p-4 text-center">
                <p className="mb-3 text-sm font-medium">이 티어컵 재밌어 보이나요?</p>
                <Button
                  className="w-full"
                  onClick={() => router.push(`/play/${tierCup.play_code}`)}
                >
                  나도 해보기
                </Button>
              </div>

              <ResultStats
                comparisonCount={resultData.comparison_count}
                totalItems={totalItems}
                startedAt={resultData.started_at}
                completedAt={resultData.completed_at}
              />

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/stats/${tierCup.play_code}`)}
                >
                  <BarChart2Icon className="size-4" />
                  전체 통계 보기
                </Button>
                <Button variant="outline" className="w-full" onClick={handleShareCopy}>
                  <Share2Icon className="size-4" />
                  이 결과 공유하기
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* 플레이 완료 모드 */}
              <ResultStats
                comparisonCount={resultData.comparison_count}
                totalItems={totalItems}
                startedAt={resultData.started_at}
                completedAt={resultData.completed_at}
              />

              <div className="flex flex-col gap-2">
                <Button className="w-full" onClick={() => setShareModalOpen(true)}>
                  <Share2Icon className="size-4" />
                  결과 공유하기
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/stats/${tierCup.play_code}`)}
                >
                  <BarChart2Icon className="size-4" />
                  전체 통계 보기
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/result/${resultCode}/edit`)}
                >
                  <PencilIcon className="size-4" />
                  티어 수정하기
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/play/${tierCup.play_code}`)}
                >
                  <RefreshCwIcon className="size-4" />
                  다시하기
                </Button>
              </div>

              {/* 좋아요 버튼 */}
              <Button
                variant="ghost"
                className={cn(
                  'w-full gap-2',
                  liked && 'text-rose-500 hover:text-rose-600',
                )}
                onClick={handleLike}
              >
                <HeartIcon className={cn('size-4', liked && 'fill-current')} />
                {liked ? '좋아요 취소' : '좋아요'}
                <span className="text-muted-foreground">
                  {(tierCup.like_count + (liked ? 1 : 0)).toLocaleString()}
                </span>
              </Button>
            </>
          )}
        </aside>
      </div>

      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        resultCode={resultCode}
      />
    </div>
  )
}
