import {
  TranslateClient,
  TranslateTextCommand,
} from '@aws-sdk/client-translate'
import { ITranslateRequest } from '@cl/shared-types'

const translateText = async ({
  sourceLang,
  targetLang,
  sourceText,
}: ITranslateRequest) => {
  const translateClient = new TranslateClient({
    region: 'ap-southeast-2',
  } as any)

  const command = new TranslateTextCommand({
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang,
    Text: sourceText,
  })

  return translateClient.send(command as any)
}

export { translateText }
