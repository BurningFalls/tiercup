"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2Icon, CheckIcon, CopyIcon, TriangleAlertIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/utils/clipboard"

interface CreateCompleteClientProps {
  playCode: string
  manageCode: string
  title: string
}

export function CreateCompleteClient({ playCode, manageCode, title }: CreateCompleteClientProps) {
  const [origin, setOrigin] = useState("")
  const [copiedPlay, setCopiedPlay] = useState(false)
  const [copiedManage, setCopiedManage] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const playUrl = `${origin}/play/${playCode}`
  const manageUrl = `${origin}/manage/${manageCode}`

  const handleCopyPlay = async () => {
    const ok = await copyToClipboard(playUrl)
    if (ok) {
      setCopiedPlay(true)
      setTimeout(() => setCopiedPlay(false), 2000)
    }
  }

  const handleCopyManage = async () => {
    const ok = await copyToClipboard(manageUrl)
    if (ok) {
      setCopiedManage(true)
      setTimeout(() => setCopiedManage(false), 2000)
    }
  }

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
          <span className="min-w-0 flex-1 truncate text-sm">{playUrl}</span>
          <Button size="sm" variant="outline" onClick={handleCopyPlay} className="shrink-0">
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
          <span className="min-w-0 flex-1 truncate text-sm">{manageUrl}</span>
          <Button size="sm" variant="outline" onClick={handleCopyManage} className="shrink-0">
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
