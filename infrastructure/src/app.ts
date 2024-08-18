#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { TranslatorService } from './stacks/TranslatorService'

const app = new cdk.App()
new TranslatorService(app, 'TranslatorService', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
})
