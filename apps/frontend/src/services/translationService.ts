import axios from 'axios'
import { ITranslateResponse, ITranslateDbObject } from '@cl/shared-types'

const BASE_URL = 'https://irte3wveff.execute-api.us-east-1.amazonaws.com/prod'

const translateText = async (
  sourceLang: string,
  targetLang: string,
  sourceText: string,
): Promise<ITranslateResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/translation`, {
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
    const response = await axios.get(`${BASE_URL}/translation`)
    return response.data
  } catch (error) {
    console.error('Error getting translations:', error)
    throw error
  }
}

export { translateText, getTranslations }
