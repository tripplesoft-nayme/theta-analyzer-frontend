/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAppSelector } from "@/hooks/useRedux";
import { useGetProjectByIdQuery } from "@/store/Api/ProjectApi/ProjectApi";
import { toast } from "sonner";
import ProjectInformation from "./ProjectInformation";
import ProjectInformationConfiguration from "./ProjectInformationConfiguration";
import {
  useGetProjectInformationTableQuery,
  useCreateProjectInformationTableMutation,
  useUpdateProjectInformationTableMutation,
  useDeleteProjectInformationTableMutation,
} from "@/store/Api/ChartApi/ChartApi";
import ChartCardWrapper from "../Common/ChartCardWrapper";

import { Field, ALLOWED_PROJECT_KEYS } from "./ProjectInformationConstants";

interface ProjectInformationModuleProps {
  onDelete?: () => void;
  onSaveSuccess?: () => void;
  isPreview?: boolean;
  projectId?: string;
  height?: number;
  className?: string;
  onFieldsChange?: (fieldsCount: number) => void;
}

const DEFAULT_FIELDS: Field[] = [
  { id: "1", label: "Project Name", key: "name" },
  { id: "2", label: "Start Date", key: "startDate" },
  { id: "3", label: "Contract Duration", key: "contractDuration" },
  { id: "4", label: "Completion Date", key: "deadline" },
  { id: "5", label: "Contract Value", key: "budget" },
  { id: "6", label: "Progress", key: "progress" },
];

const DEFAULT_TITLE = "Project Information";


const ProjectInformationModule = ({
  onDelete,
  onSaveSuccess,
  isPreview = false,
  projectId: projectIdProp,
  height,
  className,
  onFieldsChange,
}: ProjectInformationModuleProps) => {
  const { projectId: storeProjectId } = useAppSelector(
    (state) => state.chartSlice,
  );
  // Derive projectId from prop or store
  const projectId = useMemo(
    () => (projectIdProp !== undefined ? projectIdProp : storeProjectId),
    [projectIdProp, storeProjectId],
  );

  // State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [fields, setFields] = useState<Field[]>(DEFAULT_FIELDS);

  useEffect(() => {
    if (isConfigOpen) {
      onFieldsChange?.(fields.length);
    } else {
      onFieldsChange?.(null as any);
    }
  }, [fields, isConfigOpen, onFieldsChange]);

  // API Hooks
  const { data: projectResponse, isLoading: isProjectLoading } =
    useGetProjectByIdQuery(projectId as string, {
      skip: !projectId,
    });

  const {
    data: tableConfigRes,
    isLoading: isConfigLoading,
    isFetching: isConfigFetching,
    refetch: refetchTableConfig,
  } = useGetProjectInformationTableQuery(projectId as string, {
    skip: !projectId,
  });

  const [createTable] = useCreateProjectInformationTableMutation();
  const [updateTable] = useUpdateProjectInformationTableMutation();
  const [deleteTable] = useDeleteProjectInformationTableMutation();

  const isConfigured = useMemo(() => {
    const data = tableConfigRes?.data;
    return Array.isArray(data) ? data.length > 0 : !!data;
  }, [tableConfigRes]);

  const existingConfig = useMemo(() => {
    if (!tableConfigRes?.data) return null;
    const resValue = tableConfigRes.data;

    // Handle nested array in .data field or direct array
    if (
      resValue &&
      typeof resValue === "object" &&
      "data" in resValue &&
      Array.isArray((resValue as any).data)
    ) {
      return (resValue as any).data;
    }
    return resValue;
  }, [tableConfigRes]);

  const projectData = useMemo(() => {
    let dataObj: any = {};
    if (!projectId || !projectResponse) return dataObj;

    let current = projectResponse;
    // Normalize project response structure
    if (
      current &&
      typeof current === "object" &&
      !current.name &&
      current.data
    ) {
      current = current.data;
    }

    if (current && current.data && Array.isArray(current.data)) {
      dataObj = { ...(current.data[0] || {}) };
    } else if (Array.isArray(current)) {
      dataObj = { ...(current[0] || {}) };
    } else {
      dataObj = { ...(current?.project || current || {}) };
    }

    // Merge manual values from existing configuration
    if (Array.isArray(existingConfig)) {
      existingConfig.forEach((field: any) => {
        if (field.key && field.value !== undefined && field.value !== null) {
          dataObj[field.key] = field.value;
        }
      });
    }

    return dataObj;
  }, [projectResponse, existingConfig, projectId]);

  const isLoading = isProjectLoading || isConfigLoading || isConfigFetching;

  // Sync state with API configuration
  useEffect(() => {
    if (!projectId) return;

    const data = tableConfigRes?.data as any;
    if (data && (!Array.isArray(data) || data.length > 0)) {
      if (data.title) setTitle(data.title);

      if (Array.isArray(existingConfig)) {
        setFields(existingConfig.map((f: any) => ({
          ...f,
          isManual: f.isManual ?? (!ALLOWED_PROJECT_KEYS.includes(f.key) && f.key !== "")
        })));
      } else if (existingConfig?.columns) {
        setFields(existingConfig.columns.map((f: any) => ({
          ...f,
          isManual: f.isManual ?? (!ALLOWED_PROJECT_KEYS.includes(f.key) && f.key !== "")
        })));
      }
    } else {
      // Reset to defaults if no configuration exists
      setTitle(DEFAULT_TITLE);
      setFields(DEFAULT_FIELDS);
    }
  }, [existingConfig, tableConfigRes, projectId]);

  const handleSave = useCallback(async () => {
    if (!projectId) {
      toast.error("Project ID is missing. Cannot save configuration.");
      return;
    }

    try {
      const payload = {
        title,
        columns: fields.map((f) => ({
          id: f.id,
          label: f.label,
          key: f.key,
        })),
        projectId,
      };

      if (isConfigured) {
        await updateTable({ id: projectId, data: payload }).unwrap();
        toast.success("Configuration updated successfully!");
      } else {
        await createTable(payload).unwrap();
        toast.success("Configuration created successfully!");
      }
      setIsConfigOpen(false);
      onSaveSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save configuration");
    }
  }, [
    projectId,
    title,
    fields,
    isConfigured,
    updateTable,
    createTable,
    onSaveSuccess,
  ]);

  const handleDelete = useCallback(async () => {
    if (isConfigured) {
      try {
        await deleteTable(projectId).unwrap();
        toast.success("Table deleted successfully!");
        onDelete?.();
        refetchTableConfig();
      } catch {
        onDelete?.();
        // toast.error(error?.data?.message || "Failed to delete table");
      }
    } else {
      onDelete?.();
    }
  }, [isConfigured, deleteTable, projectId, onDelete, refetchTableConfig]);

  const leftContainerHeight = useMemo(() => {
    if (!isPreview && isConfigOpen) return "fit-content";
    return height ? `${height}px` : "100%";
  }, [isPreview, isConfigOpen, height]);

  const leftCardClass = useMemo(() => {
    if (!isPreview && isConfigOpen) return `h-fit border-0 ${className}`;
    return `h-full border-0 ${className}`;
  }, [isPreview, isConfigOpen, className]);

  return (
    <div className="flex gap-3 h-full w-full min-h-0">
      <div
        className="flex-1 min-w-0 sticky top-5"
        style={{ height: leftContainerHeight }}
      >
        <ChartCardWrapper
          title={title}
          isPreview={isPreview}
          menuActions={{
            onDelete: handleDelete,
            onToggleWidget: () => setIsConfigOpen((prev) => !prev),
          }}
          className={leftCardClass}
        >
          <div className="w-full h-fit">
            <ProjectInformation
              projectData={projectData}
              fields={fields}
              isLoading={isLoading}
            />
          </div>
        </ChartCardWrapper>
      </div>

      {!isPreview && isConfigOpen && (
        <ProjectInformationConfiguration
          title={title}
          setTitle={setTitle}
          fields={fields}
          setFields={setFields}
          onSave={handleSave}
          onClose={() => setIsConfigOpen(false)}
          isUpdating={isConfigured}
        />
      )}
    </div>
  );
};

export default ProjectInformationModule;
