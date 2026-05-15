import { Suspense } from "react"
import { CreateCompleteClient } from "@/components/create/create-complete-client"

interface Props {
  searchParams: Promise<{ play_code?: string; manage_code?: string; title?: string }>
}

async function CompleteContent({ searchParams }: Props) {
  const { play_code, manage_code, title } = await searchParams

  if (!play_code || !manage_code) {
    return (
      <p className="text-center text-muted-foreground">잘못된 접근입니다.</p>
    )
  }

  return (
    <CreateCompleteClient
      playCode={play_code}
      manageCode={manage_code}
      title={title ?? ""}
    />
  )
}

export default function CreateCompletePage({ searchParams }: Props) {
  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">로딩 중...</div>}>
        <CompleteContent searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
