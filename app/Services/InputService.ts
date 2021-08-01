import * as CSV from 'csv-string'
import xlsx from 'node-xlsx'

export default class InputService {
  public parseTextInput(text) {
    const rows: string[][] = CSV.parse(text.trim())
    return rows.map((row) => row.map((col) => col.trim()))
  }

  public parseExcelFile(filepath) {
    const workSheetsFromBuffer = xlsx.parse(filepath)
    const page = workSheetsFromBuffer[0]

    const rows: string[][] = page.data
    return rows.map((row) => row.map((col) => col.trim()))
  }
}
