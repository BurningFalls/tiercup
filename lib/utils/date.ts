export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}초`
  return `${m}분 ${s}초`
}

export function calcDurationSeconds(startedAt: string, completedAt: string | null): number {
  if (!completedAt) return 0
  const start = new Date(startedAt).getTime()
  const end = new Date(completedAt).getTime()
  if (isNaN(start) || isNaN(end)) return 0
  return Math.floor((end - start) / 1000)
}
