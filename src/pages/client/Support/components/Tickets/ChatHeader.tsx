import React from "react";
import { ArrowLeft, X } from "lucide-react";

interface ChatHeaderProps {
  onBack: () => void;
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack, onClose }) => {
  return (
    <header className="h-[93px]  border-b border-gray-200 dark:border-slate-800 px-4 flex items-center justify-between bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="lg:hidden p-2 dark:text-slate-100">
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          A
        </div>
        <div>
          <h3 className="text-sm font-bold dark:text-slate-100">Agent Support</h3>
          <p className="text-[11px] text-emerald-500">Live</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
      >
        <X size={20} />
      </button>
    </header>
  );
};

export default ChatHeader;
