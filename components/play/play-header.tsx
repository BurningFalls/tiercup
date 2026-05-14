import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlayProgress } from '@/components/play/play-progress'

interface PlayHeaderProps {
  title: string
  currentCount: number
  estimatedTotal: number
  onLeave: () => void
}

export function PlayHeader({ title, currentCount, estimatedTotal, onLeave }: PlayHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <h1 className="shrink-0 text-lg font-bold">{title}</h1>
      <PlayProgress
        current={currentCount}
        total={estimatedTotal}
        className="min-w-0 flex-1"
      />
      <Button variant="ghost" size="icon" onClick={onLeave} aria-label="플레이 나가기">
        <XIcon />
      </Button>
    </div>
  )
}
