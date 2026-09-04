import { generateObject } from "ai"
import { analysisSchema } from "@/lib/analyze"

// Run on the server so the AI Gateway credentials are never exposed to the client.
export const runtime = "nodejs"
export const maxDuration = 30

const MAX_INPUT_LENGTH = 8000

export async function POST(req: Request) {
  let input: unknown
  try {
    const body = await req.json()
    input = body?.input
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (typeof input !== "string" || !input.trim()) {
    return Response.json(
      { error: "Please provide a support request to analyze." },
      { status: 400 },
    )
  }

  const text = input.slice(0, MAX_INPUT_LENGTH)

  try {
    const { object } = await generateObject({
      model: "openai/gpt-4.1-mini",
      schema: analysisSchema,
      system:
        "You are a senior customer-support analyst. Analyze the unstructured support request and return a structured breakdown. " +
        "Be accurate and concise. Never invent facts, account details, or promises that are not supported by the request. " +
        "The draft response must be polite, professional, and safe to send with minimal edits.",
      prompt: `Analyze the following customer support request:\n\n"""\n${text}\n"""`,
    })

    return Response.json({ analysis: object })
  } catch (err) {
    console.log("[v0] analyze route error:", err)
    return Response.json(
      { error: "The analysis service is temporarily unavailable. Please try again." },
      { status: 502 },
    )
  }
}
