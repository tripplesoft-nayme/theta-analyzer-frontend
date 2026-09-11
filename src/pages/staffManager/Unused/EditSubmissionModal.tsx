/* eslint-disable @typescript-eslint/no-explicit-any */
import AppDialog from "@/Common/Charts/CompletedCharts/Common/Modal/ModalTemplate";
import { FaEdit } from "react-icons/fa";

interface EditSubmissionModalProps {
  data: any;
  onSubmit?: () => void;
}

const EditSubmissionModal = ({
  data,
  //   onSubmit,
}: EditSubmissionModalProps) => {
  console.log(data);

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
        <div className="flex justify-end gap-3 w-full">
          {/* <button
            className="px-4 py-2 rounded border"
            onClick={onClose}
          >
            Cancel
          </button> */}

          <button
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            Return
          </button>

          <button
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            Approve
          </button>
        </div>
      }
    >
      <>
      </>
    </AppDialog>
  );
};

export default EditSubmissionModal;
