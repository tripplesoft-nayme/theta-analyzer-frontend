import { ArrowRight, Filter, List } from "lucide-react";
import { Card } from "@/components/ui/card";
import BoxContainer from "@/Common/BoxContainer";
import PrimaryButton from "@/Common/PrimaryButton";

const activityLogData = [
  {
    id: "1",
    type: "success",
    title: "New user created",
    description: "SmartSolutions Ltd. added as Business Plan client",
    timestamp: "10 minutes ago",
    metadata: "By Admin",
  },
  {
    id: "2",
    type: "error",
    title: "Failed login attempt",
    description:
      "Multiple failed login attempts for Global Industries",
    timestamp: "43 minutes ago",
    metadata: "IP: 185.32.44.12",
  },
  {
    id: "3",
    type: "success",
    title: "Dashboard published",
    description:
      'Acme Corporation published "Sales Overview" dashboard',
    timestamp: "10 minutes ago",
    metadata: "By Admin",
  },
  {
    id: "4",
    type: "success",
    title: "Business plan upgraded",
    description: "TechStart Inc. upgraded storage from 12Gb to 20Gb",
    timestamp: "10 minutes ago",
    metadata: "By Admin",
  },
];

const ActivityLog = () => {
  return (
    <BoxContainer>
      <BoxContainer>
        <Card className=" bg-white border-none shadow-none rounded-lg py-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className=" flex gap-2 items-center">
              <List className="w-5 h-5" />
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                Activity Log
              </h4>
            </div>
            <PrimaryButton
              type="Outline"
              leftIcon={<Filter className="w-5 h-5" />}
            />
          </div>

          {/* Activity Items */}
          <div className="space-y-6 py-4">
            {activityLogData.map((activity) => (
              <div
                key={activity.id}
                className=" flex items-start gap-3"
              >
                <div className=" relative min-h-20 flex">
                  {/* Status Indicator */}
                  <div
                    className={`size-3 rounded-full flex-shrink-0 z-1 ${
                      activity.type === "success"
                        ? ""
                        : "bg-[#DA4352]"
                    }`}
                  />

                  <div className="absolute transform inset-x-1/2 border-1 w-px h-full border-[#CBD5E1]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-[#1D2028]">
                          {activity.title}
                        </h5>
                      </div>
                      <p className="text-sm text-[#475569] mt-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-[#475569] ">
                          {activity.timestamp}
                        </span>
                        {activity.metadata && (
                          <span className="text-sm text-[#475569] ">
                            {activity.metadata}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="">
            <PrimaryButton
              type="Ghost"
              title={`View full audit trail ${ActivityLog.length}`}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full"
            />
          </div>
        </Card>
      </BoxContainer>
    </BoxContainer>
  );
};

export default ActivityLog;
