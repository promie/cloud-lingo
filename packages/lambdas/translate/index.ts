import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'
import { TranslateTextCommandOutput } from '@aws-sdk/client-translate'
import {
  ITranslateRequest,
  ITranslateResponse,
  ITranslateDbObject,
} from '@cl/shared-types'
import { translationRequestSchema } from './schema'
import { defaultHeaders } from './utils/headers'
import {
  translateText,
  saveTranslation,
  getAllTranslations,
} from './services/translateService'

export const translate = async (
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

    const translation: Partial<TranslateTextCommandOutput> =
      await translateText(sourceLang, targetLang, sourceText)

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

export const getTranslations = async (): Promise<APIGatewayProxyResult> => {
  const translations = await getAllTranslations()

  return {
    statusCode: 200,
    body: JSON.stringify(translations),
    headers: defaultHeaders,
  }
}
