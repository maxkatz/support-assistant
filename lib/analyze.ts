export type Analysis = {
  category: string
  priority: "Low" | "Medium" | "High" | "Urgent"
  summary: string
  keyDetails: string[]
  nextAction: string
  draftResponse: string
}

// Mock analysis. This inspects the text for a few keywords to feel realistic,
// but returns hardcoded/derived mock data. No AI API is called.
export function analyzeRequest(input: string): Analysis {
  const text = input.trim()
  const lower = text.toLowerCase()

  const has = (...words: string[]) => words.some((w) => lower.includes(w))

  let category = "General Inquiry"
  let priority: Analysis["priority"] = "Medium"
  let nextAction =
    "Reply to the customer with the draft response and confirm the issue is resolved."

  if (has("refund", "charge", "billing", "invoice", "payment", "subscription")) {
    category = "Billing & Payments"
    priority = "High"
    nextAction =
      "Verify the customer's account and recent transactions, then escalate to the billing team if a refund is required."
  } else if (has("bug", "error", "crash", "broken", "not working", "fails", "500")) {
    category = "Technical Issue"
    priority = "High"
    nextAction =
      "Reproduce the issue, gather logs or a screen recording, and create a ticket for the engineering team."
  } else if (has("login", "password", "account", "locked", "access", "2fa")) {
    category = "Account & Access"
    priority = "Urgent"
    nextAction =
      "Verify the customer's identity, then guide them through a secure password reset or unlock the account."
  } else if (has("cancel", "downgrade", "unsubscribe")) {
    category = "Cancellation & Retention"
    priority = "Medium"
    nextAction =
      "Acknowledge the request, offer relevant retention options, and process the change if the customer confirms."
  } else if (has("feature", "request", "suggestion", "would be nice", "roadmap")) {
    category = "Feature Request"
    priority = "Low"
    nextAction =
      "Log the request in the product feedback tracker and thank the customer for the suggestion."
  } else if (has("how do i", "how to", "help", "question", "guide")) {
    category = "How-to / Guidance"
    priority = "Low"
    nextAction =
      "Send the relevant help-center article and offer a short walkthrough if needed."
  }

  const sentences = text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const firstSentence = sentences[0] ?? "No details provided."
  const summary =
    firstSentence.length > 160
      ? firstSentence.slice(0, 157) + "..."
      : firstSentence

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0

  const keyDetails: string[] = [
    `Detected category: ${category}`,
    `Estimated priority: ${priority}`,
    has("urgent", "asap", "immediately", "emergency")
      ? "Customer signaled urgency in their message."
      : "No explicit urgency signals detected.",
    has("@")
      ? "Contact email appears to be included in the message."
      : "No contact email detected in the message.",
    `Message length: ${wordCount} words.`,
  ]

  const draftResponse = buildDraft(category)

  return { category, priority, summary, keyDetails, nextAction, draftResponse }
}

function buildDraft(category: string): string {
  const intro = "Hi there,\n\nThanks for reaching out to our support team."

  const bodies: Record<string, string> = {
    "Billing & Payments":
      "I'm sorry for the trouble with your billing. I've reviewed your request and I'm looking into the charge you mentioned. I'll confirm the details on your account and get this corrected as quickly as possible.",
    "Technical Issue":
      "I'm sorry you ran into this issue. To help me resolve it quickly, could you share any error messages, the steps that led to the problem, and a screenshot if possible? I'll get our team on it right away.",
    "Account & Access":
      "I understand how frustrating access issues can be. For your security, I'll need to verify a few account details, and then I can help you regain access or reset your credentials right away.",
    "Cancellation & Retention":
      "Thanks for letting us know. I can help you with that change. Before I process it, I want to make sure you have everything you need — please let me know if there's anything we could improve.",
    "Feature Request":
      "This is a great suggestion, and I appreciate you taking the time to share it. I've passed it along to our product team so it can be considered for the roadmap.",
    "How-to / Guidance":
      "Happy to help you with this. I've included a quick summary of the steps below, and I'm glad to walk you through it in more detail if that would be useful.",
    "General Inquiry":
      "I've reviewed your message and I'm happy to help. I'll look into this and follow up with the next steps shortly.",
  }

  const body = bodies[category] ?? bodies["General Inquiry"]
  const outro =
    "\n\nPlease let me know if there's anything else I can do.\n\nBest regards,\nSupport Team"

  return `${intro}\n\n${body}${outro}`
}
