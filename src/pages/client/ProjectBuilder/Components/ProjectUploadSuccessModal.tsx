import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface ProjectUploadSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sheetCount: number;
}

const ProjectUploadSuccessModal = ({
  open,
  onOpenChange,
  projectId,
  sheetCount,
}: ProjectUploadSuccessModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProgram = location.pathname.includes("/program-builder");
  const basePath = location.pathname.includes("/staff-manager-panel")
    ? "/staff-manager-panel"
    : "/client-panel";
  const handleOpenProject = () => {
    onOpenChange(false);

    if (isProgram) {
      navigate(`${basePath}/all-program/program-overview/${projectId}/program-details`);
    } else {
      navigate(`${basePath}/project-builder/project-details/${projectId}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 p-0 overflow-hidden gap-0 border-none shadow-lg rounded-2xl">
        <div 
          className="relative px-10 py-12 flex flex-col items-center justify-center text-center w-full"
          style={{ animation: "modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <style>{`
            @keyframes modalPop {
              0% { transform: scale(0.95) translateY(10px); opacity: 0; }
              100% { transform: scale(1) translateY(0); opacity: 1; }
            }
          `}</style>

          {/* Icon */}
          <div className="w-16 h-16 bg-[#16A34A] rounded-full flex items-center justify-center mb-6 shadow-md ring-4 ring-green-50 dark:ring-emerald-500/10">
            <Check className="w-8 h-8 text-white stroke-[3]" />
          </div>

          <DialogTitle className="sr-only">Upload Success</DialogTitle>
          <div className="text-[#111827] dark:text-slate-100 font-semibold text-xl mb-2">
            CSV file has been uploaded successfully.
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
            {sheetCount} sheet{sheetCount !== 1 ? "s" : ""} parsed and added to
            the project.
          </p>

          <button
            onClick={handleOpenProject}
            className="text-[#2563EB] dark:text-blue-400 hover:text-[#1D4ED8] dark:hover:text-blue-300 font-medium flex items-center gap-2 transition-colors text-base"
          >
            {isProgram ? "Open Program" : "Open Project"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectUploadSuccessModal;
