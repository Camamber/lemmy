import { cuid } from '@ioc:Adonis/Core/Helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'
import Semantic from 'App/Models/Semantic'
import InputService from 'App/Services/InputService'
import SemanticService from 'App/Services/SemanticService'
import { unlinkSync } from 'fs'

const DELIMITER = 'qwNLqw'

export default class HomeController {
  private inputService: InputService
  private semanticService: SemanticService

  constructor() {
    this.inputService = new InputService()
    this.semanticService = new SemanticService()
  }

  public async index({ view }: HttpContextContract) {
    return view.render('index')
  }

  public async store({ view, request, response }: HttpContextContract) {
    const sheet = request.file('sheet', { extnames: ['xlsx', 'xls'] })
    const text: string = request.input('text', '')
    const ngram: number = request.input('ngram', 2)

    if (!text && !sheet) {
      return view.render('index')
    }

    console.time('parse input')
    let lines: any[] = []
    if (sheet) {
      const fileName = `${cuid()}.${sheet.extname}`
      await sheet.move('uploads', { name: fileName, overwrite: true })
      lines = this.inputService.parseExcelFile('uploads/' + fileName)
      unlinkSync('uploads/' + fileName)
    } else {
      lines = this.inputService.parseTextInput(text)
    }
    console.timeEnd('parse input')

    if (!lines.length) {
      return view.render('index')
    }

    const project = new Project()
    project.name = 'Project #' + Date.now()
    project.ngram = ngram
    if (sheet) {
      project.name = sheet.clientName.replace('.' + sheet.extname, '')
    }
    if (lines.reduce((acc, item) => acc + item.length, 0) / lines.length > 1) {
      await project.save()
    }

    console.time(project.name)
    const newText = lines.map((line) => line[0]).join(` ${DELIMITER} `)
    let globalLemmas: string[] = await this.semanticService.lemmatize(newText)
    globalLemmas = this.semanticService.removeStopwords(globalLemmas)

    const labels: any[] = []
    const rows: any[] = []
    for (const line of lines) {
      if (line[1] && !labels.includes(line[1])) {
        labels.push(line[1])
      }

      const index = globalLemmas.indexOf(DELIMITER)
      const lemmas: string[] = globalLemmas.splice(0, index + 1).filter((v) => v !== DELIMITER)
      const ngrams = this.semanticService.transformToNgram(lemmas, project.ngram)
      for (const ngram of ngrams) {
        rows.push({
          project_id: project.id || 0,
          ngram: ngram.sort().join(' '),
          line: line[0],
          label_id: line[1] ? labels.indexOf(line[1]) + 1 : 1,
          label: line[1],
          link: line[2],
        })
      }
    }

    if (project.id) {
      await Semantic.createMany(rows)
      console.timeEnd(project.name)
      return response.redirect(`/projects/${project.id}`)
    } else {
      const items = this.semanticService.calculateFrequency(rows)
      console.timeEnd(project.name)
      return view.render('index', { items, text })
    }
  }
}
