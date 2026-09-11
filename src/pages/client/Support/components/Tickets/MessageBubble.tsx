import React from "react";
import { FileIcon } from "lucide-react";
import { Message } from "./types";
import { useAppSelector } from "@/hooks/useRedux";

interface MessageBubbleProps {
  msg: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg }) => {
  const role = useAppSelector((state) => state.auth.user?.role);
  return (
    <div
      className={`flex ${msg.sender === "CLIENT" && role === "CLIENT" ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-[85%] flex flex-col space-y-1">
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all duration-200 ${
            msg.sender === "CLIENT" && role === "CLIENT"
              ? "bg-linear-to-tr from-blue-600 to-blue-500 text-white rounded-br-none hover:shadow-blue-200/50"
              : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none hover:border-slate-200 dark:hover:border-slate-600"
          }`}
        >
          {msg.fileUrl && (
            <div className="mb-2">
              {msg.fileUrl.startsWith("data:image") ||
              msg.fileUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                <img
                  src={msg.fileUrl}
                  alt="attachment"
                  className="max-w-full rounded-lg max-h-60 object-cover"
                />
              ) : (
                <a
                  href={msg.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-black/5 dark:bg-slate-700/50 rounded-lg hover:bg-black/10 dark:hover:bg-slate-700 transition-colors"
                >
                  <FileIcon size={20} />
                  <span className="truncate max-w-[150px]">
                    View Attachment
                  </span>
                </a>
              )}
            </div>
          )}
          {msg.text}
        </div>
        <span
          className={`text-[10px] text-slate-400 dark:text-slate-500 px-1 ${
            msg.sender === "CLIENT" && role === "CLIENT"
              ? "text-right"
              : "text-left"
          }`}
        >
          {new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
