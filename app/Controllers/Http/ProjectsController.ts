import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StringHelper from 'App/Helpers/StringHelper'
import Project from 'App/Models/Project'
import Semantic from 'App/Models/Semantic'
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

  public async download({ params, response }: HttpContextContract) {
    const { id } = params

    const project = await Project.find(id)
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

    const r = await this.googleAdService.generateHistoricalMetrics(project.keywordPlan)
    const metrics = _.keyBy(r.metrics, 'search_query')

    for (const query in metrics) {
      if (Object.prototype.hasOwnProperty.call(metrics, query)) {
        const metric = JSON.stringify(metrics[query])
        await Semantic.query().where('ngram', query).update({ google_json: metric })
      }
    }

    project.metrics = true
    project.save()

    frequency.forEach((item) => {
      item['last_month_searches'] = 'n/a'
      item['avg_monthly_searches_3'] = 'n/a'
      item['avg_monthly_searches_6'] = 'n/a'
      item['avg_monthly_searches_12'] = 'n/a'
      const metric = metrics[item.ngram]
      if (metric && metric.keyword_metrics) {
        const monthlySearchVolumes = _.chain(metric.keyword_metrics.monthly_search_volumes)
          .map('monthly_searches')
          .map(Number)

        const [prev, curr] = monthlySearchVolumes.takeRight(2).value()
        const growth = StringHelper.calculateGrowth(curr, prev)

        item['last_month_searches'] = monthlySearchVolumes.last().floor().value() + growth
        item['avg_monthly_searches_3'] = monthlySearchVolumes.takeRight(3).mean().floor().value()
        item['avg_monthly_searches_6'] = monthlySearchVolumes.takeRight(6).mean().floor().value()
        item['avg_monthly_searches_12'] = metric.keyword_metrics.avg_monthly_searches
      }
    })

    const debug = false

    if (debug) {
      const csv = this.outputService.toCSV(frequency)
      response.header('Content-Disposition', `attachment; filename="${id}.csv"`)
      response.header('Content-Type', 'application/vnd.openxmlformats; charset=utf-16le')
      response.send('\ufeff' + csv)
    } else {
      const xlsx = this.outputService.toExcel(frequency)
      response.header('Content-Disposition', `attachment; filename="${id}.xlsx"`)
      response.header('Content-Type', 'application/vnd.openxmlformats; charset=utf-16le')
      response.send(xlsx)
    }
  }
}
