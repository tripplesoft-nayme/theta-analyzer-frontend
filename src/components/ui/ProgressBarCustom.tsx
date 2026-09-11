import { cn } from "@/lib/utils"

type ProgressBarProps = {
  value: number // percentage 0–100
  className?: string
  showLabel?: boolean // whether to show "33%"
  color?: string // tailwind color like "bg-blue-500"
}

export function ProgressBar({
  value,
  className,
  color = "bg-blue-500",
}: ProgressBarProps) {
  const safeValue = Math.min(Math.max(value, 0), 100) // clamp 0–100

  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2 overflow-hidden", className)}>
      <div
        className={cn("h-2 transition-all duration-500 ease-in-out", color)}
        style={{ width: `${safeValue}%` }}
      >
      </div>
    </div>
  )
}
