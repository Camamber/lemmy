import { Customer, enums, GoogleAdsApi, ResourceNames, services } from 'google-ads-api'
import Env from '@ioc:Adonis/Core/Env'

export default class GoogleAdService {
  private customer: Customer
  constructor() {
    const client = new GoogleAdsApi({
      client_id: Env.get('CLIENT_ID'),
      client_secret: Env.get('CLIENT_SECRET'),
      developer_token: Env.get('DEVELOPER_TOKEN'),
    })

    this.customer = client.Customer({
      customer_id: Env.get('CUSTOMER_ID'),
      login_customer_id: Env.get('LOGIN_CUSTOMER_ID'),
      refresh_token: Env.get('REFRESH_TOKEN'),
    })
  }

  public async createResources() {
    const keywordPlanResource = await this.createKeywordPlan(this.customer)
    const planCampaignResource = await this.createKeywordPlanCampaign(
      this.customer,
      keywordPlanResource
    )
    const planAdGroupResource = await this.createKeywordPlanAdGroup(
      this.customer,
      planCampaignResource
    )

    return [keywordPlanResource, planAdGroupResource]
  }

  public deleteKeywordPlan(keywordPlanResource: string) {
    return this.customer.keywordPlans.remove([keywordPlanResource])
  }

  public async addKeywords(planAdGroupResource, keywords) {
    await this.createKeywordPlanAdGroupKeywords(this.customer, planAdGroupResource, keywords)
  }

  public async generateHistoricalMetrics(keywordPlanResource: string) {
    const generateHistoricalMetricsRequest = services.GenerateHistoricalMetricsRequest.create({
      keyword_plan: keywordPlanResource,
    })

    const response = await this.customer.keywordPlans.generateHistoricalMetrics(
      generateHistoricalMetricsRequest
    )

    return response
  }

  public async createKeywordPlan(customer: Customer) {
    const keywordPlan = {
      name: 'Keyword plan for traffic estimate #' + Date.now(),
      forecast_period: { date_interval: enums.KeywordPlanForecastInterval.NEXT_MONTH },
    }

    const response = await customer.keywordPlans.create([keywordPlan])

    const resourceName = response.results[0].resource_name

    return resourceName || 'None'
  }

  public async createKeywordPlanCampaign(customer: Customer, keywordPlanResource: string) {
    const keywordPlanCampaign = {
      cpc_bid_micros: 1000000,
      name: 'Keyword plan campaign #' + Date.now(),
      keyword_plan: keywordPlanResource,
      keyword_plan_network: enums.KeywordPlanNetwork.GOOGLE_SEARCH,
      geo_targets: [{ geo_target_constant: ResourceNames.geoTargetConstant(2804) }],
    }

    const response = await customer.keywordPlanCampaigns.create([keywordPlanCampaign])
    const planCampaignResource = response.results[0].resource_name
    return planCampaignResource
  }

  public async createKeywordPlanAdGroup(customer: Customer, planCampaignResource) {
    const keywordPlanAdGroup = {
      name: 'Keyword plan ad group #' + Date.now(),
      cpc_bid_micros: 2500000,
      keyword_plan_campaign: planCampaignResource,
    }

    const response = await customer.keywordPlanAdGroups.create([keywordPlanAdGroup])
    const planAdGroupResource = response.results[0].resource_name
    return planAdGroupResource || 'None'
  }

  public async createKeywordPlanAdGroupKeywords(customer: Customer, planAdGroupResource, keywords) {
    const keywordPlanKeyword = keywords.map((keyword) => ({
      text: keyword,
      cpc_bid_micros: 1990000,
      match_type: enums.KeywordMatchType.BROAD,
      keyword_plan_ad_group: planAdGroupResource,
    }))

    // Passing in a single entity to create
    await customer.keywordPlanAdGroupKeywords.create(keywordPlanKeyword).catch(console.error)
    // for (const result of response.results) {
    //   console.log('Created ad group keyword for keyword plan: ', result.resource_name)
    // }
  }
}
