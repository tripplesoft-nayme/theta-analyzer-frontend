import { useAppSelector } from "@/hooks/useRedux";
import { MessageSquareText, Mail, AlertCircle, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useVerificationTypeMutation } from "@/store/Api/AuthApi/VerificationApi";
import { useSystemBranding } from "@/hooks/useSystemBranding";
import { jwtDecode } from "jwt-decode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import PrimaryButton from "@/Common/PrimaryButton";

type VerificationType = "email" | "phone";

const TwoStepVerification = () => {
  const { getLogo } = useSystemBranding();
  const { user } = useAppSelector((state) => state.auth);
  const [verificationType, { isLoading }] = useVerificationTypeMutation();
  const navigate = useNavigate();

  const email = user?.email ?? "";
  const phone = user?.phone ?? "";
  const hasPhone = Boolean(
    phone && phone.trim() !== "" && phone.trim() !== "null" && phone.trim() !== "undefined"
  );

  // Decode target unmasked userEmail from specialToken or user object
  let targetEmailFromToken = user?.userEmail || "";
  if (!targetEmailFromToken && (user?.specialToken || user?.accessToken)) {
    try {
      const decoded = jwtDecode<{ userEmail?: string; email?: string }>(
        user?.specialToken || user?.accessToken || ""
      );
      targetEmailFromToken = decoded?.userEmail || decoded?.email || "";
    } catch (e) {
      console.error("Error decoding token in TwoStepVerification:", e);
    }
  }

  const [type, setType] = useState<VerificationType>("email");
  const [value, setValue] = useState("");
  const [emailError, setEmailError] = useState("");
  const [open, setOpen] = useState(false);

  const handleOpen = (selectedType: VerificationType) => {
    setType(selectedType);
    setValue("");
    setEmailError("");
    setOpen(true);
  };

  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr.trim());
  };

  const handleInputChange = (val: string) => {
    setValue(val);
    if (type === "email" && emailError) {
      if (validateEmail(val)) {
        setEmailError("");
      }
    }
  };

  const handleSubmit = async () => {
    const trimmedVal = value.trim();
    if (!trimmedVal) {
      toast.error(type === "email" ? "Email address is required" : "Phone number is required");
      if (type === "email") setEmailError("Email address is required");
      return;
    }

    if (type === "email") {
      if (!validateEmail(trimmedVal)) {
        setEmailError("Please enter a valid email address (e.g. name@domain.com)");
        toast.error("Please enter a valid email address");
        return;
      }

      // Check if inputted email matches the unmasked email from specialToken
      const expectedEmail = targetEmailFromToken.trim().toLowerCase();
      if (expectedEmail && trimmedVal.toLowerCase() !== expectedEmail) {
        setEmailError("Entered email address does not match your registered account email.");
        toast.error("Email address does not match your registered account email.");
        return;
      }
    }

    const toastId = toast.loading("Sending verification code...");
    try {
      const res = await verificationType(type).unwrap();

      if (res.success) {
        toast.success(`Verification code sent to ${trimmedVal}`, { id: toastId });
        setOpen(false);

        navigate("/emailcode", {
          state: { type, value: trimmedVal },
        });
      } else {
        toast.error(res.message || "Failed to send verification code", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send verification code", { id: toastId });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-6xl w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col md:flex-row min-h-[480px]">

          {/* Left Column - Branding & Information */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <img src={getLogo("Logo.png")} alt="Logo" className="max-w-[180px] max-h-14 object-contain mb-8" />
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-slate-100 leading-tight tracking-tight">
                2-Step Verification
              </h3>
              <p className="text-sm md:text-base text-[#475569] dark:text-slate-400 leading-relaxed mt-4">
                To help keep your account safe, Theta Analyzer wants to make sure it’s really you trying to log in.
              </p>
            </div>
          </div>

          {/* Right Column - Options List */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-900">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6">
              Choose your log in process:
            </h4>

            <div className="space-y-4">
              {hasPhone && (
                <button
                  onClick={() => handleOpen("phone")}
                  className="w-full text-left group border-border border dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg p-4 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-blue-50/40 dark:hover:bg-slate-800/80 transition-all flex items-center justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                      <MessageSquareText className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                        Get verification code at {phone}
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Text message (SMS) verification.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0 ml-2" />
                </button>
              )}

              <button
                onClick={() => handleOpen("email")}
                className="w-full text-left group border-border border dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg p-4 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-blue-50/40 dark:hover:bg-slate-800/80 transition-all flex items-center justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                      Get verification code at {email}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Email address verification.
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0 ml-2" />
              </button>
            </div>
          </div>

        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold dark:text-slate-100">
              {type === "email" ? "Verify Email Address" : "Verify Phone Number"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {type === "email" ? "Registered Email Target:" : "Registered Phone Target:"}
              </p>
              <div className="flex items-center gap-2">
                {type === "email" ? (
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                ) : (
                  <MessageSquareText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-all">
                  {type === "email" ? email : phone}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {type === "email" ? "Enter your full email address:" : "Enter your phone number:"}
              </label>
              <Input
                type={type === "email" ? "email" : "text"}
                placeholder={type === "email" ? "e.g. name@example.com" : "e.g. +1234567890"}
                value={value}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 ${emailError ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
              />
              {emailError && (
                <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {emailError}
                </p>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              {type === "email"
                ? "Please input your complete email address to verify your identity before we dispatch the 6-digit code."
                : "Please input your complete phone number to verify your identity before we dispatch the 6-digit code."}
            </p>
          </div>

          <DialogFooter className="w-full">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 h-12"
            >
              Cancel
            </Button>
            <PrimaryButton
              type="Primary"
              onClick={handleSubmit}
              disabled={isLoading}
              className="font-medium px-5"
              title={isLoading ? "Sending..." : "Send Code"}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TwoStepVerification;
