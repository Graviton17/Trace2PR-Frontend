import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-[var(--line)]",
          className
        )}
        {...props}
      >
        <motion.div
          className="h-full bg-[var(--acid)] relative"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{
            boxShadow: percentage > 0 ? "0 0 10px 2px rgba(185,255,99,0.5)" : "none"
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
