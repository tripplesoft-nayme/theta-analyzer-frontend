interface APIConnectionProps {
  name: string;
  status: string;
  lastSynced: string;
  icon: string;
  className?: string;
}

const APIConnectionCard = ({
  name,
  status,
  lastSynced,
  icon,
  className = "",
}: APIConnectionProps) => {
  return (
    <div
      className={`flex flex-col p-4.5 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <img src={icon} alt={`${name} icon`} />
        <span className="text-base font-medium text-gray-900 dark:text-slate-100">{name}</span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded ml-auto ${status === "Connected"
              ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-500/10"
              : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/10"
            }`}
        >
          {status}
        </span>
      </div>
      <span className="text-[14px] text-gray-500 dark:text-slate-500 mt-3">
        Last Synced: {lastSynced}
      </span>
    </div>
  );
};

export default APIConnectionCard;
