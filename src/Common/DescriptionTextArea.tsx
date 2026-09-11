/* eslint-disable @typescript-eslint/no-explicit-any */
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Smile } from "lucide-react";

interface DescriptionTextAreaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  handleAttachment?: (data?: any) => void;
  handleEmoji?: (data?: any) => void;
}

const DescriptionTextArea = ({
  value,
  onChange,
  placeholder = "Write your message here",
  className = "",
  handleAttachment,
  handleEmoji,
}: DescriptionTextAreaProps) => {
  return (
    <div className="">
      <div className="relative">
        <Textarea
          id="description"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`border border-[#CBD5E1] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 min-h-30 p-2 ${className}`}
        />
        <div className="flex absolute bottom-2 right-5 text-[#475569] dark:text-slate-400 gap-2">
          {handleAttachment && (
            <Paperclip
              onClick={() => handleAttachment()}
              className="size-4 cursor-pointer hover:text-blue-500 transition-colors"
            />
          )}
          {handleEmoji && (
            <Smile
              onClick={() => handleEmoji()}
              className="size-4 cursor-pointer hover:text-blue-500 transition-colors"
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default DescriptionTextArea;
