import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class HistoricalMetrics extends BaseSchema {
  protected tableName = 'historical_metrics'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('project_id').unsigned()
      table.text('metrics')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
