export class MissingEnvVarError extends Error {
  constructor(variableName: string) {
    super(`Missing environment variable: ${variableName}`)
  }
}

export class MissingBodyError extends Error {
  constructor() {
    super('Body data is empty')
  }
}
