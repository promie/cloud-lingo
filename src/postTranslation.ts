import { APIGatewayProxyResult } from 'aws-lambda'
import { TranslateTextCommand } from '@aws-sdk/client-translate'
import { AWSTranslateClient } from './lib/translate'

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const command = new TranslateTextCommand({
    SourceLanguageCode: 'en',
    TargetLanguageCode: 'th',
    Text: 'Hey, how are you going?',
  })

  const translation: any = await AWSTranslateClient.send(command as any)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: translation.TranslatedText,
    }),
  }
}
