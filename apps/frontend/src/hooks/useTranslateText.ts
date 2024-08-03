import { useMutation } from '@tanstack/react-query'
import { translateText } from '@/services/translationService'

interface ITranslateParams {
  sourceLang: string
  targetLang: string
  text: string
}

export const useTranslateText = () => {
  const { mutate, ...rest } = useMutation({
    mutationFn: ({ sourceLang, targetLang, text }: ITranslateParams) =>
      translateText(sourceLang, targetLang, text),
  })

  return { mutate, ...rest }
}