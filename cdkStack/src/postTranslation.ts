import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
  TranslateTextCommand,
  TranslateTextCommandOutput,
} from '@aws-sdk/client-translate'
import { AWSTranslateClient } from './lib/translate'
import { translationRequestSchema } from './schema'
import { defaultHeaders } from './utils/headers'

interface IPostTranslationRequest {
  sourceLang: string
  targetLang: string
  text: string
}

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Body is required',
        }),
        headers: defaultHeaders,
      }
    }

    const parsedBody = JSON.parse(event.body)
    const validationResult = translationRequestSchema.safeParse(parsedBody)

    if (!validationResult.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid request body',
          errors: validationResult.error.errors,
        }),
        headers: defaultHeaders,
      }
    }

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
        timestamp: new Date().toISOString(),
        text: translation.TranslatedText,
      }),
      headers: defaultHeaders,
    }
  } catch (error) {
    console.error('Error translating text:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
      }),
      headers: defaultHeaders,
    }
  }
}
