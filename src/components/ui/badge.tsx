import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--acid)] focus:ring-offset-2 focus:ring-offset-[var(--page)] font-mono',
  {
    variants: {
      variant: {
        default: 'border-[var(--acid)]/25 bg-[var(--acid)]/10 text-[var(--acid)]',
        critical: 'border-[var(--danger)]/25 bg-[var(--danger)]/10 text-[var(--danger)]',
        warning: 'border-transparent bg-amber-500/10 text-amber-500',
        success: 'border-transparent bg-[var(--acid)]/15 text-[var(--acid)]',
        info: 'border-transparent bg-[var(--cyan)]/10 text-[var(--cyan)]',
        outline: 'border-[var(--line-strong)] text-[var(--muted-strong)]',
        ghost: 'border-transparent bg-transparent text-[var(--muted)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
