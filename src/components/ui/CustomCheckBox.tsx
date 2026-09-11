import { cn } from "@/lib/utils"

interface CustomSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function CustomCheckBox({ checked, onChange }: CustomSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-12 items-center rounded-full transition-colors",
        checked ? "bg-emerald-500" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  )
}
