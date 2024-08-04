import axios from 'axios'
import { ITranslateResponse } from '@cl/shared-types'

const translateText = async (
  sourceLang: string,
  targetLang: string,
  sourceText: string,
): Promise<ITranslateResponse> => {
  try {
    const response = await axios.post(
      'https://iupvewrwqe.execute-api.ap-southeast-2.amazonaws.com/prod/translation',
      {
        sourceLang,
        targetLang,
        sourceText,
      },
    )
    return response.data
  } catch (error) {
    console.error('Error translating text:', error)
    throw error
  }
}

export { translateText }
