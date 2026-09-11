const ClientWorkInProgress = ({ message }: { message?: string }) => {
  return (
    <h1 className="w-[80vw] h-[70vh] flex items-center justify-center text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-bold text-gray-100 dark:text-slate-800 uppercase animate-pulse">
      {message || "Work In Progress"}
    </h1>
  );
};

export default ClientWorkInProgress;
