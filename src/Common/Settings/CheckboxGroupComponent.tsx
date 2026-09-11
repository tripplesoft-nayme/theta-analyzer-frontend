interface CheckboxItem {
  id: string;
  label: string;
  checked: boolean;
}

interface CheckboxGroupProps {
  title: string;
  items: CheckboxItem[];
  onChange: (id: string, checked: boolean) => void;
  className?: string;
}

const CheckboxGroup = ({
  title,
  items,
  onChange,
  className = "",
}: CheckboxGroupProps) => {
  return (
    <div className={`border border-gray-200 dark:border-slate-800 rounded-lg p-6 bg-white dark:bg-slate-900 ${className}`}>
      <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-6">{title}</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => onChange(item.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700 dark:text-slate-300">{item.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;
