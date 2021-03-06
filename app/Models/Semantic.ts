import { DateTime } from 'luxon'
import { BaseModel, column, computed } from '@ioc:Adonis/Lucid/Orm'

export default class Semantic extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public project_id: number

  @column()
  public ngram: string

  @column()
  public line: string

  @column()
  public label_id: number

  @column()
  public label: string

  @column()
  public link: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get domain() {
    if (this.link) {
      const re = /^((?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+)[\w\-\._~:\/?#[\]@!\$&'\(\)\*\+,;=.]+$/
      const matches = this.link.match(re)
      return matches ? matches[1] : ''
    }
    return ''
  }
}
