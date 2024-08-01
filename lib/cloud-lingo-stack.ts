import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'

export class CloudLingoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
  }

  createLambda = (name: string, path: string) => {
    return new NodejsFunction(this, name, {
      functionName: name,
      runtime: Runtime.NODEJS_20_X,
      entry: path,
    })
  }
}
