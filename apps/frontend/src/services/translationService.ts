import axios from 'axios'
import { ITranslateResponse, ITranslateDbObject } from '@cl/shared-types'

const BASE_URL = 'https://cloud-lingo-api.pyutasane.com'

const translateText = async (
  sourceLang: string,
  targetLang: string,
  sourceText: string,
): Promise<ITranslateResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}`, {
      sourceLang,
      targetLang,
      sourceText,
    })
    return response.data
  } catch (error) {
    console.error('Error translating text:', error)
    throw error
  }
}

const getTranslations = async (): Promise<ITranslateDbObject[]> => {
  try {
    const response = await axios.get(`${BASE_URL}`)
    return response.data
  } catch (error) {
    console.error('Error getting translations:', error)
    throw error
  }
}

export { translateText, getTranslations }
