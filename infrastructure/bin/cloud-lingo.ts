#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CloudLingoStack } from '../lib/cloud-lingo-stack'

const app = new cdk.App()
new CloudLingoStack(app, 'CloudLingoStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
})
