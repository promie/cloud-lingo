import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'
import {
  TranslateTextCommand,
  TranslateTextCommandOutput,
} from '@aws-sdk/client-translate'
import {
  ITranslateRequest,
  ITranslateResponse,
  ITranslateDbObject,
} from '@cl/shared-types'
import { AWSTranslateClient } from './lib/translate'
import { translationRequestSchema } from './schema'
import { defaultHeaders } from './utils/headers'
import { saveTranslation } from './services/translateService'

export const handler = async (
  event: APIGatewayProxyEvent,
  context?: Context,
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

    const { sourceLang, targetLang, sourceText } = JSON.parse(
      event.body!,
    ) as ITranslateRequest

    const command = new TranslateTextCommand({
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
      Text: sourceText,
    })

    const translation: TranslateTextCommandOutput =
      await AWSTranslateClient.send(command as any)

    const dbObject: ITranslateDbObject = {
      requestId: context?.awsRequestId,
      ...parsedBody,
      timestamp: new Date().toISOString(),
      text: translation.TranslatedText,
    }

    await saveTranslation(dbObject)

    return {
      statusCode: 200,
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        text: translation.TranslatedText,
      } as ITranslateResponse),
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
