import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StringHelper from 'App/Helpers/StringHelper'
import HistoricalMetric from 'App/Models/HistoricalMetric'
import Project from 'App/Models/Project'
import GoogleAdService from 'App/Services/GoogleAdService'
import OutputService from 'App/Services/OutputService'
import _ from 'lodash'

export default class ProjectsController {
  private googleAdService: GoogleAdService
  private outputService: OutputService

  constructor() {
    this.googleAdService = new GoogleAdService()
    this.outputService = new OutputService()
  }

  public async show({ params, view, response }: HttpContextContract) {
    const { id } = params

    const project = await Project.find(id)

    if (project === null) {
      return response.abort(404)
    }
    const frequency: any[] = await project.getFrequency()

    const colors = _.chain(frequency)
      .map((item) => ({
        key: item.label,
        value: StringHelper.toRGB(item.label, 0.2),
      }))
      .keyBy('key')
      .mapValues('value')
      .value()

    return view.render('projects/show', { items: frequency, project, colors })
  }

  public async delete({ params, response }: HttpContextContract) {
    const { id } = params
    const project = await Project.find(id)

    if (project === null) {
      return response.abort(404)
    }

    await project.delete()

    return response.redirect('/')
  }

  public async download({ params, response }: HttpContextContract) {
    const { id } = params

    const project = await Project.query().where('id', id).preload('historicalMetrics').first()
    if (project === null) {
      return response.abort(404)
    }

    const frequency: any[] = await project.getFrequency()

    if (!project.keywordPlan || !project.planAdGroup) {
      const [keywordPlan, planAdGroup] = await this.googleAdService.createResources()
      project.keywordPlan = keywordPlan
      project.planAdGroup = planAdGroup
      await project.save()

      const keywords = _.uniq(_.map(frequency, 'ngram'))

      if (keywords.length > 0) {
        await this.googleAdService.addKeywords(project.planAdGroup, keywords)
      }
    }

    let metrics = {}
    if (project.historicalMetrics) {
      metrics = JSON.parse(project.historicalMetrics.metrics)
      console.log('find metrics')
    } else {
      const res = await this.googleAdService.generateHistoricalMetrics(project.keywordPlan)
      metrics = _.keyBy(res.metrics, 'search_query')
      console.log('remember metrics')

      await HistoricalMetric.create({ project_id: project.id, metrics: JSON.stringify(metrics) })
    }

    const debug = false

    if (debug) {
      const csv = this.outputService.toCSV(frequency, metrics)
      response.header('Content-Disposition', `attachment; filename="${project.name}.csv"`)
      response.header('Content-Type', 'application/vnd.openxmlformats; charset=utf-16le')
      response.send('\ufeff' + csv)
    } else {
      const xlsx = this.outputService.toExcel(frequency, metrics)
      response.header('Content-Disposition', `attachment; filename="${project.name}.xlsx"`)
      response.header('Content-Type', 'application/vnd.openxmlformats')
      response.send(xlsx)
    }
  }
}
