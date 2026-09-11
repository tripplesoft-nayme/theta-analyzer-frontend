interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ColorPicker = ({
  label,
  value,
  onChange,
  className = "",
}: ColorPickerProps) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex-1 text-sm"
        />
      </div>
    </div>
  );
};

export default ColorPicker;
