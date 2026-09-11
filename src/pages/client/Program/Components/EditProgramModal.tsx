import React, { useState, useEffect, useMemo } from "react";
import { IProgram } from "@/types";
import {
  useGetAllViewersQuery,
  useGetAllManagersQuery,
  useGetManagerByIdQuery,
} from "@/store/Api/UserApi/UserApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X, Check, Users, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";

interface EditProgramModalProps {
  open: boolean;
  program: IProgram;
  onClose: () => void;
  onSave: (updatedData: Partial<IProgram>) => void;
}

const EditProgramModal: React.FC<EditProgramModalProps> = ({
  open,
  program,
  onClose,
  onSave,
}) => {
  const [programName, setProgramName] = useState(program.programName);

  // ── Open States for Popovers ──────────────────────────────────────────────
  const [isManagerPopoverOpen, setIsManagerPopoverOpen] = useState(false);
  const [isViewerPopoverOpen, setIsViewerPopoverOpen] = useState(false);

  // ── Managers States ────────────────────────────────────────────────────────
  const [managerSearchInput, setManagerSearchInput] = useState("");
  const debouncedManagerSearch = useDebounce(managerSearchInput, 300);
  const [managerPage, setManagerPage] = useState(1);
  const [managersList, setManagersList] = useState<any[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>(program.managerId || "");

  // ── Viewers States ─────────────────────────────────────────────────────────
  const [viewerSearchInput, setViewerSearchInput] = useState("");
  const debouncedViewerSearch = useDebounce(viewerSearchInput, 300);
  const [viewerPage, setViewerPage] = useState(1);
  const [viewersList, setViewersList] = useState<any[]>([]);
  const [selectedViewerIds, setSelectedViewerIds] = useState<string[]>(program.viewerIds || []);

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: managersData, isFetching: isFetchingManagers } = useGetAllManagersQuery({
    page: managerPage,
    limit: 10,
    search: debouncedManagerSearch,
  });

  const { data: viewersData, isFetching: isFetchingViewers } = useGetAllViewersQuery({
    page: viewerPage,
    limit: 5,
    search: debouncedViewerSearch,
  });

  // Query currently selected manager details if not in managersList
  const { data: currentManagerData } = useGetManagerByIdQuery(selectedManagerId, {
    skip: !selectedManagerId,
  });
  const currentManager = currentManagerData?.data;

  // ── Reset pagination & lists when search term changes ────────────────────
  useEffect(() => {
    setManagersList([]);
    setManagerPage(1);
  }, [debouncedManagerSearch]);

  useEffect(() => {
    setViewersList([]);
    setViewerPage(1);
  }, [debouncedViewerSearch]);

  // ── Append results when page/search data arrives ─────────────────────────
  useEffect(() => {
    const newManagers = managersData?.data?.data || [];
    if (newManagers.length > 0) {
      setManagersList((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const uniqueNew = newManagers.filter((m: any) => !existingIds.has(m.id));
        return [...prev, ...uniqueNew];
      });
    }
  }, [managersData]);

  useEffect(() => {
    const newViewers = viewersData?.data?.data || [];
    if (newViewers.length > 0) {
      setViewersList((prev) => {
        const existingIds = new Set(prev.map((v) => v.user.id));
        const uniqueNew = newViewers.filter((v: any) => !existingIds.has(v.user.id));
        return [...prev, ...uniqueNew];
      });
    }
  }, [viewersData]);

  // ── Reset settings on modal open ─────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setProgramName(program.programName);
      setSelectedViewerIds(program.viewerIds || []);
      setSelectedManagerId(program.managerId || "");
      setManagerSearchInput("");
      setViewerSearchInput("");
      setIsManagerPopoverOpen(false);
      setIsViewerPopoverOpen(false);
    }
  }, [program, open]);

  // ── Helper to resolve selected details ───────────────────────────────────
  const selectedManagerDetail = useMemo(() => {
    if (currentManager && currentManager.id === selectedManagerId) {
      return currentManager;
    }
    return managersList.find((m: any) => m.id === selectedManagerId);
  }, [currentManager, managersList, selectedManagerId]);

  const selectedViewersDetails = useMemo(() => {
    const detailsMap = new Map<string, any>();
    if (Array.isArray(program.programViewers)) {
      program.programViewers.forEach((pv: any) => {
        if (pv.viewer?.user) {
          detailsMap.set(pv.viewer.user.id, pv.viewer);
        }
      });
    }
    viewersList.forEach((v: any) => {
      if (v.user?.id) {
        detailsMap.set(v.user.id, v);
      }
    });
    return selectedViewerIds
      .map((id) => detailsMap.get(id))
      .filter((v) => !!v);
  }, [program.programViewers, viewersList, selectedViewerIds]);

  // ── Pagination logic ─────────────────────────────────────────────────────
  const hasMoreManagers = useMemo(() => {
    const metaTotal = managersData?.data?.meta?.total;
    const currentLen = managersList.length;
    const lastPageLen = managersData?.data?.data?.length || 0;
    if (metaTotal !== undefined) return currentLen < metaTotal;
    return lastPageLen === 10;
  }, [managersData, managersList]);

  const hasMoreViewers = useMemo(() => {
    const metaTotal = viewersData?.data?.meta?.total;
    const currentLen = viewersList.length;
    const lastPageLen = viewersData?.data?.data?.length || 0;
    if (metaTotal !== undefined) return currentLen < metaTotal;
    return lastPageLen === 5;
  }, [viewersData, viewersList]);

  const handleLoadMoreManagers = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isFetchingManagers && hasMoreManagers) {
      setManagerPage((prev) => prev + 1);
    }
  };

  const handleLoadMoreViewers = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isFetchingViewers && hasMoreViewers) {
      setViewerPage((prev) => prev + 1);
    }
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const toggleViewer = (id: string) => {
    setSelectedViewerIds((prev) =>
      prev.includes(id) ? prev.filter((vId) => vId !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave({
      programName,
      managerId: selectedManagerId,
      viewerIds: selectedViewerIds,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800">
          <DialogTitle className="text-lg font-medium dark:text-slate-100">Program Settings</DialogTitle>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">Update program details and manage visibility</p>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {/* Program Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-slate-200">
              Program Name
            </label>
            <Input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="Enter program name..."
              className="h-10 border border-[#E2E8F0] dark:border-slate-800 mt-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Manager Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-slate-200">
              Assign Manager
            </label>

            <Popover open={isManagerPopoverOpen} onOpenChange={setIsManagerPopoverOpen} modal={false}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-10 border border-[#E2E8F0] dark:border-slate-800 mt-2 flex items-center justify-between px-3 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-normal text-gray-900 dark:text-slate-100"
                >
                  <span className={cn(!selectedManagerDetail && "text-gray-400 dark:text-slate-500")}>
                    {selectedManagerDetail?.user?.name || "Select a manager"}
                  </span>
                  <ChevronDown className="size-4 text-gray-400 dark:text-slate-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[350px] p-1 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 z-50"
                align="start"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="p-2 border-b border-border dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-3.5" />
                    <input
                      type="text"
                      placeholder="Search managers..."
                      value={managerSearchInput}
                      onChange={(e) => setManagerSearchInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-xs text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div
                  className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800 scrollbar-hide py-1"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {isFetchingManagers && managersList.length === 0 ? (
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-8 w-full animate-pulse bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded" />
                      <Skeleton className="h-8 w-full animate-pulse bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded" />
                    </div>
                  ) : managersList.length > 0 ? (
                    <>
                      {managersList.map((manager: any) => {
                        const isSelected = selectedManagerId === manager.id;
                        return (
                          <div
                            key={manager.id}
                            onClick={() => {
                              setSelectedManagerId(isSelected ? "" : manager.id);
                              setIsManagerPopoverOpen(false);
                            }}
                            className={cn(
                              "px-3 py-2 text-sm text-gray-700 dark:text-slate-200 cursor-pointer rounded transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-between",
                              isSelected && "bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                            )}
                          >
                            <span>{manager.user?.name}</span>
                            {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                          </div>
                        );
                      })}
                      {hasMoreManagers && (
                        <div className="p-1 mt-1 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLoadMoreManagers}
                            disabled={isFetchingManagers}
                            className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium h-8"
                          >
                            {isFetchingManagers ? "Loading..." : "Load More"}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 text-center text-gray-400 dark:text-slate-600">
                      <p className="text-xs">No managers found</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Viewer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-slate-200">
              Assign Viewers
            </label>

            <Popover open={isViewerPopoverOpen} onOpenChange={setIsViewerPopoverOpen} modal={false}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-10 border border-[#E2E8F0] dark:border-slate-800 mt-2 flex items-center justify-between px-3 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-gray-400 dark:text-slate-500 group-hover:text-blue-500" />
                    <span className="text-gray-500 dark:text-slate-400 font-normal">Select program viewers...</span>
                  </div>
                  <ChevronDown className="size-4 text-gray-400 dark:text-slate-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[350px] p-0 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 z-50"
                align="start"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="p-3 border-b border-border dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-3.5" />
                    <input
                      type="text"
                      placeholder="Search viewers..."
                      value={viewerSearchInput}
                      onChange={(e) => setViewerSearchInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-xs text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div
                  className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800 scrollbar-hide"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {isFetchingViewers && viewersList.length === 0 ? (
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-10 w-full animate-pulse bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
                      <Skeleton className="h-10 w-full animate-pulse bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg" />
                    </div>
                  ) : viewersList.length > 0 ? (
                    <>
                      {viewersList.map((viewer: any) => {
                        const isSelected = selectedViewerIds.includes(viewer.user.id);
                        return (
                          <div
                            key={viewer.user.id}
                            onClick={() => toggleViewer(viewer.user.id)}
                            className={cn(
                              "flex items-center justify-between px-4 py-3 cursor-pointer transition-all hover:bg-blue-50/50 dark:hover:bg-slate-800/50",
                              isSelected && "bg-blue-50/30 dark:bg-blue-500/10"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8 border border-gray-200 dark:border-slate-700">
                                <AvatarImage src={viewer.user.profileImage} />
                                <AvatarFallback className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold">
                                  {viewer.user.name?.substring(0, 2).toUpperCase() || "V"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">{viewer.user.name}</span>
                                <span className="text-[10px] text-gray-500 dark:text-slate-500">{viewer.user.email}</span>
                              </div>
                            </div>
                            <div className={cn(
                              "size-5 rounded border-2 flex items-center justify-center transition-all",
                              isSelected ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500" : "border-gray-200 dark:border-slate-700"
                            )}>
                              {isSelected && <Check size={12} className="text-white" />}
                            </div>
                          </div>
                        );
                      })}
                      {hasMoreViewers && (
                        <div className="p-2 text-center bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLoadMoreViewers}
                            disabled={isFetchingViewers}
                            className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            {isFetchingViewers ? "Loading..." : "Load More"}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 text-center text-gray-400 dark:text-slate-600">
                      <p className="text-xs">No viewers found</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Assigned Viewers Display */}
          {selectedViewersDetails.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="text-sm font-medium text-gray-900 dark:text-slate-200">
                Assigned Viewers
              </label>
              <div className="space-y-3">
                {selectedViewersDetails.map((viewer: any) => (
                  <div key={viewer.user.id} className="flex items-center justify-between p-2 rounded-lg border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 group hover:border-blue-200 dark:hover:border-blue-500/50 transition-all">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12 border border-gray-200 dark:border-slate-800">
                        <AvatarImage src={viewer.user.profileImage} />
                        <AvatarFallback className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
                          {viewer.user.name?.substring(0, 2).toUpperCase() || "V"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="">
                        <p className="font-medium text-sm text-gray-900 dark:text-slate-100">{viewer.user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500">{viewer.user.role || viewer.user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleViewer(viewer.user.id)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-rose-500/10 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-rose-400 rounded-md transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0] dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 bg-transparent border-[#E2E8F0] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-10 bg-[#1C73E0] hover:bg-blue-600 text-white cursor-pointer"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProgramModal;
