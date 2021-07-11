export class Ngram {
  public bigrams(array: Array<any>) {
    return this.ngrams(array, 2)
  }
  public ngrams(array: Array<any>, length: number): Array<string[]> {
    const ngrams: any = []

    for (let i = 0; i < array.length - (length - 1); i++) {
      const subNgrams: string[] = []
      for (let j = 0; j < length; j++) {
        subNgrams.push(array[i + j])
      }

      if (subNgrams.filter(this.onlyUnique).length === subNgrams.length) {
        ngrams.push(subNgrams)
      }
    }
    return ngrams
  }

  private onlyUnique(value, index, self) {
    return self.indexOf(value) === index
  }
}
