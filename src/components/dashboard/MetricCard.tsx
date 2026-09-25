import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}

export function MetricCard({ title, value, subtitle, trend, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
          {title}
        </CardTitle>
        {icon && <div className="text-[var(--text-secondary)]">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <span className={`flex items-center text-xs font-medium ${
              trend === 'up' ? 'text-[var(--status-success)]' : 
              trend === 'down' ? 'text-[var(--status-critical)]' : 
              'text-[var(--text-secondary)]'
            }`}>
              {trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1" />}
              {trend === 'down' && <ArrowDownRight className="h-3 w-3 mr-1" />}
              {trend === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  )
}
