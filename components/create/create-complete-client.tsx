"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CheckCircle2Icon, CheckIcon, CopyIcon, TriangleAlertIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/utils/clipboard"

interface CreateCompleteClientProps {
  playCode: string
  manageCode: string
  title: string
}

function useCopyState() {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleCopy = async (url: string) => {
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopied(true)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    }
  }

  return { copied, handleCopy }
}

export function CreateCompleteClient({ playCode, manageCode, title }: CreateCompleteClientProps) {
  const [origin, setOrigin] = useState<string | null>(null)
  const { copied: copiedPlay, handleCopy: handleCopyPlay } = useCopyState()
  const { copied: copiedManage, handleCopy: handleCopyManage } = useCopyState()

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const playUrl = origin ? `${origin}/play/${playCode}` : null
  const manageUrl = origin ? `${origin}/manage/${manageCode}` : null

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* 완료 헤더 */}
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2Icon className="size-14 text-green-500" />
        <h1 className="text-2xl font-bold">티어컵이 생성되었습니다!</h1>
        <p className="text-muted-foreground">{title}</p>
      </div>

      {/* 공유 링크 */}
      <div className="space-y-2">
        <p className="text-sm font-medium">공유 링크</p>
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {playUrl ?? "URL 로딩 중..."}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => playUrl && handleCopyPlay(playUrl)}
            disabled={!playUrl}
            className="shrink-0"
          >
            {copiedPlay ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
            {copiedPlay ? "복사됨" : "복사"}
          </Button>
        </div>
      </div>

      {/* 관리 링크 */}
      <div className="space-y-2">
        <p className="text-sm font-medium">관리 링크</p>
        <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 dark:border-orange-800 dark:bg-orange-950/30">
          <TriangleAlertIcon className="size-4 shrink-0 text-orange-500" />
          <p className="flex-1 text-xs text-orange-600 dark:text-orange-400">
            이 링크는 다시 확인할 수 없습니다. 안전한 곳에 보관하세요.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {manageUrl ?? "URL 로딩 중..."}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => manageUrl && handleCopyManage(manageUrl)}
            disabled={!manageUrl}
            className="shrink-0"
          >
            {copiedManage ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
            {copiedManage ? "복사됨" : "복사"}
          </Button>
        </div>
      </div>

      {/* 플레이 버튼 */}
      <Button size="lg" className="w-full" asChild>
        <Link href={`/play/${playCode}`}>지금 바로 플레이하기</Link>
      </Button>
    </div>
  )
}
