interface ITranslationTable {
  tableName: string
  partitionKey: string
}

export class TranslationTable {
  tableName: string
  partitionKey: string

  constructor({ tableName, partitionKey }: ITranslationTable) {
    this.tableName = tableName
    this.partitionKey = partitionKey
  }
}
