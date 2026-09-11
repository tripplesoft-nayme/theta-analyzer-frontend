import { Spinner } from "@/components/ui/spinner";

interface IFullScreenMessageProps {
  type: "loading" | "message";
  message?: string;
  className?: string;
}

export default function FullScreenMessage({
  type,
  message,
  className,
}: IFullScreenMessageProps) {
  if (type === "loading") {
    return (
      <div className="w-[80vw] h-[80vh] flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (type === "message") {
    return (
      <h2
        className={`w-[80vw] h-[80vh] flex items-center justify-center text-5xl font-semibold uppercase ${className}`}
      >
        {message}
      </h2>
    );
  }
}
