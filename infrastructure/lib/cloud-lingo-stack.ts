import * as cdk from 'aws-cdk-lib'
import * as path from 'path'
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
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

    // S3 Bucket where the website site will reside
    const bucket = new Bucket(this, 'cloudLingoBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html',
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // S3 construct to deploy the website dist content
    new BucketDeployment(this, 'cloudLingoBucketDeployment', {
      destinationBucket: bucket,
      sources: [Source.asset('../apps/frontend/dist')],
    })
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
