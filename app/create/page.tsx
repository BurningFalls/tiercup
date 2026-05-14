import { Suspense } from "react"
import CreateForm from "@/components/create/create-form"

export default function CreatePage() {
  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">로딩 중...</div>}>
        <CreateForm />
      </Suspense>
    </main>
  )
}
