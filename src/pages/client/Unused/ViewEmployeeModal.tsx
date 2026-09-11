import { X } from "lucide-react";
import { useGetSingleEmployeeQuery } from "@/store/Api/EmployeeApi/EmployeeApi";

interface IViewEmployeeModalProps {
  employeeId: string;
  open: boolean;
  onClose: () => void;
}

const EmployeeSkeletonLoader = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Basic Info */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>

      {/* Employment Info */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-36"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
          <div className="h-6 w-14 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );
};

const ViewEmployeeModal = ({
  employeeId,
  open,
  onClose,
}: IViewEmployeeModalProps) => {
  const { data, isLoading } = useGetSingleEmployeeQuery(employeeId);
  if (!open) return null;
  const employee = data?.data;
  const user = employee?.user;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">View Employee</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <EmployeeSkeletonLoader />
          ) : !employee ? (
            <p className="text-sm text-red-500">Employee data not found</p>
          ) : (
            <>
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="text-gray-900 font-medium">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">
                      {user?.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Role</p>
                    <p className="text-gray-900 font-medium">{user?.role}</p>
                  </div>
                </div>
              </div>

              {/* Employment Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Employment Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Joined Date</p>
                    <p className="text-gray-900 font-medium">
                      {employee.joinedDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="text-gray-900 font-medium">
                      {user?.userStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {employee.skills?.length ? (
                    employee.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No skills assigned</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-700">{employee.description}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;
