import { PolicyStatement } from 'aws-cdk-lib/aws-iam'

export const translateAccessPolicy = new PolicyStatement({
  actions: ['translate:TranslateText'],
  resources: ['*'],
})
