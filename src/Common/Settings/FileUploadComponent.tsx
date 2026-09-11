import { useRef } from "react";
import PrimaryButton from "../PrimaryButton";
import { Upload } from "lucide-react";

interface FileUploadProps {
  label: string;
  description: string;
  requirements: string;
  buttonText: string;
  className?: string;
  onFileUpload?: (file: File) => void;
  previewUrl?: string;
}

const FileUpload = ({
  label,
  description,
  requirements,
  buttonText,
  className = "",
  onFileUpload,
  previewUrl,
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">
        {label}
      </label>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <div
        onClick={handleClick}
        className="border-2 border-dashed border-gray-300 dark:border-slate-800 rounded-lg p-6 text-center grid items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors relative overflow-hidden group min-h-[170px]"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        {previewUrl ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <img
              src={previewUrl}
              alt={label}
              className="max-h-16 max-w-full object-contain mb-2 rounded"
            />
            <p className="text-[10px] text-gray-400 group-hover:text-blue-500 transition-colors">
              Click to replace file
            </p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-600 dark:text-slate-300 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mb-3">{requirements}</p>
          </>
        )}
        <div className="mt-2 flex justify-center">
          <PrimaryButton
            type="Primary"
            title={buttonText}
            className="text-xs px-4! py-2! pointer-events-none rounded-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
