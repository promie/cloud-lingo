#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { TranslatorServiceStack } from './stacks'

const app = new cdk.App()
new TranslatorServiceStack(app, 'TranslatorService', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
})
