import { PutCommand } from '@aws-sdk/lib-dynamodb'
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

export { saveTranslation }
