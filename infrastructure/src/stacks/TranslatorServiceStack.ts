import * as cdk from 'aws-cdk-lib'
import * as path from 'path'
import { Construct } from 'constructs'
import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeployment,
  CertificateWrapper,
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

    const certificateWrapper = new CertificateWrapper(
      this,
      'certificateWrapper',
      {
        domain,
        cloudFrontUrl,
        apiUrl,
      },
    )

    const restApi = new RestApiService(this, 'restApiService', {
      apiUrl,
      certificate: certificateWrapper.certificate,
      zone: certificateWrapper.zone,
    })

    new TranslationService(this, 'translationService', {
      lambdaDirPath,
      lambdaLayersDirPath,
      restApi,
    })

    new StaticWebsiteDeployment(this, 'staticWebsiteDeployment', {
      domain,
      cloudFrontUrl,
      certificate: certificateWrapper.certificate,
      zone: certificateWrapper.zone,
    })
  }
}
