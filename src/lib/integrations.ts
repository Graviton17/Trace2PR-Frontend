/** How to point each monitoring tool at the user's Trace2PR webhook URL. */
export const WEBHOOK_HELP: Record<string, string> = {
  sentry:
    'In Sentry, create an internal integration (Settings → Developer Settings) with this webhook URL and the "issue" and "error" webhooks enabled, or add it to an alert rule\'s webhook action.',
  datadog:
    'In Datadog, add a webhook (Integrations → Webhooks) with this URL and mention it in your monitors (@webhook-trace2pr).',
  cloudwatch: 'Subscribe this URL (HTTPS) to the SNS topic your CloudWatch alarms notify.',
  pagerduty: 'In PagerDuty, add a generic webhook subscription with this URL.',
  grafana: 'In Grafana, add a webhook contact point with this URL.',
};

/** What the service name of an error is, per tool (it must match a repo mapping). */
export const SERVICE_KEY_HELP: Record<string, string> = {
  sentry: 'the Sentry project slug',
  datadog: 'the Datadog `service` tag',
  cloudwatch: 'the service set in the CloudWatch integration',
};
