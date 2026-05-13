"use client"

import Link from "next/link"
import { ShareIcon, HeartIcon, BarChart2Icon, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { TierCup } from "@/lib/types"

interface TierCupCardProps {
  tiercup: TierCup
  onShare?: (tiercup: TierCup) => void
  onLike?: (tiercup: TierCup) => void
  isLiked?: boolean
}

export function TierCupCard({
  tiercup,
  onShare,
  onLike,
  isLiked = false,
}: TierCupCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/play/${tiercup.play_code}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-10 opacity-40" />
          </div>
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col gap-1 p-4">
        <Link
          href={`/play/${tiercup.play_code}`}
          className="line-clamp-2 text-sm font-semibold leading-snug hover:underline"
        >
          {tiercup.title}
        </Link>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{tiercup.play_count.toLocaleString()}회 플레이</span>
          <span>{tiercup.like_count.toLocaleString()} 좋아요</span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-1 px-4 pb-3 pt-0">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="공유"
          onClick={() => onShare?.(tiercup)}
        >
          <ShareIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="좋아요"
          onClick={() => onLike?.(tiercup)}
          className={cn(isLiked && "text-rose-500 hover:text-rose-600")}
        >
          <HeartIcon className={cn(isLiked && "fill-current")} />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="통계" asChild>
          <Link href={`/stats/${tiercup.play_code}`}>
            <BarChart2Icon />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
