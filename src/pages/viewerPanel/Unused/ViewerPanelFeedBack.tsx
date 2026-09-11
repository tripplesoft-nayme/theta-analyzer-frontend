import BoxContainer from "@/Common/BoxContainer";
import DescriptionTextArea from "@/Common/DescriptionTextArea";
import PrimaryButton from "@/Common/PrimaryButton";
import { Send } from "lucide-react";

const ViewerPanelFeedback = () => {
  const handleAttachment = () => {};
  const handleEmoji = () => {};
  return (
    <div className="w-1/3 mx-auto">
      <BoxContainer>
        <div className="space-y-6">
          <h4>Product feedback</h4>
          <p>
            Have feedback on how to improve the product? Message our
            Product team directly about it below. If you'd like to
            report a bug or performance issue, please document below,
            or contact support via this form. We'd love to hear from
            you!
          </p>

          <BoxContainer>
            <div className="pb-6">
              <DescriptionTextArea
                handleAttachment={handleAttachment}
                handleEmoji={handleEmoji}
              />
            </div>
            <div className="flex justify-end">
              <PrimaryButton
                type={"Primary"}
                title={"Send"}
                rightIcon={<Send />}
              />
            </div>
          </BoxContainer>
        </div>
      </BoxContainer>
    </div>
  );
};

export default ViewerPanelFeedback;
