import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
  invertTrendColor?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  delay?: number;
}

export function MetricCard({
  label,
  value,
  trend,
  invertTrendColor = false,
  subtitle,
  icon: Icon,
  delay = 0,
}: MetricCardProps) {
  const isUp = trend === 'up';
  
  let trendColorClass = '';
  if (trend) {
    if (isUp) {
      trendColorClass = invertTrendColor ? 'text-[var(--danger)]' : 'text-[var(--acid)]';
    } else {
      trendColorClass = invertTrendColor ? 'text-[var(--acid)]' : 'text-[var(--danger)]';
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-[var(--surface)] border-[var(--line-strong)] border rounded-xl p-5 flex flex-col gap-3"
    >
      <div className="flex justify-between items-start">
        <div className="w-[36px] h-[36px] rounded-full bg-[color-mix(in_srgb,var(--acid)_8%,transparent)] border border-[color-mix(in_srgb,var(--acid)_20%,transparent)] flex items-center justify-center">
          <Icon className="text-[var(--acid)] w-4 h-4" />
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1', trendColorClass)}>
            {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 mt-2">
        <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div className="text-[28px] font-[700] text-[var(--ink)] leading-none" style={{ fontFamily: 'var(--sans)' }}>
          {value}
        </div>
        {subtitle && (
          <div className="text-[11px] text-[var(--muted)] mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </motion.div>
  );
}
