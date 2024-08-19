import { Construct } from 'constructs'
import { StackProps } from 'aws-cdk-lib'
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import * as cdk from 'aws-cdk-lib'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import * as path from 'path'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { RestApiService } from './RestApiService'

const PARTITION_KEY = 'requestId'
const TABLE_NAME = 'translationsTable'

export interface ITranslationServiceProps extends StackProps {
  lambdaDirPath: string
  lambdaLayersDirPath: string
  restApi: RestApiService
}

export class TranslationService extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { lambdaDirPath, lambdaLayersDirPath, restApi }: ITranslationServiceProps,
  ) {
    super(scope, id)

    const utilsLambdaLayerPath = path.resolve(
      path.join(lambdaLayersDirPath, 'utils-lambda-layer'),
    )

    const translateLambdaPath = path.resolve(
      path.join(lambdaDirPath, 'translate/index.ts'),
    )

    // DynamoDB construct goes here
    new Table(this, TABLE_NAME, {
      tableName: TABLE_NAME,
      partitionKey: {
        name: PARTITION_KEY,
        type: AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const translateAccessPolicy = new PolicyStatement({
      actions: ['translate:TranslateText'],
      resources: ['*'],
    })

    const translateTablePolicy = new PolicyStatement({
      actions: [
        'dynamodb:PutItem',
        'dynamodb:Scan',
        'dynamodb:GetItem',
        'dynamodb:DeleteItem',
      ],
      resources: ['*'],
    })

    const utilsLambdaLayer = new LayerVersion(this, 'utilsLambdaLayer', {
      code: Code.fromAsset(utilsLambdaLayerPath),
      compatibleRuntimes: [Runtime.NODEJS_20_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

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

    restApi.addTranslateMethod({
      httpMethod: 'POST',
      lambda: postTranslationFunction,
    })

    restApi.addTranslateMethod({
      httpMethod: 'GET',
      lambda: getTranslationsFunction,
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
