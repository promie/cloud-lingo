import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { TranslateTextCommand } from '@aws-sdk/client-translate'
import { DocumentClient } from '../lib/dynamodb'
import { ITranslateDbObject } from '@cl/shared-types'
import { AWSTranslateClient } from '../lib/translate'

const { TABLE_NAME } = process.env

const translateText = async (
  sourceLang: string,
  targetLang: string,
  sourceText: string,
) => {
  const command = new TranslateTextCommand({
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang,
    Text: sourceText,
  })

  return AWSTranslateClient.send(command as any)
}

const saveTranslation = async (translation: ITranslateDbObject) => {
  await DocumentClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: translation,
    }),
  )
}

export { translateText, saveTranslation }
