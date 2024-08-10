import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import {
  PutCommand,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { ITranslateDbObject } from '@cl/shared-types'

interface ITranslationTable {
  tableName: string
  partitionKey: string
}

const dynamoDBConfig = {
  region: process.env.AWS_REGION || 'ap-southeast-2',
} as any

export class TranslationTable {
  tableName: string
  partitionKey: string
  dynamoDBClient: DynamoDBClient
  documentClient: DynamoDBDocumentClient

  constructor({ tableName, partitionKey }: ITranslationTable) {
    this.tableName = tableName
    this.partitionKey = partitionKey
    this.dynamoDBClient = new DynamoDBClient(dynamoDBConfig)
    this.documentClient = DynamoDBDocumentClient.from(this.dynamoDBClient)
  }

  async saveTranslation(translation: ITranslateDbObject) {
    await this.documentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: translation,
      }),
    )
  }

  async getAllTranslations(): Promise<ITranslateDbObject[]> {
    const { Items } = await this.documentClient.send(
      new ScanCommand({
        TableName: this.tableName,
      } as ScanCommandInput),
    )

    return Items as ITranslateDbObject[]
  }
}
