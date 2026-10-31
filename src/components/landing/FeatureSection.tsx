import { Bot, Braces, CheckCircle2, DatabaseZap, GitBranch, LockKeyhole } from 'lucide-react';

export function FeatureSection() {
  return (
    <section className="features-section section" id="features" aria-labelledby="features-title">
      <div className="page-shell feature-layout">
        <div className="feature-copy">
          <span className="eyebrow">Built for accountable automation</span>
          <h2 id="features-title">Every proposed change arrives with its receipts.</h2>
          <p>
            Give reviewers the context to move quickly: the alert trail, diagnosis, diff, test output, and
            decision trail live together.
          </p>
          <ul className="check-list">
            <li>
              <CheckCircle2 size={18} /> Evidence linked to the exact change
            </li>
            <li>
              <CheckCircle2 size={18} /> Sandboxed code execution before review
            </li>
            <li>
              <CheckCircle2 size={18} /> Teams stay in control of every merge
            </li>
          </ul>
        </div>
        <div className="assurance-card">
          <div className="assurance-card__header">
            <span className="eyebrow eyebrow--green">PR readiness report</span>
            <span className="readiness-state">
              <CheckCircle2 size={15} /> Ready for review
            </span>
          </div>
          <div className="assurance-card__issue">
            <span className="issue-icon">
              <Bot size={19} />
            </span>
            <div>
              <strong>Fix connection-pool exhaustion</strong>
              <small>trace2pr/fix/INC-2048</small>
            </div>
          </div>
          <div className="assurance-list">
            <div>
              <GitBranch size={17} />
              <span>Change scope</span>
              <strong>3 files</strong>
            </div>
            <div>
              <Braces size={17} />
              <span>Checks completed</span>
              <strong>18 passed</strong>
            </div>
            <div>
              <DatabaseZap size={17} />
              <span>Evidence sources</span>
              <strong>12 linked</strong>
            </div>
            <div>
              <LockKeyhole size={17} />
              <span>Execution</span>
              <strong>Sandboxed</strong>
            </div>
          </div>
          <div className="assurance-card__footer">
            <span>Generated in 4m 12s</span>
            <span>View evidence →</span>
          </div>
        </div>
      </div>
    </section>
  );
}
