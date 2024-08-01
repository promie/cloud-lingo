import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
  TranslateTextCommand,
  TranslateTextCommandOutput,
} from '@aws-sdk/client-translate'
import { AWSTranslateClient } from './lib/translate'

interface IPostTranslationRequest {
  sourceLang: string
  targetLang: string
  text: string
}

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { sourceLang, targetLang, text } = JSON.parse(
      event.body!,
    ) as IPostTranslationRequest

    const command = new TranslateTextCommand({
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
      Text: text,
    })

    const translation: TranslateTextCommandOutput =
      await AWSTranslateClient.send(command as any)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: translation.TranslatedText,
      }),
    }
  } catch (error) {
    console.error('Error translating text:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
      }),
    }
  }
}
