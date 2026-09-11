import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DropdownSelect = ({
  placeholderText,
  dropdownItem,
  onChange,
  label,
  value,
}: {
  placeholderText: string;
  dropdownItem: { value: string; title: string }[] | string[];
  onChange: (e: string) => void;
  label?: string;
  value?: string;
}) => {
  return (
    <div className="w-full">
      <Select value={value} onValueChange={onChange}>
        <label className="text-sm font-medium text-secondary-text block mb-1">
          {label}
        </label>
        <SelectTrigger className="w-full border border-border text-primary-text bg-primary-bg rounded-md h-10! transition-all mb-0!">
          <SelectValue placeholder={placeholderText} />
        </SelectTrigger>
        <SelectContent className="border border-border bg-primary-bg rounded-md">
          {dropdownItem.map((item, index) => {
            const value = typeof item === "string" ? item : item.value;
            const title = typeof item === "string" ? item : item.title;
            return (
              <SelectItem
                key={index}
                className="hover:bg-secondary-bg dark:hover:bg-secondary-bg hover:text-primary-text dark:hover:text-primary-text text-primary-text cursor-pointer rounded-sm"
                value={value}
              >
                {title}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DropdownSelect;
