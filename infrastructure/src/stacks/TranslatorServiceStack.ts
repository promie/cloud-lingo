import * as cdk from 'aws-cdk-lib'
import * as path from 'path'
import { Construct } from 'constructs'
import { HostedZone } from 'aws-cdk-lib/aws-route53'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeployment,
} from '../constructs'

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

    new StaticWebsiteDeployment(this, 'staticWebsiteDeployment', {
      domain,
      cloudFrontUrl,
      certificate,
      zone,
    })
  }
}
