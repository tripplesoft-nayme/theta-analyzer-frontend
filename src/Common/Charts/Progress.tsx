"use client";

import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";

interface ProgressTask {
  id: string;
  name: string;
  progress: number;
}

const initialData: ProgressTask[] = [
  { id: "1", name: "Initiation", progress: 90 },
  { id: "2", name: "Plinth Beam", progress: 80 },
  { id: "3", name: "1st floor slab", progress: 70 },
  { id: "4", name: "2nd floor slab", progress: 60 },
  { id: "5", name: "3rd floor slab", progress: 50 },
  { id: "6", name: "Terrace floor slab", progress: 30 },
  { id: "7", name: "Handoff", progress: 30 },
];

export default function ProgressChart() {
  const [tasks, setTasks] = useState<ProgressTask[]>(initialData);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleCopy = () => {
    const data = tasks.map((t) => `${t.name}: ${t.progress}%`).join("\n");
    navigator.clipboard.writeText(data);
  };

  const handleReset = () => {
    setTasks(initialData);
  };

  const handleProgressChange = (id: string, newProgress: number) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, progress: Math.min(100, Math.max(0, newProgress)) }
          : t,
      ),
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Progress</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Total Task {tasks.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy data"
            >
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset to default"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Y-axis labels and bars */}
          <div className="space-y-6">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4">
                {/* Task name */}
                <div className="w-32 text-sm text-gray-600 font-medium">
                  {task.name}
                </div>

                {/* Progress bar container */}
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-8 bg-gray-100 rounded-md overflow-hidden relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {[...Array(11)].map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 border-r border-dashed border-gray-300"
                          style={{ width: "10%" }}
                        />
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div
                      className={`h-full bg-blue-500 rounded-md transition-all duration-300 cursor-pointer hover:bg-blue-600 ${
                        hoveredId === task.id ? "shadow-lg" : ""
                      }`}
                      style={{ width: `${task.progress}%` }}
                      onMouseEnter={() => setHoveredId(task.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        const newProgress = prompt(
                          `Enter progress for ${task.name} (0-100):`,
                          task.progress.toString(),
                        );
                        if (newProgress !== null) {
                          handleProgressChange(
                            task.id,
                            Number.parseInt(newProgress),
                          );
                        }
                      }}
                    />
                  </div>

                  {/* Percentage text */}
                  <span className="w-12 text-sm font-semibold text-gray-800">
                    {task.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="flex items-center gap-4 mt-8">
            <div className="w-32" />
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 flex justify-between text-xs text-gray-500 px-2">
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((num) => (
                  <span key={num}>{num}</span>
                ))}
              </div>
              <div className="w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
