import { PolicyStatement } from 'aws-cdk-lib/aws-iam'

export const translateAccessPolicy = new PolicyStatement({
  actions: ['translate:TranslateText'],
  resources: ['*'],
})

export const translateTablePolicy = new PolicyStatement({
  actions: [
    'dynamodb:PutItem',
    'dynamodb:Scan',
    'dynamodb:GetItem',
    'dynamodb:DeleteItem',
  ],
  resources: ['*'],
})
