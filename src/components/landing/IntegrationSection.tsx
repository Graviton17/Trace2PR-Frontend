import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  ChartNoAxesCombined,
  Cloud,
  GitPullRequest,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

type Integration = {
  id: string;
  name: string;
  category: string;
  description: string;
  credentialSummary: string;
  uses: string[];
  icon: typeof Activity;
};

const integrations: Integration[] = [
  {
    id: 'datadog',
    name: 'Datadog',
    category: 'Monitoring',
    description: 'Correlate monitors, metrics, and deployment signals with the failing service.',
    credentialSummary: 'API key + application key',
    uses: ['Monitor context', 'Metric correlation'],
    icon: Activity,
  },
  {
    id: 'sentry',
    name: 'Sentry',
    category: 'Error tracking',
    description: 'Add error events, stack traces, and affected release context to the investigation.',
    credentialSummary: 'Auth token + organization slug',
    uses: ['Issue evidence', 'Release context'],
    icon: AlertTriangle,
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    category: 'Incident response',
    description: 'Start a trace from the incident that already reached your on-call team.',
    credentialSummary: 'API token',
    uses: ['Incident trigger', 'Escalation context'],
    icon: BellRing,
  },
  {
    id: 'grafana',
    name: 'Grafana',
    category: 'Observability',
    description: 'Bring dashboard observations and alert state into the remediation record.',
    credentialSummary: 'Service-account token + URL',
    uses: ['Dashboard signals', 'Alert evidence'],
    icon: ChartNoAxesCombined,
  },
  {
    id: 'cloudwatch',
    name: 'CloudWatch',
    category: 'Cloud monitoring',
    description: 'Trace AWS telemetry and resource context alongside the resulting code fix.',
    credentialSummary: 'AWS access key + secret + region',
    uses: ['AWS metrics', 'Resource context'],
    icon: Cloud,
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Version control',
    description: 'Read repository context and send the validated change into your normal review flow.',
    credentialSummary: 'Personal access token',
    uses: ['Repository context', 'Pull request delivery'],
    icon: GitPullRequest,
  },
];

export function IntegrationSection() {
  const [selectedId, setSelectedId] = useState('datadog');
  const selected = integrations.find((integration) => integration.id === selectedId) ?? integrations[0];
  const SelectedIcon = selected.icon;

  function selectIntegration(id: string) {
    setSelectedId(id);
  }

  return (
    <section className="integration-section section" id="integrations" aria-labelledby="integrations-title">
      <div className="page-shell">
        <div className="integration-heading">
          <div>
            <span className="eyebrow">Your tools, one trace</span>
            <h2 id="integrations-title">Connect the signals that explain an incident.</h2>
          </div>
          <p>
            Trace2PR is designed around the services its backend can verify today, keeping alert evidence and
            pull-request context connected.
          </p>
        </div>
        <div className="integration-explorer">
          <div className="integration-picker" role="tablist" aria-label="Available Trace2PR integrations">
            {integrations.map(({ id, name, category, icon: Icon }) => (
              <button
                key={id}
                className={
                  id === selectedId ? 'integration-option integration-option--active' : 'integration-option'
                }
                type="button"
                role="tab"
                aria-selected={id === selectedId}
                aria-controls="integration-details"
                onClick={() => selectIntegration(id)}
              >
                <span className="integration-option__icon">
                  <Icon size={18} />
                </span>
                <span>
                  <strong>{name}</strong>
                  <small>{category}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="integration-details" id="integration-details" role="tabpanel">
            <div className="integration-details__title">
              <span className="integration-details__icon">
                <SelectedIcon size={25} />
              </span>
              <div>
                <span className="eyebrow eyebrow--green">{selected.category}</span>
                <h3>{selected.name}</h3>
              </div>
              <span className="integration-ready">
                <CheckCircle2 size={14} /> Supported
              </span>
            </div>
            <p>{selected.description}</p>
            <div className="connection-requirement">
              <KeyRound size={17} />
              <div>
                <span>Connection requirement</span>
                <strong>{selected.credentialSummary}</strong>
              </div>
            </div>
            <div className="integration-uses">
              <span>Trace2PR uses it for</span>
              <div>
                {selected.uses.map((use) => (
                  <small key={use}>{use}</small>
                ))}
              </div>
            </div>
            <div className="integration-details__footer">
              <span>
                <ShieldCheck size={15} /> Connected with OAuth. Trace2PR never sees your credentials.
              </span>
              <Link to="/login">
                Connect {selected.name} <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
