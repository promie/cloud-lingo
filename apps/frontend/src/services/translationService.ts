import axios from 'axios'

const translateText = async (sourceLang: string, targetLang: string, text: string) => {
  try {
    const response = await axios.post('https://iupvewrwqe.execute-api.ap-southeast-2.amazonaws.com/prod/translation', {
      sourceLang,
      targetLang,
      text
    })
    return response.data
  } catch (error) {
    console.error('Error translating text:', error)
    throw error
  }
}

export { translateText }