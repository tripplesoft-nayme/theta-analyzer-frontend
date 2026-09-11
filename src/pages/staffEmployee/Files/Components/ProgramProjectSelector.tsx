import React, { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface ProgramProjectSelectorProps {
  selectedProgramId: string | null;
  selectedProjectId: string | null;
  programs: Array<{ id: string; name: string }>;
  filteredProjectsList: any[];
  onProgramChange: (val: string) => void;
  onProjectChange: (val: string) => void;
}

export const ProgramProjectSelector: React.FC<ProgramProjectSelectorProps> = ({
  selectedProgramId,
  selectedProjectId,
  programs,
  filteredProjectsList,
  onProgramChange,
  onProjectChange,
}) => {
  const [openProgram, setOpenProgram] = useState(false);
  const [openProject, setOpenProject] = useState(false);

  const [programSearch, setProgramSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  const [programPage, setProgramPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);

  // Reset searches when popovers close
  useEffect(() => {
    if (!openProgram) {
      setProgramSearch("");
    }
  }, [openProgram]);

  useEffect(() => {
    if (!openProject) {
      setProjectSearch("");
    }
  }, [openProject]);

  // Reset page when search term changes
  useEffect(() => {
    setProgramPage(1);
  }, [programSearch]);

  useEffect(() => {
    setProjectPage(1);
  }, [projectSearch]);

  // Filter programs based on search input
  const filteredPrograms = useMemo(() => {
    if (!programSearch) return programs;
    return programs.filter((p) =>
      p.name.toLowerCase().includes(programSearch.toLowerCase())
    );
  }, [programs, programSearch]);

  // Paginate filtered programs
  const paginatedPrograms = useMemo(() => {
    return filteredPrograms.slice(0, programPage * 10);
  }, [filteredPrograms, programPage]);

  const hasMorePrograms = filteredPrograms.length > paginatedPrograms.length;

  // Filter projects based on search input
  const filteredProjects = useMemo(() => {
    if (!projectSearch) return filteredProjectsList;
    return filteredProjectsList.filter((p) =>
      p.name.toLowerCase().includes(projectSearch.toLowerCase())
    );
  }, [filteredProjectsList, projectSearch]);

  // Paginate filtered projects
  const paginatedProjects = useMemo(() => {
    return filteredProjects.slice(0, projectPage * 10);
  }, [filteredProjects, projectPage]);

  const hasMoreProjects = filteredProjects.length > paginatedProjects.length;

  // Display names for selected items
  const displayProgramName = useMemo(() => {
    return programs.find((p) => p.id === selectedProgramId)?.name || "Select program name";
  }, [programs, selectedProgramId]);

  const displayProjectName = useMemo(() => {
    if (!selectedProgramId) return "Select a program first";
    return filteredProjectsList.find((p) => p.id === selectedProjectId)?.name || "Select project name";
  }, [filteredProjectsList, selectedProgramId, selectedProjectId]);

  return (
    <div className="flex flex-col items-center justify-start min-h-[60vh] px-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl tracking-tight font-semibold text-slate-900 dark:text-white">
            Select Program & Project
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
            Select a Program & Project first, then view and manage your files.
          </p>
        </div>

        <div className="space-y-5">
          {/* Program Name Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Program Name *
            </label>
            <Popover open={openProgram} onOpenChange={setOpenProgram}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openProgram}
                  className="w-full justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 transition-all cursor-pointer font-normal outline-none h-11! px-4 text-left shadow-none hover:bg-slate-55 dark:hover:bg-slate-800"
                >
                  <span className="truncate">{displayProgramName}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                style={{ width: "var(--radix-popover-trigger-width)" }}
                className="w-[var(--radix-popover-trigger-width)]! p-0 z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md"
              >
                <Command shouldFilter={false} className="dark:bg-slate-900">
                  <CommandInput
                    placeholder="Search program..."
                    value={programSearch}
                    onValueChange={(val) => setProgramSearch(val)}
                    className="h-10"
                  />
                  <CommandList className="max-h-60 overflow-y-auto">
                    {paginatedPrograms.length === 0 && (
                      <CommandEmpty className="text-xs text-slate-400 py-3 text-center">
                        No program found.
                      </CommandEmpty>
                    )}
                    <CommandGroup>
                      {paginatedPrograms.map((prog) => (
                        <CommandItem
                          key={prog.id}
                          value={prog.name}
                          onSelect={() => {
                            onProgramChange(prog.id);
                            setOpenProgram(false);
                          }}
                          className="cursor-pointer font-normal rounded-md py-2.5 px-3 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-blue-500",
                              selectedProgramId === prog.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">{prog.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {hasMorePrograms && (
                      <div className="p-1 text-center border-t border-slate-100 dark:border-slate-800">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 h-8 font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProgramPage((prev) => prev + 1);
                          }}
                        >
                          Load More
                        </Button>
                      </div>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Project Name Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Project Name *
            </label>
            <Popover open={openProject} onOpenChange={setOpenProject}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={!selectedProgramId}
                  aria-expanded={openProject}
                  className={cn(
                    "w-full justify-between border rounded-lg transition-all font-normal outline-none h-11! px-4 text-left shadow-none",
                    selectedProgramId
                      ? "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                      : "bg-gray-50/50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-855 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  )}
                >
                  <span className="truncate">{displayProjectName}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              {selectedProgramId && (
                <PopoverContent
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                  className="w-[var(--radix-popover-trigger-width)]! p-0 z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md"
                >
                  <Command shouldFilter={false} className="dark:bg-slate-900">
                    <CommandInput
                      placeholder="Search project..."
                      value={projectSearch}
                      onValueChange={(val) => setProjectSearch(val)}
                      className="h-10"
                    />
                    <CommandList className="max-h-60 overflow-y-auto">
                      {paginatedProjects.length === 0 && (
                        <CommandEmpty className="text-xs text-slate-400 py-3 text-center">
                          No project found.
                        </CommandEmpty>
                      )}
                      <CommandGroup>
                        {paginatedProjects.map((project) => (
                          <CommandItem
                            key={project.id}
                            value={project.name}
                            onSelect={() => {
                              onProjectChange(project.id);
                              setOpenProject(false);
                            }}
                            className="cursor-pointer font-normal rounded-md py-2.5 px-3 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 text-blue-500",
                                selectedProjectId === project.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="truncate">{project.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {hasMoreProjects && (
                        <div className="p-1 text-center border-t border-slate-100 dark:border-slate-800">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 h-8 font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectPage((prev) => prev + 1);
                            }}
                          >
                            Load More
                          </Button>
                        </div>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              )}
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};
