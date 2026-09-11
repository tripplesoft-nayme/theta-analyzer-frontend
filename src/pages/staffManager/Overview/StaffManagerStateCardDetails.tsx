import { Construction } from "lucide-react";
import { useParams } from "react-router-dom";

const StaffManagerStateCardDetails = () => {
  const { cardTitle } = useParams()
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-50">
            <Construction className="w-7 h-7 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Feature Coming Soon
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {cardTitle ? (
            <>
              The <span className="font-medium text-gray-800">{cardTitle}</span>{" "}
              feature is currently under development.
            </>
          ) : (
            <>
              This feature is currently under development.
            </>
          )}
          <br />
          We&apos;re working hard to bring you a better experience.
        </p>

        {/* Divider */}
        <div className="my-6 border-t border-border" />

        {/* Footer message */}
        <p className="text-xs text-gray-500">
          Thank you for your patience. This section will be available in a
          future update.
        </p>
      </div>
    </div>
  );
};

export default StaffManagerStateCardDetails;
