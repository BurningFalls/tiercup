import { CreateCompleteClient } from "@/components/create/create-complete-client"
import { mockCreatedTierCup } from "@/lib/mock/tier-cups"

export default function CreateCompletePage() {
  const { play_code, manage_code, title } = mockCreatedTierCup

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8">
      <CreateCompleteClient playCode={play_code} manageCode={manage_code} title={title} />
    </main>
  )
}
