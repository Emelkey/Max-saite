/**
 * MAX SITE / Google Ads Scripts: read-only budget and bidding drift check.
 * Prepared 2026-09-27. Paste into the MAX SITE child account only after
 * reviewing current Ads state. This file is not installed or scheduled.
 *
 * Google Ads Scripts entry point: main(). No mutation, email, URL fetch,
 * auto-pause, or external storage calls exist in this script.
 * Official API: https://developers.google.com/google-ads/scripts/docs/reference/adsapp/adsapp
 * Budget: https://developers.google.com/google-ads/scripts/docs/reference/adsapp/adsapp_budget
 * Bidding: https://developers.google.com/google-ads/scripts/docs/reference/adsapp/adsapp_campaignbidding
 */

const MAX_SITE_GUARD = Object.freeze({
  DRY_RUN: true,
  CUSTOMER_ID: '7782255000',
  ACCOUNT_NAME: 'MAX SITE',
  CAMPAIGN_ID: 24122973025,
  CAMPAIGN_NAME: 'MAXSITE WEB',
  CURRENCY: 'UAH',
  TIME_ZONES: Object.freeze(['Europe/Kiev', 'Europe/Kyiv']),
  DAILY_BUDGET_UAH: 300,
  BIDDING_STRATEGY: 'TARGET_SPEND',
  CPC_BID_CEILING: null,
});

function main() {
  let log = {
    check: 'MAX_SITE_BUDGET_GUARD_V1',
    dry_run: MAX_SITE_GUARD.DRY_RUN,
    at_utc: new Date().toISOString(),
    status: 'BLOCKED',
  };

  try {
    if (MAX_SITE_GUARD.DRY_RUN !== true) {
      throw new Error('DRY_RUN must be true; no write mode is implemented');
    }

    const account = AdsApp.currentAccount();
    const customerId = String(account.getCustomerId()).replace(/\D/g, '');
    const accountName = String(account.getName());
    const currency = String(account.getCurrencyCode());
    const timeZone = String(account.getTimeZone());
    log.customer_id = customerId;
    log.account_time_zone = timeZone;

    requireValue(customerId === MAX_SITE_GUARD.CUSTOMER_ID, 'Unexpected customer ID');
    requireValue(accountName === MAX_SITE_GUARD.ACCOUNT_NAME, 'Unexpected account name');
    requireValue(currency === MAX_SITE_GUARD.CURRENCY, 'Unexpected account currency');
    requireValue(MAX_SITE_GUARD.TIME_ZONES.indexOf(timeZone) !== -1,
      'Unexpected account time zone');

    // Campaign IDs are numeric in withIds(); this ID is below JS safe integer limit.
    const iterator = AdsApp.campaigns().withIds([MAX_SITE_GUARD.CAMPAIGN_ID]).get();
    requireValue(iterator.hasNext(), 'Allowlisted campaign not found');
    const campaign = iterator.next();
    requireValue(!iterator.hasNext(), 'Duplicate campaign ID result');

    const campaignId = String(campaign.getId());
    const campaignName = String(campaign.getName());
    log.campaign_id = campaignId;
    requireValue(campaignId === String(MAX_SITE_GUARD.CAMPAIGN_ID),
      'Unexpected campaign ID');
    requireValue(campaignName === MAX_SITE_GUARD.CAMPAIGN_NAME,
      'Unexpected campaign name');
    requireValue(campaign.isEnabled() === true, 'Campaign is not enabled');

    const budget = campaign.getBudget();
    requireValue(budget != null, 'Campaign budget is unavailable');
    const budgetType = String(budget.getType());
    const budgetShared = budget.isExplicitlyShared();
    const budgetAmount = budget.getAmount();
    log.budget_id = String(budget.getId());
    log.budget_type = budgetType;
    log.budget_shared = budgetShared;
    log.daily_budget_uah = budgetAmount;
    requireValue(budgetType === 'DAILY', 'Budget is not DAILY');
    requireValue(budgetShared === false, 'Budget is explicitly shared; total scope unknown');
    requireValue(isFiniteNumber(budgetAmount), 'Invalid budget amount');
    requireValue(Math.abs(budgetAmount - MAX_SITE_GUARD.DAILY_BUDGET_UAH) < 0.005,
      'Daily budget differs from verified 300 UAH baseline');

    const strategy = String(campaign.getBiddingStrategyType());
    const cpcCeiling = campaign.bidding().getCpcBidCeiling();
    log.bidding_strategy = strategy;
    log.cpc_bid_ceiling_uah = cpcCeiling;
    requireValue(strategy === MAX_SITE_GUARD.BIDDING_STRATEGY,
      'Bidding strategy differs from verified TARGET_SPEND baseline');
    requireValue(cpcCeiling === MAX_SITE_GUARD.CPC_BID_CEILING,
      'CPC bid ceiling differs from verified OFF baseline');

    // Stats.getCost() is in account currency, not micros. Yesterday is a
    // completed account-day; it is observed only, never treated as a hard cap.
    const yesterday = campaign.getStatsFor('YESTERDAY');
    const yesterdayCost = yesterday.getCost();
    requireValue(isFiniteNumber(yesterdayCost) && yesterdayCost >= 0,
      'Invalid yesterday cost');
    log.yesterday_served_cost_uah = yesterdayCost;
    log.yesterday_clicks = yesterday.getClicks();
    log.yesterday_ads_conversions = yesterday.getConversions();
    log.yesterday_cost_rule = 'OBSERVED_ONLY_NOT_A_HARD_DAILY_CAP';

    // Qualification thresholds remain disabled until owner economics and
    // verified qualified-lead records exist. No made-up Max_CPQL is used.
    log.qualified_lead_rule = 'NOT_EVALUATED_OWNER_DATA_UNKNOWN';
    log.policy_url_autoapply_rules = 'NOT_EVALUATED_SEPARATE_NATIVE_CHECK';
    log.status = 'PASS_READ_ONLY';
    console.log(JSON.stringify(log));
  } catch (error) {
    log.reason = String(error && error.message ? error.message : error);
    console.error(JSON.stringify(log));
    throw error;
  }
}

function requireValue(condition, reason) {
  if (!condition) throw new Error(reason);
}

function isFiniteNumber(value) {
  return typeof value === 'number' && isFinite(value);
}
