import React from "react";
import { Send } from "lucide-react";
import { Message } from "./types";
import MessageBubble from "./MessageBubble";
import ChatSkeleton from "./ChatSkeleton";

interface MessageListProps {
  messages: Message[];
  isChatLoading: boolean;
  isFetchingMessages: boolean;
  isTyping: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isChatLoading,
  isFetchingMessages,
  isTyping,
  chatEndRef,
}) => {
  if (isChatLoading || isFetchingMessages) {
    return <ChatSkeleton />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 dark:bg-slate-900">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <Send
              size={24}
              className="opacity-20 translate-x-0.5 -translate-y-0.5"
            />
          </div>
          <p className="text-sm font-medium">No messages yet. Say hi!</p>
        </div>
      ) : (
        messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
      )}

      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
};

export default MessageList;
