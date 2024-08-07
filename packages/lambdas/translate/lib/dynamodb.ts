import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const dynamoDBConfig = {
  region: process.env.AWS_REGION || 'ap-southeast-2',
} as any

export const Dynamodb = new DynamoDBClient(dynamoDBConfig)
export const DocumentClient = DynamoDBDocumentClient.from(Dynamodb)
