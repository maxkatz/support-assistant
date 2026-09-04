import { z } from "zod"

// Shared schema for the structured support analysis. Used both to constrain the
// AI model's output on the server and to type the result on the client.
export const analysisSchema = z.object({
  category: z
    .string()
    .describe(
      "A concise support category, e.g. 'Billing & Payments', 'Technical Issue', 'Account & Access', 'Cancellation & Retention', 'Feature Request', 'How-to / Guidance', or 'General Inquiry'.",
    ),
  priority: z
    .enum(["Low", "Medium", "High", "Urgent"])
    .describe("The urgency of the request based on impact and customer signals."),
  summary: z
    .string()
    .describe("A one to two sentence neutral summary of what the customer is asking for."),
  keyDetails: z
    .array(z.string())
    .describe(
      "3-6 short bullet points capturing the most important facts: what happened, affected account/product, dates, amounts, contact info, and any urgency signals.",
    ),
  nextAction: z
    .string()
    .describe("The single most useful next action the support agent should take."),
  draftResponse: z
    .string()
    .describe(
      "A polite, professional draft reply to the customer, ready to send. Use plain text with line breaks; do not invent facts that are not in the request.",
    ),
})

export type Analysis = z.infer<typeof analysisSchema>
