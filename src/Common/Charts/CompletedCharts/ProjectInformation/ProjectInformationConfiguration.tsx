/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { Field, ALLOWED_PROJECT_KEYS } from "./ProjectInformationConstants";

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`relative ${isOpen ? "z-50" : "z-10"}`}>
      <div
        className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 cursor-pointer flex justify-between items-center overflow-y-auto text-gray-900 dark:text-slate-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-gray-400 dark:text-slate-500 text-xs">▼</span>
      </div>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-0"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-lg max-h-60 flex flex-col overflow-hidden">
            <input
              type="text"
              className="w-full px-2 py-2 text-sm border-b border-border dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none relative z-10 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            <div className="overflow-y-auto relative z-10">
              {options
                .filter((o) =>
                  o.label.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((o) => (
                  <div
                    key={o.value}
                    className={`px-2 py-1.5 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800 ${o.value === value ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-slate-300"}`}
                    onClick={() => {
                      onChange(o.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {o.label}
                  </div>
                ))}
              {options.filter((o) =>
                o.label.toLowerCase().includes(searchTerm.toLowerCase()),
              ).length === 0 && (
                  <div className="px-2 py-2 text-sm text-gray-400 dark:text-slate-500 text-center">
                    No results found
                  </div>
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};



interface ProjectInformationConfigurationProps {
  title: string;
  setTitle: (title: string) => void;
  fields: Field[];
  setFields: React.Dispatch<React.SetStateAction<Field[]>>;
  onSave: () => void;
  onClose: () => void;
  isUpdating?: boolean;
}

const ProjectInformationConfiguration = ({
  title,
  setTitle,
  fields,
  setFields,
  onSave,
  onClose,
  isUpdating = false,
}: ProjectInformationConfigurationProps) => {
  const handleLabelChange = (id: string, newLabel: string) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, label: newLabel } : field,
      ),
    );
  };

  const handleKeyChange = (id: string, newKey: string) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, key: newKey, value: newKey === "CUSTOM" ? field.value || "" : undefined } : field,
      ),
    );
  };

  const toggleManual = (id: string) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, isManual: !field.isManual, key: "" } : field,
      ),
    );
  };

  const addField = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setFields((prev) => [...prev, { id: newId, label: "New Field", key: "", isManual: false }]);
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };


  const availableKeys = [...ALLOWED_PROJECT_KEYS].sort();

  const keyOptions = availableKeys.map((key) => ({
    value: key,
    label: key
      .replace(/^project\./, "")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .toUpperCase(),
  }));

  const activeMissingKeys = fields
    .filter((f) => f.key && !availableKeys.includes(f.key))
    .map((f) => ({
      value: f.key,
      label: `${f.key
        .replace(/^project\./, "")
        .replace(/([A-Z])/g, " $1")
        .trim()
        .toUpperCase()} (Missing)`,
    }));

  const allKeyOptions = [...keyOptions, ...activeMissingKeys];

  return (
    <div className="max-w-78 min-w-78 h-full max-h-full flex flex-col bg-white dark:bg-slate-900 border border-border dark:border-slate-800/50 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Widget Configuration
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 dark:text-slate-500 hover:text-gray-700"
          title="Close Configuration"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="px-4 py-4 space-y-4 flex-1 overflow-y-auto">
        <a href="#" className="text-xs text-blue-600  ">
          Project Information Widget Details
        </a>

        {/* Widget Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-slate-200 mb-1.5 mt-5">
            Widget Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-800 rounded-sm focus:outline-none bg-transparent text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-slate-400">
          Select which project attributes to display and rename their labels.
        </p>

        {/* Fields List */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 mb-3">
            Attributes Mapping
          </h3>

          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative flex flex-col gap-2 p-3 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-md"
                style={{ zIndex: fields.length - index }}
              >
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => removeField(field.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 dark:text-slate-500">Label</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => handleLabelChange(field.id, e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-800 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-500 dark:text-slate-500">
                      {field.isManual ? "Manual Value" : "Data Key"}
                    </label>
                    <button
                      onClick={() => toggleManual(field.id)}
                      className="text-[10px] font-medium text-blue-600 dark:text-blue-400  "
                    >
                      {field.isManual ? "Select From Project" : "Add Custom Value"}
                    </button>
                  </div>
                  {field.isManual ? (
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => handleKeyChange(field.id, e.target.value)}
                      placeholder="Enter value..."
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-slate-800 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600"
                    />
                  ) : (
                    <SearchableSelect
                      value={field.key}
                      onChange={(val) => handleKeyChange(field.id, val)}
                      options={allKeyOptions}
                      placeholder="Select key..."
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={addField}
          className="w-full py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          + Add Field
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-slate-800 shrink-0 mt-auto bg-white dark:bg-slate-900">
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-medium border border-gray-200 dark:border-slate-800 rounded-md text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-slate-100"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {isUpdating ? "Save Changes" : "Save Configuration"}
        </button>
      </div>
    </div>
  );
};

export default ProjectInformationConfiguration;
