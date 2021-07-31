import * as CSV from 'csv-string'
import xlsx from 'node-xlsx'

const HEADER = [
  'Label',
  'Link',
  'Ngram',
  'Frequency',
  'Global frequency',
  'Last Month Searches',
  'Avg Searches Last 3 Month',
  'Avg Searches Last 6 Month',
  'Avg Searches Last Year',
]
export default class OutputService {
  public toCSV(frequency) {
    const data = this.rows(frequency)
    return CSV.stringify(data, ';')
  }

  public toExcel(frequency) {
    const data = this.rows(frequency)
    return xlsx.build([{ name: 'sheet 1', data: data }])
  }

  protected rows(frequency): any[] {
    const rows = [...frequency].map((row) => {
      delete row.label_id
      return Object.values(row)
    })

    return [HEADER, ...rows]
  }
}
