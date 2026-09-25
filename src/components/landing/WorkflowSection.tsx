import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Activity, Bot, CheckCircle2, FileSearch, GitPullRequest, LockKeyhole, Send, ShieldCheck, Sparkles } from 'lucide-react'

type OperatingLevel = {
  id: string
  number: string
  label: string
  title: string
  description: string
  tasks: { label: string; owner: 'Trace2PR' | 'You approve' | 'Policy' }[]
  locked?: boolean
}

const levels: OperatingLevel[] = [
  { id: 'manual', number: '01', label: 'Manual', title: 'Your team investigates. Trace2PR keeps the evidence together.', description: 'Start with a shared incident record. Alerts, deploys, logs, and notes stay tied to the work without changing your established response process.', tasks: [{ label: 'Collect incident signals', owner: 'You approve' }, { label: 'Link repository context', owner: 'You approve' }, { label: 'Record the resolution', owner: 'You approve' }] },
  { id: 'assisted', number: '02', label: 'Assisted', title: 'Trace2PR drafts. You approve each step.', description: 'The agent connects the evidence, explains the likely cause, and prepares a focused repair. The judgment and every action remain yours.', tasks: [{ label: 'Correlate the alert and deploy', owner: 'Trace2PR' }, { label: 'Draft root-cause evidence', owner: 'Trace2PR' }, { label: 'Run the proposed repair', owner: 'You approve' }, { label: 'Open the pull request', owner: 'You approve' }] },
  { id: 'supervised', number: '03', label: 'Supervised', title: 'Trace2PR validates in a sandbox. You approve the PR.', description: 'Set clear repository and environment boundaries. Trace2PR can run focused tests and prepare the change while your team controls review and merge.', tasks: [{ label: 'Build a scoped remediation plan', owner: 'Trace2PR' }, { label: 'Run focused regression tests', owner: 'Trace2PR' }, { label: 'Attach validation results', owner: 'Trace2PR' }, { label: 'Review and merge the pull request', owner: 'You approve' }] },
  { id: 'autonomous', number: '04', label: 'Autonomous', title: 'Policy-controlled remediation, bounded by your guardrails.', description: 'Unlock higher autonomy after defining repositories, test gates, and risk policies in your workspace.', tasks: [{ label: 'Apply approved low-risk remediation', owner: 'Policy' }, { label: 'Verify against required checks', owner: 'Policy' }, { label: 'Escalate anything outside policy', owner: 'Policy' }], locked: true },
]

function taskIcon(index: number) {
  return [FileSearch, Sparkles, ShieldCheck, GitPullRequest][index] ?? Activity
}

export function WorkflowSection() {
  const [activeId, setActiveId] = useState('manual')
  const [isRevealed, setIsRevealed] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([])
  const scrollStepsRef = useRef<Array<HTMLDivElement | null>>([])
  const railRef = useRef<HTMLDivElement | null>(null)
  const activeIndex = levels.findIndex((level) => level.id === activeId)
  const active = levels[activeIndex]
  const [progressPosition, setProgressPosition] = useState(0)

  function activate(index: number) {
    setActiveId(levels[index].id)
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const availableIndexes = levels.map((_, itemIndex) => itemIndex)
    const current = availableIndexes.indexOf(index)
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight') nextIndex = availableIndexes[(current + 1) % availableIndexes.length]
    if (event.key === 'ArrowLeft') nextIndex = availableIndexes[(current - 1 + availableIndexes.length) % availableIndexes.length]
    if (event.key === 'Home') nextIndex = availableIndexes[0]
    if (event.key === 'End') nextIndex = availableIndexes[availableIndexes.length - 1]
    if (nextIndex === undefined) return
    event.preventDefault()
    activate(nextIndex)
    tabsRef.current[nextIndex]?.focus()
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const revealObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setIsRevealed(true)
      revealObserver.disconnect()
    }, { threshold: 0.2 })

    const levelObserver = new IntersectionObserver((entries) => {
      const visibleStep = entries.find((entry) => entry.isIntersecting)
      if (!visibleStep) return
      const nextLevel = visibleStep.target.getAttribute('data-level')
      if (nextLevel) setActiveId(nextLevel)
    }, { rootMargin: '-35% 0px -50% 0px', threshold: 0 })

    revealObserver.observe(section)
    scrollStepsRef.current.forEach((step) => step && levelObserver.observe(step))
    return () => {
      revealObserver.disconnect()
      levelObserver.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    function alignProgressThumb() {
      const rail = railRef.current
      const activeDot = tabsRef.current[activeIndex]?.querySelector<HTMLElement>('.workflow-level__dot')
      if (!rail || !activeDot) return

      const railBounds = rail.getBoundingClientRect()
      const dotBounds = activeDot.getBoundingClientRect()
      const nextPosition = ((dotBounds.left + dotBounds.width / 2 - railBounds.left) / railBounds.width) * 100
      setProgressPosition(Math.max(0, Math.min(100, nextPosition)))
    }

    alignProgressThumb()
    const resizeObserver = new ResizeObserver(alignProgressThumb)
    if (railRef.current) resizeObserver.observe(railRef.current)
    tabsRef.current.forEach((tab) => tab && resizeObserver.observe(tab))
    return () => resizeObserver.disconnect()
  }, [activeIndex])

  return (
    <section className="workflow-section section" id="workflow" ref={sectionRef} aria-labelledby="workflow-title">
      <div className="page-shell">
        <div className="workflow-heading"><span className="eyebrow">Choose your operating level</span><h2 id="workflow-title">Move from signals to safe action at your pace.</h2></div>
        <div className="workflow-scroll-experience">
          <div className="workflow-scroll-track" aria-hidden="true">{levels.map((level, index) => <div className="workflow-scroll-step" data-level={level.id} key={level.id} ref={(element) => { scrollStepsRef.current[index] = element }} />)}</div>
          <div className={isRevealed ? 'workflow-explorer workflow-explorer--revealed' : 'workflow-explorer'}>
          <div className="workflow-levels" role="tablist" aria-label="Trace2PR operating levels">
            {levels.map((level, index) => <button key={level.id} ref={(element) => { tabsRef.current[index] = element }} className={level.id === active.id ? 'workflow-level workflow-level--active' : level.locked ? 'workflow-level workflow-level--locked' : 'workflow-level'} type="button" role="tab" id={'workflow-tab-' + level.id} aria-controls="workflow-panel" aria-selected={level.id === active.id} tabIndex={level.id === active.id ? 0 : -1} onClick={() => activate(index)} onKeyDown={(event) => onTabKeyDown(event, index)}><span className="workflow-level__dot" aria-hidden="true" /><span>{level.label}</span></button>)}
          </div>
          <div className="workflow-rail" ref={railRef} role="progressbar" aria-label="Selected operating level" aria-valuemin={1} aria-valuemax={4} aria-valuenow={activeIndex + 1}><span className="workflow-rail__fill" style={{ width: progressPosition + '%' }} /><span className="workflow-rail__thumb" style={{ left: progressPosition + '%' }} /></div>
          <p className="workflow-level-caption">{active.locked ? 'Autonomous remediation requires your workspace policy setup.' : 'Scroll to explore each level, or select one to see where Trace2PR acts and where your team decides.'}</p>
          <div className="workflow-panel" id="workflow-panel" role="tabpanel" aria-labelledby={'workflow-tab-' + active.id} key={active.id}>
            <div className="workflow-panel__copy"><span className="eyebrow">Level {active.number} · {active.label}</span><h3>{active.title}</h3><p>{active.description}</p><span className="workflow-control-note"><LockKeyhole size={15} /> Controls stay visible at every level</span></div>
            <div className="workflow-task-card"><div className="workflow-task-card__header"><span><span className="live-dot" /> Incident #INC-2048</span><small>{active.label} mode</small></div>{active.tasks.map((task, index) => { const Icon = taskIcon(index); return <div className="workflow-task" key={task.label}><span className="workflow-task__icon"><Icon size={17} /></span><strong>{task.label}</strong><span className={task.owner === 'Trace2PR' ? 'task-owner task-owner--agent' : 'task-owner'}>{task.owner === 'Trace2PR' ? <Bot size={12} /> : task.owner === 'Policy' ? <ShieldCheck size={12} /> : <CheckCircle2 size={12} />}{task.owner}</span></div> })}{active.locked && <div className="workflow-task-card__lock"><LockKeyhole size={14} /> Available after policy setup</div>}{!active.locked && <button className="workflow-task-card__action" type="button">View approval boundaries <Send size={14} /></button>}</div>
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}
