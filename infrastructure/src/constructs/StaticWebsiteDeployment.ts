import { Construct } from 'constructs'
import { StackProps } from 'aws-cdk-lib'
import { ARecord, RecordTarget, IHostedZone } from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import * as cdk from 'aws-cdk-lib'
import {
  CloudFrontWebDistribution,
  ViewerCertificate,
} from 'aws-cdk-lib/aws-cloudfront'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'

export interface IStaticWebsiteDeploymentProps extends StackProps {
  domain: string
  cloudFrontUrl: string
  certificate: Certificate
  zone: IHostedZone
}

export class StaticWebsiteDeployment extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { domain, cloudFrontUrl, certificate, zone }: IStaticWebsiteDeploymentProps,
  ) {
    super(scope, id)

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
