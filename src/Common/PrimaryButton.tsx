import { ReactNode, MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface ButtonProps {
  title?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  type?: string;
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
  tooltip?: string;
  ariaLabel?: string;
}

const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  leftIcon,
  rightIcon,
  onClick,
  type,
  className = "",
  disabled = false,
  children,
  tooltip,
  ariaLabel,
}) => {
  const resolvedAriaLabel = ariaLabel || tooltip || title || (typeof children === "string" ? children : undefined);
  const buttonEl = (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      aria-label={resolvedAriaLabel}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-3 font-medium tracking-wide capitalize transition-colors duration-300 transform rounded-lg focus:outline-none text-sm",
        disabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800"
          : type === "Primary"
            ? "bg-btn-primary-gradient border border-[var(--brand-primary,#4881FF)] text-white hover:text-[var(--brand-primary,#4881FF)] cursor-pointer dark:border-[var(--brand-primary,#4881FF)] dark:hover:text-[var(--brand-primary,#4881FF)]"
            : type === "Outline"
              ? "border border-[#C8CFD9] bg-white hover:border-[var(--brand-primary,#4881FF)] hover:text-[var(--brand-primary,#4881FF)] cursor-pointer dark:bg-slate-900 dark:hover:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-[var(--brand-primary,#4881FF)] dark:hover:text-[var(--brand-primary,#4881FF)]"
              : "text-[var(--brand-primary,#4881FF)] text-base hover:bg-blue-50/20 cursor-pointer dark:text-[var(--brand-primary,#4881FF)] dark:hover:bg-blue-900/20",
        className
      )}
    >
      {leftIcon && <span className="flex items-center">{leftIcon}</span>}
      {title && <span>{title}</span>}
      {children}
      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonEl}
        </TooltipTrigger>
        <TooltipContent className="">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonEl;
};

export default PrimaryButton;
