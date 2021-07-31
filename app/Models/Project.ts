import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import Database from '@ioc:Adonis/Lucid/Database'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public ngram: number

  @column({ columnName: 'keyword_plan' })
  public keywordPlan: string

  @column({ columnName: 'plan_ad_group' })
  public planAdGroup: string

  @column()
  public metrics: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public async getFrequency() {
    const frequency = await Database.query()
      .from('semantics')
      .select(
        'label_id',
        Database.raw('max(label) as label'),
        'link',
        'ngram',
        Database.raw('count(id) as frequency')
      )
      .where('project_id', this.id)
      .groupBy('label_id', 'link', 'ngram')
      .having('frequency', '>', 1)
      .orderBy('label_id')
      .orderBy('frequency', 'desc')

    const globalFrequency = await Database.query()
      .from('semantics')
      .select('ngram', Database.raw('count(id) as c'))
      .where('project_id', this.id)
      .groupBy('label_id', 'ngram')
      .then((rows) =>
        rows.reduce((acc, v) => {
          acc[v.ngram] = v.c
          return acc
        }, {})
      )

    frequency.forEach((item) => {
      item['global_frequency'] = globalFrequency[item['ngram']]
    })

    return frequency
  }
}
