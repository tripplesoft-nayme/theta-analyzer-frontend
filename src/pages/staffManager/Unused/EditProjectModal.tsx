/* eslint-disable @typescript-eslint/no-explicit-any */
import AppDialog from "@/Common/Charts/CompletedCharts/Common/Modal/ModalTemplate";
import { DialogClose } from "@/components/ui/dialog";
import {
  useUpdateProjectMutation,
  useUpdateProjectStatusMutation,
} from "@/store/Api/ProjectApi/ProjectApi";
import { FaEdit } from "react-icons/fa";

const EditProjectModal = ({ id }: { id: string }) => {
  const [updateProject, { isLoading: isPriorityLoading }] =
    useUpdateProjectMutation();
  const [updateProjectStatus, { isLoading: isStatusLoading }] =
    useUpdateProjectStatusMutation();

  const handleUpdatePriority = (priority: string) => {
    updateProject({ id, priority });
  };

  return (
    <AppDialog
      triggerButton={
        <button className="text-green-600 hover:text-green-800">
          <FaEdit />
        </button>
      }
      title="Edit Submission"
      description={`Are you sure you want to update the status ?`}
      footer={
        <div className="flex flex-col gap-3 w-full">
          {/* set status buttons with heading  */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Set Status</p>
            <div className="flex items-center gap-2">
              <DialogClose
                className="px-4 py-2 rounded bg-red-600 text-white"
                onClick={() => updateProjectStatus({ id, status: "PROBLEM" })}
                disabled={isStatusLoading}
              >
                {isStatusLoading ? "Updating..." : "Problem"}
              </DialogClose>
              <DialogClose
                className="px-4 py-2 rounded bg-green-600 text-white"
                onClick={() => updateProjectStatus({ id, status: "COMPLETE" })}
                disabled={isStatusLoading}
              >
                {isStatusLoading ? "Updating..." : "Complete"}
              </DialogClose>
            </div>
          </div>

          {/* set deadline with heading  */}
          {/* <div className="mt-3 flex flex-col gap-2">
            <p className="text-sm font-medium">Set Deadline</p>
            <input type="date" className="px-4 py-2 rounded border" />
          </div> */}

          {/* set priority with heading  */}
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-sm font-medium">Set Priority</p>
            <div className="flex items-center gap-2">
              <DialogClose
                className="px-4 py-2 rounded bg-red-600 text-white"
                onClick={() => handleUpdatePriority("HIGH")}
                disabled={isPriorityLoading}
              >
                {isPriorityLoading ? "Updating..." : "High"}
              </DialogClose>
              <DialogClose
                className="px-4 py-2 rounded bg-green-600 text-white"
                onClick={() => handleUpdatePriority("MEDIUM")}
                disabled={isPriorityLoading}
              >
                {isPriorityLoading ? "Updating..." : "Medium"}
              </DialogClose>
              <DialogClose
                className="px-4 py-2 rounded bg-blue-600 text-white"
                onClick={() => handleUpdatePriority("LOW")}
                disabled={isPriorityLoading}
              >
                {isPriorityLoading ? "Updating..." : "Low"}
              </DialogClose>
            </div>
          </div>
        </div>
      }
    >
      <></>
    </AppDialog>
  );
};

export default EditProjectModal;
