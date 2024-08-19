import { Construct } from 'constructs'
import { StackProps } from 'aws-cdk-lib'
import { IHostedZone, HostedZone } from 'aws-cdk-lib/aws-route53'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'

export interface ICertificateWrapperProps extends StackProps {
  domain: string
  cloudFrontUrl: string
  apiUrl: string
}

export class CertificateWrapper extends Construct {
  public zone: IHostedZone
  public certificate: Certificate

  constructor(
    scope: Construct,
    id: string,
    { domain, cloudFrontUrl, apiUrl }: ICertificateWrapperProps,
  ) {
    super(scope, id)

    // Fetch route53 hosted zone
    this.zone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: domain,
    })

    // Create a certificate for the domain
    this.certificate = new Certificate(this, 'cloudLingoCertificate', {
      domainName: domain,
      subjectAlternativeNames: [cloudFrontUrl, apiUrl],
      validation: CertificateValidation.fromDns(this.zone),
    })
  }
}
