import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  computed,
  HasMany,
  hasMany,
  HasOne,
  hasOne,
} from '@ioc:Adonis/Lucid/Orm'
import Database from '@ioc:Adonis/Lucid/Database'
import HistoricalMetric from './HistoricalMetric'
import Semantic from './Semantic'

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

  @column.dateTime({
    autoCreate: true,
    serialize: (value) => value.toFormat('yyyy-MM-dd HH:mm'),
  })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => HistoricalMetric, {
    foreignKey: 'project_id',
  })
  public historicalMetrics: HasOne<typeof HistoricalMetric>

  @hasMany(() => Semantic, {
    foreignKey: 'project_id',
  })
  public semantics: HasMany<typeof Semantic>

  @computed()
  public get domain() {
    if (this.semantics.length) return this.semantics[0].domain
    else return ''
  }

  public async getFrequency() {
    const frequency = await Database.query()
      .from('semantics')
      .select(
        'ngram',
        'label_id',
        Database.raw('max(label) as label'),
        'link',
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
      .groupBy('ngram')
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
