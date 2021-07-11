import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Mystem } from 'App/Classes/Mystem'
import { Ngram } from 'App/Classes/Ngram'
import { Stopword } from 'App/Classes/Stopword'

export default class HomeController {
  public async index({ view }: HttpContextContract) {
    return view.render('index')
  }

  public async store({ view, request }: HttpContextContract) {
    const text: string = request.input('text', '')
    if (!text) {
      return view.render('index')
    }
    let lines: any[] = text.trim().split('\n')

    const mystem = new Mystem()
    console.time('a')
    for (let i = 0; i < lines.length; i += 20) {
      const chunk = lines.slice(i, i + 20)
      const lems: string[][] = await Promise.all(chunk.map((line) => mystem.lemmatize(line.trim())))

      lems.forEach((lem, index) => (lines[i + index] = lem))
    }
    console.timeEnd('a')

    const stopword = new Stopword()
    lines = lines.map((lems) => {
      return stopword.removeStopwords(lems, 'ru')
    })

    const ngram = new Ngram()
    lines = lines.map((prepared) => {
      return ngram.bigrams(prepared)
    })

    let count = 0
    const frequency = {}
    for (const line of lines) {
      if (!line.length) {
        continue
      }
      for (const bigram of line) {
        if (!bigram.length) {
          continue
        }
        count++
        const key = bigram.sort().join('_')
        if (frequency[key]) {
          frequency[key].value++
        } else {
          frequency[key] = {
            key: bigram.join(' '),
            value: 1,
          }
        }
      }
    }

    const items = Object.values(frequency)
      .filter((item: any) => item.value > 1)
      .sort((a: any, b: any) => b.value - a.value)

    return view.render('index', { items, text, count })
  }
}
