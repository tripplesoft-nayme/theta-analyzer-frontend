import React, { useState, useEffect, useRef } from "react";
import { X, Save } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import { toast } from "sonner";
import { useCreateChartMutation } from "@/store/Api/ChartApi/ChartApi";

interface AddTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (tierName: string) => void;
  parentChartName?: string;
  chartId?: string;
  widgetTitle?: string;
}

const AddTierModal: React.FC<AddTierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  parentChartName,
  chartId,
  widgetTitle,
}) => {
  const { childPayload } = useAppSelector((state) => state.chartSlice);
  const [createChart] = useCreateChartMutation();
  const [tierName, setTierName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  const handleSave = async () => {
    const toastId = toast.loading("Creating Child Tier...");
    try {
      const payload = {
        ...childPayload,
        title: tierName,
        grouptitle: parentChartName,
      };
      const response = await createChart(
        chartId ? { ...payload } : payload,
      ).unwrap();
      if (response.success) {
        toast.success("Child Tier Created Successfully", { id: toastId });
        onClose();
      }
    } catch {
      toast.error("Cannot Create Child Tier", { id: toastId });
    }

    if (tierName.trim()) {
      onSave?.(tierName);
      setTierName("");
    } else {
      toast.error("Please enter a tier name", { id: toastId });
    }
  };

  const handleClose = () => {
    setTierName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 border border-gray-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Add New Tier</h2>
          <button
            onClick={handleClose}
            className="text-red-500 hover:text-red-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="mb-6">
            <label className="block text-base font-medium text-gray-900 dark:text-slate-100 mb-2">
              Parent Chart Name
            </label>
            <p className="text-gray-600 dark:text-slate-400">{widgetTitle}</p>
          </div>

          <div>
            <input
              ref={inputRef}
              type="text"
              placeholder="New Tier name"
              value={tierName}
              onChange={(e) => setTierName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <Save size={18} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTierModal;
