import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const STEPS = ['Ingested', 'Analysis', 'Fixing', 'Testing', 'PR'];

const DUMMY_OPERATIONS = [
  {
    id: 'INC-492',
    title: 'High latency in Checkout API',
    severity: 'critical',
    service: 'checkout-service',
    env: 'production',
    currentStepIndex: 2, // 0-based, so "Fixing" is active
    elapsed: '14m 22s',
    agentThoughts: [
      { text: 'Identified bottleneck in', code: 'calculateTaxes()' },
      { text: 'Generating optimized database query for', code: 'TaxRates' }
    ]
  }
];

export function ActiveOperations() {
  if (DUMMY_OPERATIONS.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--muted)] gap-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-xl p-8">
        <CheckCircle2 className="w-5 h-5" />
        <span style={{ fontFamily: 'var(--sans)' }}>All clear — no active operations</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {DUMMY_OPERATIONS.map((op, idx) => (
        <motion.div
          key={op.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className="bg-[var(--surface)] border border-[var(--line-strong)] rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden"
          style={{ boxShadow: '0 0 20px color-mix(in_srgb, var(--acid) 5%, transparent)' }}
        >
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              {op.severity === 'critical' && (
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--danger)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--danger)]"></span>
                </div>
              )}
              <h3 className="text-[var(--ink)] text-[16px] font-[600]" style={{ fontFamily: 'var(--sans)' }}>
                {op.title}
              </h3>
              <span className={cn(
                "text-[10px] uppercase px-2 py-0.5 rounded-full border tracking-wider",
                op.severity === 'critical' ? 'text-[var(--danger)] border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]' : 'text-[var(--acid)] border-[var(--line)] bg-[var(--surface-raised)]'
              )} style={{ fontFamily: 'var(--sans)' }}>
                {op.severity}
              </span>
            </div>
            <div className="text-[var(--muted)] text-[12px] flex gap-2 items-center" style={{ fontFamily: 'var(--mono)' }}>
              <span>{op.id}</span>
              <span className="text-[var(--line-strong)]">•</span>
              <span>{op.service}</span>
              <span className="text-[var(--line-strong)]">•</span>
              <span>{op.env}</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="relative py-2">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[1px] bg-[var(--line)] z-0"></div>
            <motion.div 
              className="absolute top-1/2 -translate-y-1/2 left-0 h-[1px] bg-[var(--acid)] z-0"
              initial={{ width: 0 }}
              animate={{ width: `${(op.currentStepIndex / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
            
            <div className="flex justify-between items-center relative z-10">
              {STEPS.map((step, stepIdx) => {
                const isCompleted = stepIdx < op.currentStepIndex;
                const isActive = stepIdx === op.currentStepIndex;
                const isFuture = stepIdx > op.currentStepIndex;
                
                return (
                  <div key={step} className="flex flex-col items-center gap-2 bg-[var(--surface)] px-2">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-[color-mix(in_srgb,var(--acid)_20%,transparent)] border border-[var(--acid)] flex items-center justify-center">
                        <Check className="w-3 h-3 text-[var(--acid)]" />
                      </div>
                    ) : isActive ? (
                      <div className="relative flex h-5 w-5 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-[var(--acid)] opacity-40"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--acid)]" style={{ boxShadow: '0 0 8px var(--acid)' }}></span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[var(--surface-raised)] border border-[var(--line-strong)] flex items-center justify-center">
                        <Circle className="w-2 h-2 text-[var(--muted)] fill-[var(--muted)] opacity-50" />
                      </div>
                    )}
                    <span className={cn(
                      "text-[11px]",
                      isCompleted ? "text-[var(--ink)]" : isActive ? "text-[var(--acid)] drop-shadow-[0_0_8px_var(--acid)]" : "text-[color-mix(in_srgb,var(--muted)_50%,transparent)]"
                    )} style={{ fontFamily: 'var(--sans)' }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-[var(--line)] w-full rounded-full overflow-hidden relative">
             <motion.div 
               className="absolute top-0 left-0 bottom-0 rounded-full"
               style={{ background: 'linear-gradient(90deg, var(--acid) 0%, #dcfc9f 100%)', boxShadow: '2px 0 10px var(--acid)' }}
               initial={{ width: 0 }}
               animate={{ width: `${(op.currentStepIndex / (STEPS.length - 1)) * 100 + 10}%` }}
               transition={{ duration: 1.5, delay: 0.5 }}
             />
          </div>

          {/* Agent Thoughts Terminal */}
          <div className="bg-[#080e0b] border border-[var(--line)] rounded-lg p-3 flex flex-col gap-2 relative">
            <div className="flex justify-between items-center">
              <span className="text-[var(--acid)] text-[9px] uppercase tracking-wider" style={{ fontFamily: 'var(--mono)' }}>AGENT THOUGHTS</span>
              <span className="text-[var(--muted)] text-[10px]" style={{ fontFamily: 'var(--mono)' }}>2s ago</span>
            </div>
            <div className="text-[var(--muted-strong)] text-[12px] leading-relaxed" style={{ fontFamily: 'var(--mono)' }}>
              {op.agentThoughts.map((thought, i) => (
                <div key={i} className="flex gap-2 mb-1">
                  <span className="text-[var(--acid)] opacity-50">{'>'}</span>
                  <span>
                    {thought.text}{' '}
                    <code className="bg-[color-mix(in_srgb,var(--acid)_10%,transparent)] text-[var(--acid)] px-1 rounded">{thought.code}</code>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-2 border-t border-[var(--line)] pt-4">
            <div className="flex gap-4">
              <button className="text-[var(--muted)] hover:text-[var(--acid)] text-[12px] flex items-center gap-1 transition-colors" style={{ fontFamily: 'var(--sans)' }}>
                View Incident <ArrowRight className="w-3 h-3" />
              </button>
              <button className="text-[var(--muted)] hover:text-[var(--acid)] text-[12px] flex items-center gap-1 transition-colors" style={{ fontFamily: 'var(--sans)' }}>
                View Sandbox <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="text-[var(--muted)] text-[12px]" style={{ fontFamily: 'var(--mono)' }}>
              {op.elapsed}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
