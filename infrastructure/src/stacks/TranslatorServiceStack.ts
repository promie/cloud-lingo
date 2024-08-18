import * as cdk from 'aws-cdk-lib'
import * as path from 'path'
import { Construct } from 'constructs'
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
import { RestApiService, TranslationService } from '../constructs'

export class TranslatorServiceStack extends cdk.Stack {
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

    new TranslationService(this, 'translationService', {
      lambdaDirPath,
      lambdaLayersDirPath,
      restApi,
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
  }
}
