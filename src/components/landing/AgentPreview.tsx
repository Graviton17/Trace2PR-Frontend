import { Check, ChevronRight, CircleAlert, Code2, FileCheck2, GitPullRequest, ShieldCheck, Sparkles } from 'lucide-react'

const steps = [
  { label: 'Trace the signal', detail: 'Correlated alert and deploy', icon: CircleAlert, state: 'complete' },
  { label: 'Build the evidence', detail: 'Root cause identified', icon: Sparkles, state: 'complete' },
  { label: 'Validate the fix', detail: 'Tests running in sandbox', icon: ShieldCheck, state: 'active' },
  { label: 'Open pull request', detail: 'Human review stays in control', icon: GitPullRequest, state: 'pending' },
]

export function AgentPreview() {
  return <div className="agent-preview" aria-label="Example Trace2PR incident workflow">
    <div className="agent-preview__topbar"><div className="preview-window-controls" aria-hidden="true"><i /><i /><i /></div><span className="agent-preview__title"><span className="live-dot" /> Live incident run</span><span className="preview-status"><ShieldCheck size={13} /> Isolated sandbox</span></div>
    <div className="agent-preview__body">
      <aside className="agent-steps" aria-label="Workflow steps"><div className="agent-steps__label">Incident #INC-2048</div>{steps.map(({ label, detail, icon: Icon, state }) => <div className={`agent-step agent-step--${state}`} key={label}><span className="agent-step__icon"><Icon size={15} /></span><span><strong>{label}</strong><small>{detail}</small></span></div>)}</aside>
      <section className="agent-workspace" aria-label="Investigation output">
        <div className="workspace-heading"><div><span className="eyebrow eyebrow--green">Analysis complete</span><h2>Checkout latency after v4.18.0</h2></div><span className="severity-chip"><CircleAlert size={13} /> P1</span></div>
        <div className="evidence-grid"><div className="evidence-card evidence-card--wide"><span className="evidence-card__label">Root cause</span><p>Connection pool exhausts when the retry worker overlaps the checkout deploy.</p><div className="code-line"><Code2 size={14} /><code>pool.max_connections = 40 → 80</code></div></div><div className="evidence-card"><span className="evidence-card__label">Signals</span><strong>12 correlated</strong><span className="evidence-card__meta">Datadog · Sentry · GitHub</span></div></div>
        <div className="validation-card"><div className="validation-card__head"><span><FileCheck2 size={16} /> Validation</span><strong><Check size={13} /> 18/18 passing</strong></div><div className="test-row"><span>checkout worker regression</span><span>0.84s</span></div><div className="test-row"><span>pool saturation scenario</span><span>1.21s</span></div></div>
        <button className="preview-pr" type="button"><GitPullRequest size={16} /> Review pull request <ChevronRight size={15} /></button>
      </section>
    </div>
  </div>
}
