import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md font-sans font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--acid)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--acid)] text-[#091006] shadow hover:shadow-[0_0_12px_var(--acid)]',
        secondary: 'bg-[var(--surface-raised)] text-[var(--ink)] border border-[var(--line-strong)] hover:bg-[var(--surface-raised)]/80',
        ghost: 'bg-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)]/50',
        destructive: 'bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)]/20',
        outline: 'border border-[var(--line-strong)] bg-transparent text-[var(--muted-strong)] hover:bg-[var(--surface-raised)]/50',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
