const ChatSkeleton = () => (
  <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
      >
        <div className="flex flex-col space-y-2 max-w-[70%]">
          <div
            className={`h-10 w-48 rounded-2xl ${
              i % 2 === 0
                ? "bg-blue-100 rounded-br-none"
                : "bg-slate-100 rounded-bl-none"
            }`}
          ></div>
          <div
            className={`h-3 w-20 rounded ${
              i % 2 === 0 ? "self-end bg-blue-50" : "bg-slate-50"
            }`}
          ></div>
        </div>
      </div>
    ))}
  </div>
);

export default ChatSkeleton;
