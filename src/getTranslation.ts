import { APIGatewayProxyResult } from 'aws-lambda'
import {
  TranslateClient,
  TranslateTextCommand,
} from '@aws-sdk/client-translate'

const translateClient = new TranslateClient({
  region: 'ap-southeast-2',
} as any)

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const command = new TranslateTextCommand({
    SourceLanguageCode: 'en',
    TargetLanguageCode: 'th',
    Text: 'Hey, how are you going?',
  })

  const translation: any = await translateClient.send(command as any)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: translation.TranslatedText,
    }),
  }
}
