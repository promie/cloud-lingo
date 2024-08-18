import { Construct } from 'constructs'
import { StackProps } from 'aws-cdk-lib'
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { ARecord, RecordTarget, IHostedZone } from 'aws-cdk-lib/aws-route53'
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { IFunction } from 'aws-cdk-lib/aws-lambda'

export interface IRestApiServiceProps extends StackProps {
  apiUrl: string
  certificate: Certificate
  zone: IHostedZone
}

export class RestApiService extends Construct {
  public restApi: RestApi

  constructor(
    scope: Construct,
    id: string,
    { apiUrl, certificate, zone }: IRestApiServiceProps,
  ) {
    super(scope, id)

    // API Gateway
    this.restApi = new RestApi(this, 'cloudLingoApi', {
      restApiName: 'Cloud Lingo Service',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
      domainName: {
        domainName: apiUrl,
        certificate,
      },
    })

    new ARecord(this, 'apiDns', {
      zone,
      recordName: 'cloud-lingo-api',
      target: RecordTarget.fromAlias(new ApiGateway(this.restApi)),
    })
  }

  addTranslateMethod({
    httpMethod,
    lambda,
  }: {
    httpMethod: string
    lambda: IFunction
  }) {
    this.restApi.root.addMethod(httpMethod, new LambdaIntegration(lambda))
  }
}
