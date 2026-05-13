const CLIENT_ID_KEY = 'tiercup_client_id'

export function getClientId(): string {
  if (typeof window === 'undefined') return ''

  const existing = localStorage.getItem(CLIENT_ID_KEY)
  if (existing) return existing

  const id = crypto.randomUUID()
  localStorage.setItem(CLIENT_ID_KEY, id)
  return id
}
