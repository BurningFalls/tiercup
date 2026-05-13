export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}초`
  return `${m}분 ${s}초`
}

export function calcDurationSeconds(startedAt: string, completedAt: string | null): number {
  if (!completedAt) return 0
  return Math.floor((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000)
}
