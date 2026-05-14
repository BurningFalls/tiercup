import { Suspense } from "react"
import CreateForm from "@/components/create/create-form"

export default function CreatePage() {
  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8">
      <Suspense>
        <CreateForm />
      </Suspense>
    </main>
  )
}
