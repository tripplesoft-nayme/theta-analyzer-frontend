import { Input } from "@/components/ui/input";
import { Search, Command } from "lucide-react";

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  className,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  className?: string;
}) {
  const hasWidth = className?.split(" ").some((c) => c.startsWith("w-") || c.includes("w-"));
  const widthClass = hasWidth ? "" : "w-full xl:w-[300px] 2xl:w-[450px]";

  return (
    <div className={`relative flex items-center ${widthClass} ${className}`}>
      <Search className="absolute left-4 text-secondary-text h-5 w-5 pointer-events-none" />
      <Input
        id="global-search"
        placeholder="Search anything here..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-12 pl-12 pr-14 w-full bg-primary-bg border border-border rounded-md text-[15px] placeholder:text-secondary-text focus-visible:ring-1 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-all text-primary-text"
      />
      <div className="absolute right-3 p-1.5 flex items-center justify-center bg-primary border border-border rounded-md shadow-[0_2px_4px_rgba(0,0,0,0.05)] pointer-events-none">
        <Command className="h-4 w-4 text-white" />
      </div>
    </div>
  );
}
