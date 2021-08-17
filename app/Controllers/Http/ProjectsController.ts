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

  public async index({ view }: HttpContextContract) {
    const projects = await Project.query().preload('semantic_link').orderBy('id', 'asc')

    return view.render('projects/index', { projects: projects.map((p) => p.toJSON()) })
  }

  public async show({ params, view, response }: HttpContextContract) {
    const { id } = params

    const project = await Project.query().where('id', id).preload('historicalMetrics').first()

    if (project === null) {
      return response.abort(404)
    }
    const frequency: any[] = await project.getFrequency()

    let metrics = {}
    if (project.historicalMetrics) {
      metrics = JSON.parse(project.historicalMetrics.metrics)
    }
    metrics = _.chain(metrics)
      .mapValues('keyword_metrics.monthly_search_volumes')
      .mapValues(function (item: any[]) {
        if (item) {
          const min = Math.min(...item.map((jitem) => +jitem.monthly_searches))
          const max = Math.max(...item.map((jitem) => +jitem.monthly_searches))
          return item.map((jitem) => {
            return {
              label: `${jitem.month} ${jitem.year}: ${jitem.monthly_searches}`,
              value: ((20 - 0) / (max - min)) * (+jitem.monthly_searches - max) + 20,
            }
          })
        }
      })
      .value()

    const colors = _.chain(frequency)
      .map((item) => ({
        key: item.label,
        value: StringHelper.toRGB(item.label),
      }))
      .keyBy('key')
      .mapValues('value')
      .value()

    return view.render('projects/show', { items: frequency, project, colors, metrics })
  }

  public async delete({ params, response }: HttpContextContract) {
    const { id } = params
    const project = await Project.find(id)

    if (project === null) {
      return response.abort(404)
    }
    if (project.keywordPlan) {
      await this.googleAdService.deleteKeywordPlan(project.keywordPlan)
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

    const xlsx = this.outputService.toExcel(frequency, metrics)
    response.header(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(project.name)}-report.xlsx"`
    )
    response.header('Content-Type', 'application/vnd.openxmlformats')
    response.send(xlsx)
  }
}
