import { useState, useEffect, useRef } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  useVerifyEmailMutation,
  useVerifyPhoneMutation,
  useVerificationTypeMutation,
} from "@/store/Api/AuthApi/VerificationApi";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { useAppDispatch } from "@/hooks/useRedux";
import { setUser } from "@/store/Slices/AuthSlice/authSlice";
import { useSystemBranding } from "@/hooks/useSystemBranding";
import PrimaryButton from "@/Common/PrimaryButton";

const Role: Record<string, string> = {
  VIEWER: "viewer-panel",
  EMPLOYEE: "staff-employee-panel",
  SUPPORTER: "supporter",
  MANAGER: "staff-manager-panel",
  ADMIN: "admin",
  CLIENT: "client-panel",
  SUPERADMIN: "superadmin",
};

const EmailCode = () => {
  const { state } = useLocation();
  const [verifyEmail, { isLoading: isEmailLoading }] = useVerifyEmailMutation();
  const [verifyPhone, { isLoading: isPhoneLoading }] = useVerifyPhoneMutation();
  const [verificationTypeApi, { isLoading: isResendLoading }] = useVerificationTypeMutation();
  const isLoading = isEmailLoading || isPhoneLoading || isResendLoading;

  const type = state?.type;
  const value = state?.value;

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [code, setCode] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(60); // 1 minute (60 seconds)
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Timer logic
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  if (!type) return <Navigate to="/login" />;

  // Handle typing in inputs
  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // only last digit
    setCode(newCode);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedData = e.clipboardData.getData("Text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("");
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = code.join("");
    if (enteredCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    const toastId = toast.loading("Verifying code...");
    try {
      let res;
      if (type === "email") {
        res = await verifyEmail({ email: value, otp: enteredCode }).unwrap();
      } else if (type === "phone") {
        res = await verifyPhone({ phone: value, otp: enteredCode }).unwrap();
      }
      if (res?.success) {
        dispatch(setUser(res?.data));

        let userRole = res?.data?.role || res?.data?.user?.role;
        if (!userRole && res?.data?.accessToken) {
          try {
            const decoded = jwtDecode<{ role: string }>(res.data.accessToken);
            userRole = decoded?.role;
          } catch (e) {
            console.error("JWT decode error:", e);
          }
        }

        const targetRoute = userRole && Role[userRole] ? `/${Role[userRole]}` : "/login";

        toast.success("Code verified successfully", { id: toastId });
        navigate(targetRoute, { replace: true });
      } else {
        toast.error(res?.message || "Failed to verify code", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to verify code", { id: toastId });
    }
  };

  const handleResend = async () => {
    if (!type || !value) return;
    setTimer(60); // 1 minute
    setCanResend(false);
    const toastId = toast.loading("Resending code...");
    try {
      const res = await verificationTypeApi(type).unwrap();
      if (res.success) {
        toast.success(`Code resent successfully to your ${type}`, {
          id: toastId,
        });
      }
    } catch {
      toast.error("Failed to resend code", { id: toastId });
      setCanResend(true);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const { getLogo } = useSystemBranding();

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
      <div className="w-[40%]">
        <img src={getLogo("Logo.png")} alt="Logo" className="max-w-[180px] max-h-16 object-contain mb-6" />
        <img className="w-full" src="login image.png" alt="" />
      </div>
      <div>
        <h2 className="text-4xl leading-14 font-medium text-center text-gray-900 dark:text-slate-100">
          Enter the {type} code
        </h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <ul className="flex justify-center items-center gap-4 mt-[48px]">
            {code.map((digit, i) => (
              <li
                key={i}
                className="border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[8px] w-[72px] h-[72px] text-center"
              >
                <input
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                  className="text-[48px] font-medium text-center w-full h-full outline-none bg-transparent text-gray-900 dark:text-slate-100"
                />
              </li>
            ))}
          </ul>

          <p className="text-[#475569] dark:text-slate-400 text-center mt-4 mb-2">
            Didn’t get the code?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-[#1C73E0] dark:text-blue-400 underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend now
              </button>
            ) : (
              <span className="dark:text-slate-500">Send again in {formatTimer(timer)}</span>
            )}
          </p>

          <div className="flex justify-center mt-4">
            <PrimaryButton
              type="Primary"
              disabled={isLoading}
              className="w-[70%] h-12 rounded-md text-base font-semibold"
              title="Confirm"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailCode;
