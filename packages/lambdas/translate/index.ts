import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'
import {
  ITranslateRequest,
  ITranslateResponse,
  ITranslateDbObject,
} from '@cl/shared-types'
import { translationRequestSchema } from './schema'
import { defaultHeaders } from './utils/headers'
import {
  saveTranslation,
  getAllTranslations,
} from './services/translateService'
import {
  gateway,
  exception,
  translateText,
} from '/opt/nodejs/utils-lambda-layer'

const { TABLE_NAME } = process.env

if (!TABLE_NAME) {
  throw new exception.MissingEnvVarError('TABLE_NAME')
}

export const translate = async (
  event: APIGatewayProxyEvent,
  context?: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      throw new exception.MissingBodyError()
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

    const translation: any = await translateText({
      sourceLang,
      targetLang,
      sourceText,
    })

    const dbObject: ITranslateDbObject = {
      requestId: context?.awsRequestId,
      ...parsedBody,
      timestamp: new Date().toISOString(),
      text: translation.TranslatedText,
    }

    await saveTranslation(dbObject)

    return gateway.createSuccessResponse({
      timestamp: new Date().toISOString(),
      text: translation.TranslatedText,
    } as ITranslateResponse)
  } catch (error) {
    console.error('Error translating text:', error)
    return gateway.createErrorJsonResponse({
      message: 'Internal Server Error',
    })
  }
}

export const getTranslations = async (): Promise<APIGatewayProxyResult> => {
  const translations = await getAllTranslations()

  return gateway.createSuccessResponse(translations)
}
