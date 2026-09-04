import { LifeBuoy } from "lucide-react"
import { SupportAssistant } from "@/components/support-assistant"

export default function Page() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 sm:mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <LifeBuoy className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Support tooling
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
          Support Assistant
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">
          Paste an unstructured support request — an email, chat transcript, or ticket — and get an
          instant structured breakdown: category, summary, key details, a recommended next action,
          and a ready-to-send draft response.
        </p>
      </header>

      <SupportAssistant />
    </main>
  )
}
