import { spawn } from 'child_process'
import { resolve } from 'path'

export class Mystem {
  private path: string
  constructor() {
    this.path = resolve('resources', 'mystem', process.platform, process.arch, 'mystem')
  }

  public lemmatize(text: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      const mystem = spawn(this.path, ['-n', '-l', '-e', 'utf-8'])
      mystem.stderr.setEncoding('utf-8')

      mystem.stderr.on('data', function (data) {
        return reject(data.toString())
      })

      let chunks = ''
      mystem.stdout.setEncoding('utf-8')
      mystem.stdout.on('data', function (data) {
        return (chunks += data)
      })

      mystem.stdout.on('end', function () {
        resolve(chunks.toString().trim().split(/\r\n/g))
      })

      mystem.stdin.end(text)
    })
  }
}
