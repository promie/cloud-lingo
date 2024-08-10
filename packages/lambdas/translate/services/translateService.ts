import {
  PutCommand,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { DocumentClient } from '../lib/dynamodb'
import { ITranslateDbObject } from '@cl/shared-types'

const { TABLE_NAME } = process.env

const saveTranslation = async (translation: ITranslateDbObject) => {
  await DocumentClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: translation,
    }),
  )
}

const getAllTranslations = async (): Promise<ITranslateDbObject[]> => {
  const { Items } = await DocumentClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    } as ScanCommandInput),
  )

  return Items as ITranslateDbObject[]
}

export { saveTranslation, getAllTranslations }
