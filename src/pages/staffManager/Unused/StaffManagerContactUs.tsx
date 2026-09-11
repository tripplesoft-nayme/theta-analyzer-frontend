import BoxContainer from "@/Common/BoxContainer";
import DescriptionTextArea from "@/Common/DescriptionTextArea";
import PrimaryButton from "@/Common/PrimaryButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Headphones, MapPin, Phone, Send } from "lucide-react";

const StaffManagerContactUs = () => {
  const supportHours = {
    time: "8am-5pm",
    timezone: "Central Time, USA",
  };
  const phoneNumbers = ["+1 (555) 0000-000", "+1 (555) 0000-000"];
  const officeLocation = {
    address: "House no, Road no,City name, State name, USA",
  };

  const handleAttachment = () => {};
  const handleEmoji = () => {};
  return (
    <div className="w-1/2 mx-auto">
      <BoxContainer>
        <div className="space-y-6">
          <h4>Contact Support</h4>
          <div className="grid grid-cols-2 items-center justify-between gap-10 ">
            <div className=" w-full space-y-6">
              <div className="">
                <Label htmlFor="fullName" className="pb-2">
                  Full Name*
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter Full name"
                  required
                  className="border border-[#E2E8F0]"
                />
              </div>
              <div className="">
                <Label htmlFor="phoneNumber" className="pb-2">
                  Phone number*
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="US  +1 (555) 000-0000"
                  className="border border-[#E2E8F0]"
                  required
                />
              </div>
              <DescriptionTextArea
                handleAttachment={handleAttachment}
                handleEmoji={handleEmoji}
              />
              <div className="">
                <PrimaryButton
                  type={"Primary"}
                  title={"Send"}
                  rightIcon={<Send />}
                  className={"w-full"}
                />
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg space-y-6 max-w-sm">
              {/* Support Hours Section */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-lg flex-shrink-0">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">
                    Support Hour
                  </h5>
                  <p className="text-gray-600 text-sm">
                    {supportHours.time}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {supportHours.timezone}
                  </p>
                </div>
              </div>

              {/* Call Us Section */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-lg flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">
                    Call Us
                  </h5>
                  {phoneNumbers.map((phone, index) => (
                    <p key={index} className="text-gray-600 text-sm">
                      {phone}
                    </p>
                  ))}
                </div>
              </div>

              {/* Office Location Section */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-lg flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">
                    Office Location
                  </h5>
                  <p className="text-gray-600 text-sm">
                    {officeLocation.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BoxContainer>
    </div>
  );
};

export default StaffManagerContactUs;
