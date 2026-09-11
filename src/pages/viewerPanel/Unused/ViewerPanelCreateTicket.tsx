import BoxContainer from "@/Common/BoxContainer";
import PrimaryButton from "@/Common/PrimaryButton";
import DropdownSelect from "@/Common/DropdownSelect";
import DescriptionTextArea from "@/Common/DescriptionTextArea";
import { Send } from "lucide-react";

const ViewerPanelCreateTicket = () => {
  const selectItem = [
    { value: "light", title: "Light" },
    { value: "dark", title: "Dark" },
    { value: "system", title: "System" },
  ];

  const handleAttachment = () => {};
  const handleEmoji = () => {};
  const handleMessage = () => {};

  return (
    <div className="w-1/3 mx-auto">
      <BoxContainer>
        <div className="space-y-6">
          <h4>Create Support Tickets</h4>
          <BoxContainer>
            <div className="space-y-6">
              <DropdownSelect
                placeholderText={"Write a message"}
                dropdownItem={selectItem}
                onChange={handleMessage}
              />

              <DescriptionTextArea
                handleAttachment={handleAttachment}
                handleEmoji={handleEmoji}
              />
              <div className="flex justify-end">
                <PrimaryButton
                  type={"Primary"}
                  title={"Send"}
                  rightIcon={<Send />}
                />
              </div>
            </div>
          </BoxContainer>
        </div>
      </BoxContainer>
    </div>
  );
};

export default ViewerPanelCreateTicket;
