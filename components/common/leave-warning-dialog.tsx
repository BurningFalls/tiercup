"use client"

import { TriangleAlertIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface LeaveWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
}

export function LeaveWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "페이지를 떠나시겠습니까?",
  description = "저장되지 않은 변경사항이 있습니다. 페이지를 떠나면 변경사항을 잃게 됩니다.",
}: LeaveWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TriangleAlertIcon className="size-5 text-destructive" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            페이지 떠나기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
