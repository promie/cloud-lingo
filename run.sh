# Bootstrapping the CDK pipeline
$ cdk bootstrap aws://ACCOUNT-NUMBER/REGION

# Create a new CDK project
$ cdk init app --language typescript

# ESLint and Prettier packages
npm i -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-config-standard-with-typescript eslint-plugin-import eslint-plugin-n eslint-plugin-promise prettier

# Husky and lint-staged packages
npm i -D husky lint-staged

export AWS_PROFILE=promie
