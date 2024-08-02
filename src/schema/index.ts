import { z } from 'zod'

export const translationRequest = z.object({
  sourceLang: z.string(),
  targetLang: z.string(),
  text: z.string(),
})
