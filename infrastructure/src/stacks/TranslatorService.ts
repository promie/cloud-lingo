import * as cdk from 'aws-cdk-lib'
import * as path from 'path'
import { Construct } from 'constructs'
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import {
  CloudFrontWebDistribution,
  ViewerCertificate,
} from 'aws-cdk-lib/aws-cloudfront'
import { HostedZone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { translateAccessPolicy, translateTablePolicy } from './policies'
import { RestApiService } from '../constructs'

const PARTITION_KEY = 'requestId'
const TABLE_NAME = 'translationsTable'

export class TranslatorService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Project paths
    const projectRoot = '../'
    const lambdaDirPath = path.join(projectRoot, 'packages/lambdas')
    const lambdaLayersDirPath = path.join(projectRoot, 'packages/lambda-layers')

    // Domain name
    const domain = 'pyutasane.com'
    const cloudFrontUrl = `cloud-lingo.${domain}`
    const apiUrl = `cloud-lingo-api.${domain}`

    // Fetch route53 hosted zone
    const zone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: domain,
    })

    // Create a certificate for the domain
    const certificate = new Certificate(this, 'cloudLingoCertificate', {
      domainName: domain,
      subjectAlternativeNames: [cloudFrontUrl, apiUrl],
      validation: CertificateValidation.fromDns(zone),
    })

    const restApi = new RestApiService(this, 'restApiService', {
      apiUrl,
      certificate,
      zone,
    })

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

    restApi.addTranslateMethod({
      httpMethod: 'POST',
      lambda: postTranslationFunction,
    })

    restApi.addTranslateMethod({
      httpMethod: 'GET',
      lambda: getTranslationsFunction,
    })

    // Viewer certificate
    const viewerCertificate = ViewerCertificate.fromAcmCertificate(
      certificate,
      {
        aliases: [cloudFrontUrl],
      },
    )

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

    // Cloudfront distribution
    const distro = new CloudFrontWebDistribution(
      this,
      'cloudLingoDistribution',
      {
        viewerCertificate,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      },
    )

    // S3 construct to deploy the website dist content
    new BucketDeployment(this, 'cloudLingoBucketDeployment', {
      destinationBucket: bucket,
      sources: [Source.asset('../apps/frontend/dist')],
      distribution: distro,
      distributionPaths: ['/*'],
    })

    new ARecord(this, 'route53Domain', {
      zone,
      recordName: domain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distro)),
    })

    new ARecord(this, 'route53FullUrl', {
      zone,
      recordName: 'cloud-lingo',
      target: RecordTarget.fromAlias(new CloudFrontTarget(distro)),
    })

    // new ARecord(this, 'apiDns', {
    //   zone,
    //   recordName: 'cloud-lingo-api',
    //   target: RecordTarget.fromAlias(new ApiGateway(api)),
    // })

    new cdk.CfnOutput(this, 'cloudLingoWebUrl', {
      exportName: 'cloudLingoWebUrl',
      value: `https://${distro.distributionDomainName}`,
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
