import { z } from 'zod'

export const translationRequestSchema = z.object({
  sourceLang: z.string(),
  targetLang: z.string(),
  text: z.string(),
})
