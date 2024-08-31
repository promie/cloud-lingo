import * as cdk from 'aws-cdk-lib'
import * as path from 'path'
import { Construct } from 'constructs'
import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeployment,
  CertificateWrapper,
} from '../constructs'
import { getConfig } from '../helpers'

const config = getConfig()

export class TranslatorServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Project paths
    const projectRoot = '../'
    const lambdaDirPath = path.join(projectRoot, 'packages/lambdas')
    const lambdaLayersDirPath = path.join(projectRoot, 'packages/lambda-layers')

    // Domain name
    const domain = config.domain
    const cloudFrontUrl = `${config.webSubdomain}.${domain}`
    const apiUrl = `${config.apiSubdomain}.${domain}`

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
