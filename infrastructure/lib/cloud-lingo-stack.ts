import * as cdk from 'aws-cdk-lib'
import * as path from 'path'
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import { Runtime, LayerVersion, Code } from 'aws-cdk-lib/aws-lambda'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { translateAccessPolicy, translateTablePolicy } from './policies'

const PARTITION_KEY = 'requestId'
const TABLE_NAME = 'translationsTable'

export class CloudLingoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Project paths
    const projectRoot = '../'
    const lambdaDirPath = path.join(projectRoot, 'packages/lambdas')
    const lambdaLayersDirPath = path.join(projectRoot, 'packages/lambda-layers')

    // DynamoDB construct goes here
    new Table(this, TABLE_NAME, {
      tableName: TABLE_NAME,
      partitionKey: {
        name: PARTITION_KEY,
        type: AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Lambda layer construct
    const utilsLambdaLayerPath = path.resolve(
      path.join(lambdaLayersDirPath, 'utils-lambda-layer'),
    )

    const utilsLambdaLayer = new LayerVersion(this, 'utilsLambdaLayer', {
      code: Code.fromAsset(utilsLambdaLayerPath),
      compatibleRuntimes: [Runtime.NODEJS_20_X],
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
      'translate',
      utilsLambdaLayer,
      TABLE_NAME,
      PARTITION_KEY,
    )

    const getTranslationsFunction = this.createLambda(
      'getTranslationsLambda',
      translateLambdaPath,
      'getTranslations',
      utilsLambdaLayer,
      TABLE_NAME,
      PARTITION_KEY,
    )

    // Attach the policy to the dynamoDB table with the lambda function
    postTranslationFunction.role?.addToPrincipalPolicy(translateTablePolicy)
    postTranslationFunction.role?.addToPrincipalPolicy(translateAccessPolicy)

    getTranslationsFunction.role?.addToPrincipalPolicy(translateTablePolicy)

    // API Gateway Methods
    apiResource.addMethod(
      'POST',
      new LambdaIntegration(postTranslationFunction),
    )

    apiResource.addMethod('GET', new LambdaIntegration(getTranslationsFunction))
  }

  createLambda = (
    name: string,
    path: string,
    handler: string,
    layers: LayerVersion | undefined,
    tableName: string,
    partitionKey: string,
  ) => {
    return new NodejsFunction(this, name, {
      functionName: name,
      runtime: Runtime.NODEJS_20_X,
      entry: path,
      layers: layers ? [layers] : [],
      handler,
      environment: {
        TABLE_NAME: tableName,
        TRANSLATION_PARTITION_KEY: partitionKey,
      },
    })
  }
}
