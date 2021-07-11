export class Stopword {
  private stopword
  constructor() {
    this.stopword = require('stopword')
  }

  public removeStopwords(words: string[], lang: string) {
    return this.stopword.removeStopwords(words, this.stopword[lang])
  }
}
