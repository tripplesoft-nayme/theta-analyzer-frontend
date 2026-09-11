import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useResetPasswordMutation } from "@/store/Api/AuthApi/AuthApi";
import PrimaryButton from "@/Common/PrimaryButton";
const forgotSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password is required"),
});

type ForgotFormInputs = z.infer<typeof forgotSchema>;

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ForgotFormInputs>({
    resolver: zodResolver(forgotSchema),
  });
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const onSubmit = async (data: ForgotFormInputs) => {
    try {
      const res = await resetPassword({
        token: params?.get("token") as string,
        credentials: {
          id: params?.get("id") as string,
          newPassword: data.password,
        },
      }).unwrap();
      if (res.success) {
        toast.success("Password Reset Successfully");
        navigate("/login");
      }
    } catch {
      toast.error("Password Reset Failed");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
      <div className="w-[40%]">
        <img className="w-full" src="login image.png" alt="" />
      </div>
      <div>
        <h2 className="text-4xl leading-[56px] font-medium text-center text-gray-900 dark:text-slate-100">
          Reset Password?
        </h2>
        <p className="text-[#475569] dark:text-slate-400 font-normal text-4 mt-[10px] mb-[48px] text-center w-[99%]">
          Please enter a new password & confirm to reset your password
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1D2028] dark:text-slate-300 mb-3">
              Password*
            </label>
            <div
              className={`flex items-center border ${errors.password ? "border-red-500" : "border-[#94A3B8] dark:border-slate-800"
                } bg-[#F5F8FA] dark:bg-slate-900 rounded-md focus:outline-none relative`}
            >
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setValue("password", e.target.value);
                }}
                placeholder="Enter your password"
                className="w-full py-[14px] px-4 bg-[#F5F8FA] dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md focus:outline-none"
              />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300 focus:outline-none focus:text-gray-800 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mt-[8px]">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1D2028] dark:text-slate-300 mb-3">
              Confirm Password*
            </label>
            <div
              className={`flex items-center border ${errors.password ? "border-red-500" : "border-[#94A3B8] dark:border-slate-800"
                } bg-[#F5F8FA] dark:bg-slate-900 rounded-md focus:outline-none relative`}
            >
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full py-[14px] px-4 bg-[#F5F8FA] dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md focus:outline-none"
              />

              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="h-12 absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300 focus:outline-none focus:text-gray-800 transition-colors"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mt-[8px]">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <PrimaryButton
            type="Primary"
            disabled={isLoading}
            className="w-full h-12! rounded-md text-base font-semibold"
            title="Reset Password"
          />
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
