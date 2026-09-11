import React, { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}
const BoxContainer: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={`border border-[#E2E8F0] dark:border-slate-800 bg-[#FFF] dark:bg-slate-900 rounded-lg p-6 w-full ${className}`}>
      {children}
    </div>
  );
};

export default BoxContainer;
