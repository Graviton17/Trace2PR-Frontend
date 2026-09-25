import { motion } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

export interface BadgeProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default:
      "border-transparent bg-[var(--accent-primary)] text-white shadow hover:bg-[var(--accent-primary)]/80",
    secondary:
      "border-transparent bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/80",
    destructive:
      "border-transparent bg-[var(--status-critical)]/10 text-[var(--status-critical)] hover:bg-[var(--status-critical)]/20",
    outline: "text-[var(--text-primary)]",
    success:
      "border-transparent bg-[var(--status-success)]/10 text-[var(--status-success)] hover:bg-[var(--status-success)]/20",
    warning:
      "border-transparent bg-[var(--status-warning)]/10 text-[var(--status-warning)] hover:bg-[var(--status-warning)]/20",
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
