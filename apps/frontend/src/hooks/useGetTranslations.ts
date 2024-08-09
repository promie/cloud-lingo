import { useQuery } from '@tanstack/react-query'
import { getTranslations } from '@/services/translationService'

export const useGetTranslations = () => {
  return useQuery({
    queryKey: ['translations'],
    queryFn: getTranslations,
  })
}
