"use client"

import { useState } from "react"
import {
  Sparkles,
  Tag,
  FileText,
  ListChecks,
  ArrowRight,
  MessageSquareText,
  Copy,
  Check,
  Loader2,
  TriangleAlert,
} from "lucide-react"
import { type Analysis } from "@/lib/analyze"

const SAMPLE = `Hi, I was charged twice for my Pro subscription this month and I need a refund ASAP. My account email is jordan@example.com. This is really frustrating because it's the second time this has happened.`

export function SupportAssistant() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleAnalyze = async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.analysis) {
        throw new Error(data?.error ?? "Something went wrong while analyzing the request.")
      }

      setResult(data.analysis as Analysis)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing the request.",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.draftResponse)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard may be unavailable (permissions / insecure context); ignore.
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      {/* Input panel */}
      <section
        aria-labelledby="request-heading"
        className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="request-heading" className="text-sm font-semibold text-card-foreground">
            Support request
          </h2>
          <button
            type="button"
            onClick={() => setInput(SAMPLE)}
            className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Load sample
          </button>
        </div>

        <label htmlFor="request" className="sr-only">
          Paste the support request
        </label>
        <textarea
          id="request"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste the customer's message here — email, chat transcript, or ticket text..."
          rows={12}
          className="w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {input.trim() ? `${input.trim().split(/\s+/).length} words` : "No text yet"}
          </span>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!input.trim() || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Analyzing..." : "Analyze request"}
          </button>
        </div>
      </section>

      {/* Output panel */}
      <section aria-labelledby="analysis-heading" aria-live="polite" className="min-h-full">
        <h2 id="analysis-heading" className="sr-only">
          Analysis results
        </h2>

        {error && !loading && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <TriangleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-700">Analysis failed</p>
              <p className="mt-0.5 text-sm text-red-900/80">{error}</p>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
              <MessageSquareText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-card-foreground">No analysis yet</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Paste a support request and click{" "}
              <span className="font-medium text-foreground">Analyze request</span> to see a
              structured breakdown.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
            <p className="mt-3 text-sm text-muted-foreground">Analyzing the request...</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <ResultCard icon={Tag} title="Category">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {result.category}
                </span>
                <PriorityBadge priority={result.priority} />
              </div>
            </ResultCard>

            <ResultCard icon={FileText} title="Summary">
              <p className="text-sm leading-relaxed text-card-foreground">{result.summary}</p>
            </ResultCard>

            <ResultCard icon={ListChecks} title="Key details">
              <ul className="space-y-2">
                {result.keyDetails.map((detail, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-card-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </ResultCard>

            <ResultCard icon={ArrowRight} title="Recommended next action">
              <p className="text-sm leading-relaxed text-card-foreground">{result.nextAction}</p>
            </ResultCard>

            <ResultCard
              icon={MessageSquareText}
              title="Draft response"
              action={
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              }
            >
              <pre className="whitespace-pre-wrap rounded-lg bg-secondary/60 p-4 font-sans text-sm leading-relaxed text-card-foreground">
                {result.draftResponse}
              </pre>
            </ResultCard>
          </div>
        )}
      </section>
    </div>
  )
}

function ResultCard({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" aria-hidden={true} />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function PriorityBadge({ priority }: { priority: Analysis["priority"] }) {
  const styles: Record<Analysis["priority"], string> = {
    Low: "bg-secondary text-secondary-foreground",
    Medium: "bg-secondary text-secondary-foreground",
    High: "bg-amber-100 text-amber-800",
    Urgent: "bg-red-100 text-red-700",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[priority]}`}>
      {priority} priority
    </span>
  )
}
