import StringHelper from 'App/Helpers/StringHelper'
import * as CSV from 'csv-string'
import xlsx from 'node-xlsx'
import _ from 'lodash'

const HEADER = [
  'Ngram',
  'Label',
  'Link',
  'Frequency',
  'Global frequency',
  'Avg Searches Last Year',
  'Avg Searches Last 6 Month',
  'Avg Searches Last 3 Month',
  'Last Month Searches',
]
export default class OutputService {
  public toCSV(frequency, metrics) {
    const data = this.rows(frequency, metrics)
    return CSV.stringify(data, ';')
  }

  public toExcel(frequency, metrics) {
    const data = this.rows(frequency, metrics)
    return xlsx.build([{ name: 'sheet 1', data: data }], {
      '!autofilter': [{ s: { c: 0, r: 0 }, e: { c: 0, r: 8 } }],
    })
  }

  protected rows(frequency, metrics): any[] {
    const rows = [...frequency].map((item) => {
      item['avg_monthly_searches_12'] = 'n/a'
      item['avg_monthly_searches_6'] = 'n/a'
      item['avg_monthly_searches_3'] = 'n/a'
      item['last_month_searches'] = 'n/a'
      const metric = metrics[item.ngram]
      if (metric && metric.keyword_metrics) {
        const monthlySearchVolumes = _.chain(metric.keyword_metrics.monthly_search_volumes)
          .map('monthly_searches')
          .map(Number)

        const [prev, curr] = monthlySearchVolumes.takeRight(2).value()
        const growth = StringHelper.calculateGrowth(curr, prev)

        item['last_month_searches'] = monthlySearchVolumes.last().floor().value() + growth
        item['avg_monthly_searches_3'] = monthlySearchVolumes.takeRight(3).mean().floor().value()
        item['avg_monthly_searches_6'] = monthlySearchVolumes.takeRight(6).mean().floor().value()
        item['avg_monthly_searches_12'] = metric.keyword_metrics.avg_monthly_searches
      }
      delete item.label_id
      return Object.values(item)
    })

    return [HEADER, ...rows]
  }
}
