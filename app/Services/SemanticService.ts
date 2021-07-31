import { Mystem } from 'App/Classes/Mystem'
import { Ngram } from 'App/Classes/Ngram'
import { Stopword } from 'App/Classes/Stopword'

export default class SemanticService {
  public async lemmatize(text) {
    const mystem = new Mystem()
    const lems: string[] = await mystem.lemmatize(text.trim())
    return lems.map((lem) => lem.replace(/\?/g, ''))
  }

  public removeStopwords(words) {
    const stopword = new Stopword()
    return stopword.removeStopwords(words, 'ru')
  }

  public transformToNgram(words, n) {
    const ngram = new Ngram()
    return ngram.ngrams(words, n)
  }

  public calculateFrequency(lines, threshold = 1) {
    let items = lines.reduce((acc, line) => {
      acc[line.ngram] = 1 + (acc[line.ngram] || 0)
      return acc
    }, {})
    items = Object.entries(items).map(([ngram, value]) => ({ ngram, value }))
    return items.filter((i) => i.value > threshold)
  }
}
