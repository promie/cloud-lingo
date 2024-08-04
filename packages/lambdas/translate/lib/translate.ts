import { TranslateClient } from '@aws-sdk/client-translate'

export const AWSTranslateClient = new TranslateClient({
  region: 'ap-southeast-2',
} as any)
