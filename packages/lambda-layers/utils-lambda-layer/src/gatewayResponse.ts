import { APIGatewayProxyResult } from 'aws-lambda'
import { defaultHeaders } from './utils/headers'

interface ICreateGatewayResponse {
  statusCode: number
  body: string
}

const createGatewayResponse = ({
  statusCode,
  body,
}: ICreateGatewayResponse): APIGatewayProxyResult => {
  return {
    statusCode,
    body,
    headers: defaultHeaders,
  }
}

export const createSuccessResponse = (body: object) =>
  createGatewayResponse({
    statusCode: 200,
    body: JSON.stringify(body),
  })

export const createErrorJsonResponse = (body: object) =>
  createGatewayResponse({
    statusCode: 200,
    body: JSON.stringify(body),
  })
