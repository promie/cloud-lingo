import { useMutation } from '@tanstack/react-query'
import { ITranslateRequest } from '@cl/shared-types'
import { translateText } from '@/services/translationService'

export const useTranslateText = () => {
  const { mutate, ...rest } = useMutation({
    mutationFn: ({ sourceLang, targetLang, sourceText }: ITranslateRequest) =>
      translateText(sourceLang, targetLang, sourceText),
  })

  return { mutate, ...rest }
}
