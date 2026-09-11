/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useGetAllProjectsQuery } from "@/store/Api/ProjectApi/ProjectApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UpdateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const UpdateUserModal = ({ isOpen, onClose, user }: UpdateUserModalProps) => {
  const { data, isLoading } = useGetAllProjectsQuery({});
  const projectData = data?.data?.projects?.data?.map((project: any) => ({
    id: project.id,
    name: project.name,
  }));
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    userStatus: "",
    assignedProjects: [] as any[],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "EMPLOYEE",
        userStatus: user.userStatus || "INACTIVE",
        assignedProjects: user.assignedProjects || [],
      });
    }
  }, [user]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="flex flex-col gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            >
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.userStatus}
              onChange={(e) => handleChange("userStatus", e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Assigned Projects
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.assignedProjects.map((project: any, idx: number) => (
                <span
                  key={project.id}
                  className="bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer"
                  onClick={() =>
                    handleChange(
                      "assignedProjects",
                      formData.assignedProjects.filter((_, i) => i !== idx),
                    )
                  }
                >
                  {project.name} &times;
                </span>
              ))}
            </div>
            {isLoading ? (
              <div className="h-10 w-full rounded-md" />
            ) : (
              <Select
                value=""
                onValueChange={(val) => {
                  const project = projectData?.find((p: any) => p.id === val);
                  if (
                    project &&
                    !formData.assignedProjects.some((p) => p.id === val)
                  ) {
                    handleChange("assignedProjects", [
                      ...formData.assignedProjects,
                      project,
                    ]);
                  }
                }}
              >
                <SelectTrigger className="w-full border border-gray-200 rounded px-3 py-2">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projectData?.map((project: any) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      className="hover:bg-gray-100"
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="default"
            className="bg-blue-500 text-white"
            onClick={handleSubmit}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUserModal;
