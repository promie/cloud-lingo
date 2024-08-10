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
  gateway,
  exception,
  translateText,
  TranslationTable,
} from '/opt/nodejs/utils-lambda-layer'

const { TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env

if (!TABLE_NAME) {
  throw new exception.MissingEnvVarError('TABLE_NAME')
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvVarError('TRANSLATION_PARTITION_KEY')
}

const translationTable = new TranslationTable({
  tableName: TABLE_NAME,
  partitionKey: TRANSLATION_PARTITION_KEY,
})

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

    await translationTable.saveTranslation(dbObject)

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
  const translations = await translationTable.getAllTranslations()

  return gateway.createSuccessResponse(translations)
}
