import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Mail, CircleAlert } from "lucide-react";
import { useLoginMutation } from "@/store/Api/AuthApi/AuthApi";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/useRedux";
import { setUser } from "@/store/Slices/AuthSlice/authSlice";
import { jwtDecode } from "jwt-decode";
import { useAdminLoginMutation } from "@/store/Api/AuthApi/AdminApi";
import baseApi from "@/store/Api/BaseApi/BaseApi";
import adminApi from "@/store/Api/BaseApi/AdminApi";
import { useSystemBranding } from "@/hooks/useSystemBranding";
import PrimaryButton from "@/Common/PrimaryButton";

const Role = {
  VIEWER: "viewer-panel",
  EMPLOYEE: "staff-employee-panel",
  SUPPORTER: "supporter",
  MANAGER: "staff-manager-panel",
  CLIENT: "client-panel",
};
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const DEMO_ACCOUNTS = [
  { label: "Client", email: "client@gmail.com", password: "123456789" },
  { label: "Manager", email: "manager@gmail.com", password: "123456789" },
  { label: "Employee", email: "employee@gmail.com", password: "123456789" },
  { label: "Viewer", email: "viewer@gmail.com", password: "123456789" },
];

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login = () => {
  const { getLogo } = useSystemBranding();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [adminLogin, { isLoading: isAdminLoginLoading }] = useAdminLoginMutation();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "client@gmail.com",
      password: "123456789",
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormInputs) => {
    const toastId = toast.loading("Logging in...");
    try {
      const res = await login(data).unwrap();
      if (!res.success) throw new Error(res.message);
      if (res.data.specialToken) {
        dispatch(baseApi.util.resetApiState());
        dispatch(adminApi.util.resetApiState());
        dispatch(setUser(res?.data));
        navigate("/verification");
        toast.success("Verification code sent to your email", { id: toastId });
        return true;
      }
      const { role } = jwtDecode<{ role: keyof typeof Role }>(
        res.data.accessToken,
      );
      const route = Role[role] ? `/${Role[role]}` : null;

      if (role !== "CLIENT" && route) {
        dispatch(baseApi.util.resetApiState());
        dispatch(adminApi.util.resetApiState());
        dispatch(setUser(res?.data));
        navigate(route);
        toast.success("Logged in successfully", { id: toastId });
        return true;
      } else if (role === "CLIENT") {
        const resAdmin = await adminLogin(data).unwrap();
        if (resAdmin.success) {
          const data = {
            ...res.data,
            adminData: resAdmin.data,
          };
          dispatch(baseApi.util.resetApiState());
          dispatch(adminApi.util.resetApiState());
          dispatch(setUser(data));
          toast.success("Logged in successfully", { id: toastId });
          if (route) {
            navigate(route);
          }
        }
      }
    } catch {
      toast.error("Login Failed", { id: toastId });
    }
  };

  const handleDemoLogin = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
    onSubmit({ email, password });
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
      <div className="w-[40%]">
        <img src={getLogo("Logo.png")} alt="logo" className="max-w-[180px] max-h-16 object-contain mb-6 dark:brightness-200" />
        <img className="w-full dark:brightness-100" src="login image.png" alt="login-Image" />
      </div>
      <div>
        <h2 className="text-[48px] leading-[56px] font-semibold text-center text-gray-900 dark:text-slate-100">
          Welcome back
        </h2>
        <p className="text-[#475569] dark:text-slate-400 font-normal text-4 mt-[10px] text-center">
          Enter your email and password to access your account
        </p>
        {(window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname.endsWith(".vercel.app") ||
          /^(10|172|192)\./.test(window.location.hostname)) && (
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  disabled={isLoginLoading || isAdminLoginLoading}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all border border-blue-500 text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleDemoLogin(acc.email, acc.password)}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-[24px]">
          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1D2028] dark:text-slate-300 mb-3">
              Email*
            </label>

            <div
              className={`flex items-center border ${errors.password ? "border-red-500" : "border-[#94A3B8] dark:border-slate-800"
                } bg-[#F5F8FA] dark:bg-slate-900 rounded-md focus:outline-none relative`}
            >
              <Mail className="mx-[14px] w-[5%] text-gray-400 dark:text-slate-500" />
              <input
                type="email"
                {...register("email")}
                placeholder="Enter your email"
                className="w-full py-[14px] px-2 bg-[#F5F8FA] dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md focus:outline-none"
              />
              {errors.password ? (
                <CircleAlert className="mr-[17px] text-red-500" />
              ) : (
                ""
              )}
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-[8px]">
                {errors.email.message}
              </p>
            )}
          </div>

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
                {...register("password")}
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

            <div className="flex gap-4 items-baseline my-6 justify-between">
              <input
                type="checkbox"
                name="policy"
                id="policy"
                className="text-[#D0D5DD] dark:border-slate-800 dark:bg-slate-900 rounded-3xl cursor-pointer"
              />
              <p className="text-[#0F1325] dark:text-slate-300 w-[90%]">Remember me</p>
              <NavLink
                to="/forgot"
                className="font-medium text-[#0151FF] dark:text-blue-400 w-[60%] cursor-pointer"
              >
                Forgot Password?
              </NavLink>
            </div>
          </div>

          {/* Submit Button */}
          <PrimaryButton
            type="Primary"
            disabled={isLoginLoading || isAdminLoginLoading}
            className="w-full h-12 rounded-md text-base font-semibold"
            title="Login"
          />

          {/* <NavLink to="/signup">
            <div className="text-center mt-6">
              <h3 className="font-normal text-[#0151FF]">
                Create a new account
              </h3>
            </div>
          </NavLink> */}
        </form>
      </div>
    </div>
  );
};

export default Login;
