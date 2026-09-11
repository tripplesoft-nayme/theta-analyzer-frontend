interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

const ToggleSwitch = ({
  label,
  enabled,
  onChange,
  className = "",
}: ToggleSwitchProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-600"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-4" : "translate-x-0.5"
            }`}
        />
      </button>
      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
        {label}
      </span>
    </div>
  );
};

export default ToggleSwitch;
