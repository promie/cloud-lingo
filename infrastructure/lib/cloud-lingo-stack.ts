import * as cdk from 'aws-cdk-lib'
import * as path from 'path'
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { translateAccessPolicy } from './policies'

const PARTITION_KEY = 'requestId'
const TABLE_NAME = 'translationsTable'

export class CloudLingoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const projectRoot = '../'
    const lambdaDirPath = path.join(projectRoot, 'packages/lambdas')

    // DynamoDB construct goes here
    const table = new Table(this, TABLE_NAME, {
      tableName: TABLE_NAME,
      partitionKey: {
        name: PARTITION_KEY,
        type: AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // API Gateway
    const api = new RestApi(this, 'cloudLingoApi', {
      restApiName: 'Cloud Lingo Service',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
    })

    const apiResource = api.root.addResource('translation')

    const translateLambdaPath = path.resolve(
      path.join(lambdaDirPath, 'translate/index.ts'),
    )
    // Lambda Functions
    const postTranslationFunction = this.createLambda(
      'translateLambda',
      translateLambdaPath,
      TABLE_NAME,
      PARTITION_KEY,
    )

    // Grant the lambda function read/write permissions to the DynamoDB table
    table.grantReadWriteData(postTranslationFunction)

    apiResource.addMethod(
      'POST',
      new LambdaIntegration(postTranslationFunction),
    )
    // Attach the policy to the lambda function
    postTranslationFunction.role?.addToPrincipalPolicy(translateAccessPolicy)
  }

  createLambda = (
    name: string,
    path: string,
    tableName: string,
    partitionKey: string,
  ) => {
    return new NodejsFunction(this, name, {
      functionName: name,
      runtime: Runtime.NODEJS_20_X,
      entry: path,
      environment: {
        TABLE_NAME: tableName,
        TRANSLATION_PARTITION_KEY: partitionKey,
      },
    })
  }
}
