import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AgentPreview } from '../components/landing/AgentPreview';
import { BrandMark } from '../components/landing/BrandMark';
import { FeatureSection } from '../components/landing/FeatureSection';
import { IntegrationSection } from '../components/landing/IntegrationSection';
import { LandingHeader } from '../components/landing/LandingHeader';
import { WorkflowSection } from '../components/landing/WorkflowSection';
import '../components/landing/landing.css';

export default function LandingPage() {
  const { user } = useAuth();
  const start = user ? '/dashboard' : '/login';
  return (
    <main id="top" className="landing">
      <LandingHeader />
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-glow" aria-hidden="true" />
        <div className="page-shell hero-section__content">
          <div className="hero-copy">
            <p className="announcement">
              <span className="announcement__dot" /> Error → triage → sandboxed fix → draft PR
            </p>
            <h1 id="hero-title">
              Turn production incidents into <em>trusted</em> pull requests.
            </h1>
            <p className="hero-copy__description">
              Trace2PR picks up errors from Sentry, Datadog and CloudWatch, reproduces them, verifies a
              focused fix in an isolated sandbox, and opens a draft pull request your team can review in one
              click.
            </p>
            <div className="hero-actions">
              <Link className="button button--large" to={start}>
                {user ? 'Open your dashboard' : 'Start tracing incidents'} <ArrowRight size={18} />
              </Link>
              <a className="watch-link" href="#workflow">
                <span>
                  <Play size={13} fill="currentColor" />
                </span>{' '}
                See how it works
              </a>
            </div>
            <div className="hero-proof">
              <span>
                <CheckCircle2 size={16} /> Human approval stays in the loop
              </span>
              <span>
                <CheckCircle2 size={16} /> Regression test fails before, passes after
              </span>
            </div>
          </div>
          <AgentPreview />
        </div>
      </section>
      <IntegrationSection />
      <WorkflowSection />
      <FeatureSection />
      <section className="final-cta" id="get-started" aria-labelledby="cta-title">
        <div className="page-shell final-cta__inner">
          <span className="eyebrow">Make every incident teach your codebase</span>
          <h2 id="cta-title">Less firefighting. More confidence in every fix.</h2>
          <p className="final-cta__note">
            Connect GitHub and one monitoring tool, and new errors start turning into reviewable fixes.
          </p>
          <Link className="button button--light button--large" to={start}>
            {user ? 'Open your dashboard' : 'Get started with Trace2PR'} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <footer className="site-footer">
        <div className="page-shell site-footer__inner">
          <BrandMark compact />
          <span>© {new Date().getFullYear()} Trace2PR</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
