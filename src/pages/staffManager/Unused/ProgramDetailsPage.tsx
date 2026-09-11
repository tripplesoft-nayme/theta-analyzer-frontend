/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  AlertCircle,
  MapPin,
  ArrowLeft,
  User,
  Layers,
  Database,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FaSpinner } from "react-icons/fa";
import {
  useGetProgramByIdQuery,
  useGetProjectsByProgramIdQuery,
} from "@/store/Api/ProgramApi/ProgramApi";
import ErrorPage from "@/Common/ErrorPage";

const formatDate = (date: string | null) => {
  if (!date) return "Not Set";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getPriorityStyles = (priority: string) => {
  switch (priority?.toUpperCase()) {
    case "HIGH":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "MEDIUM":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

export default function ProgramDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetProgramByIdQuery(id!, {
    skip: !id,
  });

  const program = data?.data;

  const { data: projectsData, isLoading: isProjectsLoading } =
    useGetProjectsByProgramIdQuery(
      {
        programId: id,
        args: {},
      },
      { skip: !id },
    );

  const projects = projectsData?.data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  if (isError || !program) {
    return <ErrorPage />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">

      {/* Title & Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {program.programName}
          </h1>
          <p className="text-slate-500 mb-4">{program.programDescription}</p>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityStyles(program.priority)}`}
            >
              {program.priority} Priority
            </span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">
              Progress
            </span>
            <span className="text-sm font-bold text-primary">
              {program.progress}%
            </span>
          </div>
          <Progress value={program.progress} className="h-2" />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timeline Section */}
        <section className="p-5 rounded-xl border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4" /> Timeline
          </h4>
          <div className="space-y-4">
            <InfoItem
              icon={<Clock className="w-4 h-4" />}
              label="Start Date"
              value={formatDate(program.datetime)}
            />
            <InfoItem
              icon={<AlertCircle className="w-4 h-4" />}
              label="Deadline"
              value={formatDate(program.deadline)}
              highlight
            />
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Created At"
              value={formatDate(program.createdAt)}
            />
          </div>
        </section>

        {/* Details Section */}
        <section className="p-5 rounded-xl border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4" /> Program Metadata
          </h4>
          <div className="space-y-4">
            <InfoItem
              icon={<MapPin className="w-4 h-4" />}
              label="Location"
              value={`${program.latitude}, ${program.longitude}`}
            />
            <InfoItem
              icon={<User className="w-4 h-4" />}
              label="Manager ID"
              value={program.managerId}
            />
            <InfoItem
              icon={<Database className="w-4 h-4" />}
              label="Client ID"
              value={program.clientId}
            />
          </div>
        </section>
      </div>

      {/* Projects Section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Projects ({projects?.length || 0})
        </h3>

        {isProjectsLoading ? (
          <div className="flex justify-center p-8">
            <FaSpinner className="animate-spin text-primary" size={24} />
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <div
                key={project.id}
                onClick={() =>
                  navigate(`/staff-manager-panel/projects/${project.id}`)
                }
                className="group p-5 rounded-xl border border-slate-100 bg-white hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getPriorityStyles(project.priority)}`}
                  >
                    {project.priority}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 mb-2 truncate pr-16 group-hover:text-primary transition-colors">
                  {project.name}
                </h4>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium`}
                  >
                    {project.status?.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span className="font-semibold text-slate-700">
                      {project.progress}%
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />

                  <div className="pt-3 mt-3 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Deadline:{" "}
                      <span className="text-slate-600 font-medium">
                        {formatDate(project.deadline)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-slate-500 text-sm">
              No projects found in this program.
            </p>
          </div>
        )}
      </div>


      {/* Footer */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
        <Button onClick={() => navigate(-1)} variant="outline" className="flex items-center gap-2 text-gray-600">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className=" text-right text-xs text-slate-400">
          Last updated {formatDate(program.updatedAt)}
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div className="p-2 rounded-lg bg-slate-100 text-slate-600">{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
        {label}
      </p>
      <p
        className={`text-sm font-semibold truncate max-w-[200px] sm:max-w-none ${highlight ? "text-rose-600" : "text-slate-700"}`}
      >
        {value}
      </p>
    </div>
  </div>
);

