import { ArrowRight, CheckCircle2, Play } from 'lucide-react'
import { AgentPreview } from './AgentPreview'
import { BrandMark } from './BrandMark'
import { FeatureSection } from './FeatureSection'
import { IntegrationSection } from './IntegrationSection'
import { LandingHeader } from './LandingHeader'
import { WorkflowSection } from './WorkflowSection'

export function LandingPage() {
  return <main id="top"><LandingHeader /><section className="hero-section" aria-labelledby="hero-title"><div className="hero-glow" aria-hidden="true" /><div className="page-shell hero-section__content"><div className="hero-copy"><p className="announcement"><span className="announcement__dot" /> Your incident response, now reviewable end to end</p><h1 id="hero-title">Turn production incidents into <em>trusted</em> pull requests.</h1><p className="hero-copy__description">Trace2PR traces signals across your stack, validates a focused fix in an isolated sandbox, and opens a pull request your team can confidently review.</p><div className="hero-actions"><a className="button button--large" href="#get-started">Start tracing incidents <ArrowRight size={18} /></a><a className="watch-link" href="#workflow"><span><Play size={13} fill="currentColor" /></span> See how it works</a></div><div className="hero-proof"><span><CheckCircle2 size={16} /> Human approval stays in the loop</span><span><CheckCircle2 size={16} /> Evidence-first by default</span></div></div><AgentPreview /></div></section><IntegrationSection /><WorkflowSection /><FeatureSection /><section className="final-cta" id="get-started" aria-labelledby="cta-title"><div className="page-shell final-cta__inner"><span className="eyebrow">Make every incident teach your codebase</span><h2 id="cta-title">Less firefighting. More confidence in every fix.</h2><a className="button button--light button--large" href="mailto:hello@trace2pr.dev">Get started with Trace2PR <ArrowRight size={18} /></a></div></section><footer className="site-footer"><div className="page-shell site-footer__inner"><BrandMark compact /><span>© {new Date().getFullYear()} Trace2PR</span><a href="#top">Back to top ↑</a></div></footer></main>
}
