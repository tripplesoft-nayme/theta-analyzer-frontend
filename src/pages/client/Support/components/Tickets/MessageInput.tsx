import React from "react";
import { Send, Paperclip, FileIcon, X } from "lucide-react";

interface MessageInputProps {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: (e: React.FormEvent) => void;
  filePreview: string | null;
  selectedFile: File | null;
  onRemoveFile: () => void;
  onFileClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputValue,
  onInputChange,
  onSendMessage,
  filePreview,
  selectedFile,
  onRemoveFile,
  onFileClick,
  fileInputRef,
  onFileChange,
}) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      {filePreview && (
        <div className="mb-3 flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="relative w-12 h-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
            {filePreview === "file" ? (
              <FileIcon className="text-blue-500" />
            ) : (
              <img src={filePreview} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
              {selectedFile?.name}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={onRemoveFile}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <form onSubmit={onSendMessage} className="relative group">
        <div className="absolute left-2 top-2 z-10">
          <button
            type="button"
            onClick={onFileClick}
            className="p-2.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
          >
            <Paperclip size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={onFileChange}
          />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          placeholder="Type your message..."
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl pl-12 pr-14 py-3.5 text-sm dark:text-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none shadow-inner"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() && !selectedFile}
          className="absolute right-2 top-1.5 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
