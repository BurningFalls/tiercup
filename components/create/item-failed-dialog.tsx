"use client"

import { TriangleAlertIcon, ClipboardIcon, CheckIcon } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ItemFailedDialogProps {
  open: boolean
  manageCode: string
  onClose: () => void
}

export function ItemFailedDialog({ open, manageCode, onClose }: ItemFailedDialogProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(manageCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TriangleAlertIcon className="size-5 text-destructive" />
            <DialogTitle>일부 아이템 생성에 실패했습니다</DialogTitle>
          </div>
          <DialogDescription>
            티어컵은 생성되었지만 일부 아이템 업로드에 실패했습니다.
            아래 관리 코드를 저장해두면 나중에 관리 페이지에서 아이템을 추가할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
          <span className="flex-1 font-mono text-sm">{manageCode}</span>
          <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={handleCopy}>
            {copied ? <CheckIcon className="size-4 text-green-600" /> : <ClipboardIcon className="size-4" />}
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
