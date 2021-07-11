import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Mystem } from 'App/Classes/Mystem'
import { Ngram } from 'App/Classes/Ngram'
import { Stopword } from 'App/Classes/Stopword'

export default class HomeController {
  public async index({ view }: HttpContextContract) {
    return view.render('index')
  }

  public async store({ view, request }: HttpContextContract) {
    const text = request.input('text')
    const mystem = new Mystem()
    let lines: Array<any> = []
    for (const line of text.split('\n')) {
      const lems: string[] = await mystem.lemmatize(line)
      lines.push(lems)
    }

    console.log(lines)

    const stopword = new Stopword()
    lines = lines.map((lems) => {
      return stopword.removeStopwords(lems, 'ru')
    })

    console.log(lines)

    const ngram = new Ngram()
    lines = lines.map((prepared) => {
      return ngram.bigrams(prepared)
    })

    console.log(lines)

    let count = 0
    const frequency = {}
    for (const line of lines) {
      for (const bigram of line) {
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

    let items = Object.values(frequency)
      .filter((item: any) => item.value > 1)
      .sort((a: any, b: any) => b.value - a.value)

    console.log(items)
    return view.render('index', { items, text, count })
  }
}
