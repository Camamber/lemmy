import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Semantics extends BaseSchema {
  protected tableName = 'semantics'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('project_id').unsigned()
      table.string('ngram')
      table.string('line')
      table.integer('label_id').unsigned()
      table.string('label')
      table.string('link')
      table.text('google_json')

      table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE')

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
