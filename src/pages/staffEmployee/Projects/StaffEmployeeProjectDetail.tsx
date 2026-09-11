/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
  Eraser,
  User,
  Briefcase,
  Layers,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { useGetProjectByIdQuery } from "@/store/Api/ProjectApi/ProjectApi";
import {
  useDeleteManagerProjectMutation,
  useGetFavoriteProjectsQuery,
  useRemoveProjectFromFavoriteMutation,
} from "@/store/Api/staffManagerApi/StaffManagerApi";
import ErrorPage from "@/Common/ErrorPage";
import { FaSpinner } from "react-icons/fa";
import { ConfirmAlertModal } from "@/Common/Charts/CompletedCharts/Common/Modal/ConfirmAlertModal";
import { Badge } from "@/components/ui/badge";
import DeleteModal from "@/Common/Charts/CompletedCharts/Common/Modal/DeleteModal";
import { toast } from "sonner";

const formatDate = (date: string | null) => {
  if (!date) return "Not Set";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "ACTIVE":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
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

export default function StaffEmployeeProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: projectData,
    isLoading,
    isError,
    error,
  } = useGetProjectByIdQuery(id!);

  const { data: favoriteData } = useGetFavoriteProjectsQuery();
  const [removeProjectFromFavorite] = useRemoveProjectFromFavoriteMutation();
  const [deleteProject] = useDeleteManagerProjectMutation();

  const project = projectData?.data?.project;

  const handleRemove = async () => {
    try {
      await removeProjectFromFavorite(id).unwrap();
      toast.success("Project removed from favorite");
      navigate("/staff-employee-panel");
    } catch (err) {
      toast.error("Failed to remove favorite");
      console.error("Failed to remove favorite", err);
    }
  };

  const handleDelete = async (deleteId: string) => {
    try {
      setIsDeleting(true);
      await deleteProject({ id: deleteId }).unwrap();
      navigate("/staff-manager-panel");
    } catch (err) {
      console.error("Failed to delete", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || isDeleting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (isError || error || !project) {
    return <ErrorPage />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="flex items-center gap-4">
          {favoriteData?.data?.some((fav: any) => fav.projectId === id) && (
            <ConfirmAlertModal
              id={project.id}
              handleConfirm={handleRemove}
              button={
                <Button
                  variant="outline"
                  size="icon"
                  className="w-fit px-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                >
                  <Eraser className="w-4 h-4" /> Remove From Favorite
                </Button>
              }
            />
          )}
          {/* <Button variant="outline" size="icon" className="text-blue-600">
            <PencilLine className="w-4 h-4" />
          </Button> */}
          <div className="hidden">
            <DeleteModal
              deletingItemTitle={project.name}
              deletingItemId={project.id}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            {project.name}
          </h1>
          <p className="text-slate-600 text-lg mb-4">
            {project.description || "No project description provided."}
          </p>
          <div className="flex gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(project.status)}`}
            >
              {project.status}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityStyles(project.priority)}`}
            >
              {project.priority} PRIORITY
            </span>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase">
              Project Completion
            </span>
            <span className="text-2xl font-black text-primary">
              {project.progress}%
            </span>
          </div>
          <Progress value={project.progress} className="h-3 mb-2" />
          <p className="text-xs text-slate-400 italic text-right">
            Computed: {project.computedProgress}%
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Program Info */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Layers className="w-4 h-4" /> Parent Program
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl">
              <h4 className="font-bold text-slate-800">
                {project.program?.programName}
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                {project.program?.programDescription}
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {project.program?.latitude},{" "}
                  {project.program?.longitude}
                </span>
              </div>
            </div>
          </section>

          {/* Timeline & Budget Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Schedule
              </h3>
              <div className="space-y-4">
                <InfoItem
                  icon={<Clock />}
                  label="Start Date"
                  value={formatDate(project.startDate)}
                />
                <InfoItem
                  icon={<AlertCircle />}
                  label="Deadline"
                  value={formatDate(project.deadline)}
                  highlight
                />
                <InfoItem
                  icon={<Calendar />}
                  label="Created"
                  value={formatDate(project.createdAt)}
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Financials
              </h3>
              <div className="space-y-4">
                <InfoItem
                  icon={<DollarSign />}
                  label="Budget"
                  value={
                    project.budget ? `$${project.budget}` : "Not Allocated"
                  }
                />
                <InfoItem
                  icon={<TrendingUp />}
                  label="Current Rate"
                  value={project.currentRate ?? "N/A"}
                />
                <InfoItem
                  icon={<Briefcase />}
                  label="Share Policy"
                  value={project.shareWith?.replace("_", " ")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: People */}
        <div className="space-y-6">
          {/* Manager Card */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <User className="w-4 h-4" /> Project Manager
            </h3>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-3 border border-slate-700">
                <User size={32} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-400 mb-4">
                {project.manager?.description}
              </p>

              <div className="w-full space-y-2">
                <p className="text-[10px] text-slate-500 uppercase font-bold text-left">
                  Specialized Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.manager?.skills?.map((skill: string) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-slate-800 text-slate-200 border-none"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">
              Project Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xl font-bold text-slate-800">
                  {project.tasks?.length || 0}
                </p>
                <p className="text-[10px] text-slate-500 uppercase">Tasks</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xl font-bold text-slate-800">
                  {project.projectEmployees?.length || 0}
                </p>
                <p className="text-[10px] text-slate-500 uppercase">Staff</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
        <p>Slug: {project.slug}</p>
        <p>Last synchronized: {new Date(project.updatedAt).toLocaleString()}</p>
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
    <div className="p-2 rounded-lg bg-slate-50 text-slate-500">{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">
        {label}
      </p>
      <p
        className={`text-sm font-semibold ${highlight ? "text-rose-600" : "text-slate-700"}`}
      >
        {value}
      </p>
    </div>
  </div>
);
