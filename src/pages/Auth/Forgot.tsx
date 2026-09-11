import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useForgotPasswordMutation } from "@/store/Api/AuthApi/AuthApi";
import { useSystemBranding } from "@/hooks/useSystemBranding";
import PrimaryButton from "@/Common/PrimaryButton";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const Forgot = () => {
  const navigate = useNavigate();
  const { getLogo } = useSystemBranding();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (data: LoginFormInputs) => {
    const toastId = toast.loading("Sending reset link...");
    try {
      const res = await forgotPassword(data).unwrap();
      if (res?.success || res?.statusCode === 200 || res?.statusCode === 201) {
        toast.success(res?.message || res?.data?.message || "A reset link has been sent to your email.", {
          id: toastId,
        });
        setTimeout(() => {
          navigate("/login");
        }, 500);
      } else {
        toast.error(res?.message || "Email Verification Failed", {
          id: toastId,
        });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Email Verification Failed", {
        id: toastId,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
      <div className="w-[40%]">
        <img src={getLogo("Logo.png")} alt="logo" className="max-w-[180px] max-h-16 object-contain mb-6" />
        <img className="w-full" src="login image.png" alt="" />
      </div>
      <div>
        <h2 className="text-[48px] leading-[56px] font-semibold text-center text-gray-900 dark:text-slate-100">
          Forgot Password?
        </h2>
        <p className="text-[#475569] dark:text-slate-400 font-normal text-4 mt-[10px] mb-[48px] text-center">
          Enter your email and we’ll send you a password reset link.
        </p>
        <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1D2028] dark:text-slate-300 mb-3">
              Email*
            </label>

            <div
              className={`flex items-center border ${errors.email ? "border-red-500" : "border-[#94A3B8] dark:border-slate-800"
                } bg-[#F5F8FA] dark:bg-slate-900 rounded-md focus:outline-none relative`}
            >
              <Mail className="ml-[17px] w-[5%] text-gray-400 dark:text-slate-500" />
              <input
                type="email"
                {...register("email")}
                placeholder="Enter your email"
                className="w-full py-[14px] px-2 bg-[#F5F8FA] dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md focus:outline-none"
              />
              {errors.email && (
                <CircleAlert className="mr-[17px] text-red-500" />
              )}
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-2">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <PrimaryButton
            type="Primary"
            disabled={isLoading}
            className="w-full h-12 rounded-md text-base font-semibold"
            title="Send Reset Password Link"
          />
        </form>
      </div>
    </div>
  );
};

export default Forgot;
