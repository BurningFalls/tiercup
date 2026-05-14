"use client"

import { useState } from 'react'
import { CheckIcon, CopyIcon, Share2Icon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/utils/clipboard'

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resultCode: string
}

export function ShareModal({ open, onOpenChange, resultCode }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/result/${resultCode}?mode=shared`
      : `/result/${resultCode}?mode=shared`

  const handleCopy = async () => {
    const ok = await copyToClipboard(shareUrl)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Share2Icon className="size-5" />
            <DialogTitle>결과 공유하기</DialogTitle>
          </div>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">링크를 복사해서 결과를 공유하세요.</p>
          <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-sm">{shareUrl}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
              {copied ? '복사됨' : '복사'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
