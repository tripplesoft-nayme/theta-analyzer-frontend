import { useEffect, useState } from "react";
import BoxContainer from "@/Common/BoxContainer";
import PrimaryButton from "@/Common/PrimaryButton";
import DropdownSelect from "@/Common/DropdownSelect";
import ToggleSwitchComponent from "@/Common/Settings/ToggleSwitchComponent";
import {
  useGetProfileQuery,
  useUpdateUsersMutation,
} from "@/store/Api/UserApi/UserApi";
import { useSelector } from "react-redux";
import {
  useGetClientDetailsQuery,
  useUpdateClientDetailsMutation,
  IClientDetailsRequest,
} from "@/store/Api/ClientDashboardApi/ClientDetailsApi";
import { toast } from "sonner";

interface ProfileState {
  name: string;
  email: string;
  phoneNumber: string;
  language: string;
  timezone: string;
  verification2FA: boolean;
  userStatus: string;
  profileImage: File | null;
  imagePreview: string;
  allowTimezoneOverride: boolean;
  showRelativeTimestamps: boolean;
  dateFormat: string;
  timeFormat: string;
  firstDayOfWeek: string;
  sessionTimeout: string;
}

// const IMG_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "/");

const mapTimezoneToRegionAndOffset = (tzString: string) => {
  const match = tzString.match(/^([^\s]+)\s*\(([^)]+)\)$/);
  if (match) {
    return { region: match[1], timeZone: match[2] };
  }

  switch (tzString) {
    case "America/Chicago":
      return { region: "America/Chicago", timeZone: "UTC-06:00" };
    case "America/New_York":
      return { region: "America/New_York", timeZone: "UTC-05:00" };
    case "Europe/London":
      return { region: "Europe/London", timeZone: "UTC+00:00" };
    default:
      return { region: tzString, timeZone: "UTC+00:00" };
  }
};

const getErrorMessage = (err: any): string => {
  const errorData = err?.data || err;

  if (errorData?.errorDetails?.code === "P2002") {
    const targets = errorData.errorDetails.meta?.target;
    if (Array.isArray(targets) && targets.length > 0) {
      const fieldNames = targets.map((field: string) => {
        if (field === "phoneNumber") return "Phone number";
        if (field === "email") return "Email address";
        const formatted = field.replace(/([A-Z])/g, " $1").trim();
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
      });
      return `${fieldNames.join(", ")} is already in use.`;
    }
  }

  if (errorData?.message) {
    return errorData.message;
  }

  return "";
};

const UserProfileSettings = ({ className = "" }: { className?: string }) => {
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery({});
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUsersMutation();

  const userRole = useSelector((state: any) => state.auth.user?.role);
  const isClient = userRole?.toUpperCase() === "CLIENT";

  const adminClientId = useSelector((state: any) => state.auth.user?.adminClientId);
  const { data: clientDetailsData, isLoading: clientLoading } = useGetClientDetailsQuery(
    { id: adminClientId },
    { skip: !isClient || !adminClientId }
  );

  const isLoading = profileLoading || (isClient && adminClientId ? clientLoading : false);
  const [updateClientDetails, { isLoading: isUpdatingClient }] = useUpdateClientDetailsMutation();

  const [profile, setProfile] = useState<ProfileState>({
    name: "",
    email: "",
    phoneNumber: "",
    language: "English (US)",
    timezone: "(UTC-06:00) Central Time (US & Canada)",
    verification2FA: false,
    userStatus: "active",
    profileImage: null,
    imagePreview: "",
    allowTimezoneOverride: true,
    showRelativeTimestamps: true,
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12 hour",
    firstDayOfWeek: "Sunday",
    sessionTimeout: "10 min",
  });

  useEffect(() => {
    if (profileData?.data) {
      const user = profileData.data;
      setProfile((prev: ProfileState) => {
        const updated = {
          ...prev,
          verification2FA: user.verification2FA || false,
          userStatus: user.userStatus || "active",
          imagePreview: user.profileImage ? `${user.profileImage}` : "",
        };
        // If the user is not a CLIENT, populate general profile settings from the user query
        if (!isClient) {
          updated.name = user.name || prev.name;
          updated.email = user.email || prev.email;
          updated.phoneNumber = user.phoneNumber || prev.phoneNumber;
          updated.language = user.language || prev.language;
          updated.timezone = user.timezone || prev.timezone;
        }
        return updated;
      });
    }
  }, [profileData, isClient]);

  useEffect(() => {
    if (isClient && clientDetailsData?.data) {
      const client = clientDetailsData.data;
      setProfile((prev: ProfileState) => ({
        ...prev,
        name: client.user?.name || prev.name,
        email: client.user?.email || prev.email,
        phoneNumber: client.phoneNumber || client.user?.phoneNumber || client.referrerPhone || prev.phoneNumber,
        language: client.language || prev.language,
        timezone: client.timeZone
      }));
    }
  }, [clientDetailsData, isClient]);

  const handleProfileUpdate = async () => {
    let hasChanged = false;

    // 1. Update the User profile (including image, name, language, timezone, 2FA, status)
    try {
      let userPayload: any;
      if (profile.profileImage) {
        const formData = new FormData();
        formData.append("profileImage", profile.profileImage);
        formData.append("name", profile.name);
        formData.append("phoneNumber", profile.phoneNumber);
        formData.append("language", profile.language);
        if (profile.timezone) {
          const match = profile.timezone.match(/^([^\s]+)\s*\(([^)]+)\)$/);
          formData.append("timezone", match ? match[1] : profile.timezone);
        }
        formData.append("verification2FA", String(profile.verification2FA));
        formData.append("userStatus", profile.userStatus);
        userPayload = formData;
      } else {
        const match = profile.timezone?.match(/^([^\s]+)\s*\(([^)]+)\)$/);
        userPayload = {
          name: profile.name,
          phoneNumber: profile.phoneNumber,
          language: profile.language,
          timezone: match ? match[1] : profile.timezone,
          verification2FA: profile.verification2FA,
          userStatus: profile.userStatus,
        };
      }
      await updateUser(userPayload).unwrap();
      hasChanged = true;
    } catch (err: any) {
      toast.error(getErrorMessage(err) || "Failed to update user profile");
      return;
    }

    // 2. Update the Client details (Only if the user is a Client)
    if (isClient && adminClientId) {
      let clientPayload: any;

      if (profile.profileImage) {
        const formData = new FormData();
        formData.append("name", profile.name);
        formData.append("email", profile.email);
        formData.append("phoneNumber", profile.phoneNumber);
        formData.append("language", profile.language);
        formData.append("profileImage", profile.profileImage);

        if (profile.timezone) {
          const mapped = mapTimezoneToRegionAndOffset(profile.timezone);
          formData.append("region", mapped.region);
          formData.append("timeZone", mapped.timeZone);
        }
        clientPayload = formData;
      } else {
        const payload: Partial<IClientDetailsRequest> = {
          name: profile.name,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          language: profile.language,
        };

        if (profile.timezone) {
          const mapped = mapTimezoneToRegionAndOffset(profile.timezone);
          payload.region = mapped.region;
          payload.timeZone = mapped.timeZone;
        }
        clientPayload = payload;
      }

      try {
        await updateClientDetails({ id: adminClientId, data: clientPayload }).unwrap();
        hasChanged = true;
      } catch (err: any) {
        toast.error(getErrorMessage(err) || "Failed to update client profile settings");
        return;
      }
    }

    if (hasChanged) {
      toast.success("Profile settings updated successfully");
      setProfile((prev) => ({ ...prev, profileImage: null }));
    } else {
      toast.info("No changes to save");
    }
  };

  const handle2FAChange = async (val: boolean) => {
    // Optimistically update local state
    setProfile((prev: ProfileState) => ({
      ...prev,
      verification2FA: val,
    }));

    try {
      // Send as JSON to preserve boolean type
      await updateUser({ verification2FA: val }).unwrap();
      toast.success(`2FA ${val ? "enabled" : "disabled"} successfully`);
    } catch (err: any) {
      // Revert if API fails
      setProfile((prev: ProfileState) => ({
        ...prev,
        verification2FA: !val,
      }));
      toast.error(getErrorMessage(err) || "Failed to update 2FA status");
    }
  };

  const languages = [
    { value: "English (US)", title: "English (US)" },
    { value: "English (UK)", title: "English (UK)" },
    { value: "Spanish", title: "Spanish" },
    { value: "French", title: "French" },
  ];

  const timezones = [
    {
      value: "America/Chicago",
      title: "(UTC-06:00) Central Time (US & Canada)",
    },
    {
      value: "America/New_York",
      title: "(UTC-05:00) Eastern Time (US & Canada)",
    },
    { value: "Europe/London", title: "(UTC+00:00) London" },
  ];

  return (
    <BoxContainer className={`border-border dark:bg-slate-900 dark:border-slate-800 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100 tracking-tight">
            User Profile & Preferences
          </h4>
          <p className="text-xs text-gray-400 dark:text-slate-300 font-medium">
            Manage your personal information and application settings
          </p>
        </div>
        <PrimaryButton
          type="Primary"
          title={isUpdatingClient || isUpdatingUser ? "Saving..." : "Save Changes"}
          onClick={handleProfileUpdate}
          disabled={isUpdatingClient || isUpdatingUser}
          className="scale-90"
        />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-linear-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg border border-blue-50/50 dark:border-blue-500/20">
          <div className={`w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 overflow-hidden group relative shrink-0 ${isLoading ? "animate-pulse" : ""}`}>
            {isLoading ? (
              <div className="w-full h-full bg-gray-200 dark:bg-slate-800" />
            ) : profile.imagePreview ? (
              <img
                src={profile.imagePreview}
                alt="Profile"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400 font-bold text-3xl transition-transform duration-500 group-hover:scale-110">
                {profile.name?.charAt(0) || "U"}
              </div>
            )}
            {!isLoading && (
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                  Change
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfile((prev: ProfileState) => ({
                        ...prev,
                        profileImage: file,
                        imagePreview: URL.createObjectURL(file),
                      }));
                    }
                  }}
                />
              </label>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-6 w-40 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 truncate capitalize">
                  {profile.name || "User Name"}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${profile.userStatus?.toLowerCase() === "active"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                      : "bg-gray-50 text-gray-500 border-border dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                      }`}
                  >
                    {profile.userStatus}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                    {profileData?.data?.role || "CLIENT"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest ml-1">
              Full Name
            </label>
            {isLoading ? (
              <div className="w-full h-[42px] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse" />
            ) : (
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 font-medium text-sm rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
              />
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            {isLoading ? (
              <div className="w-full h-[42px] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse" />
            ) : (
              <input
                type="text"
                value={profile.email}
                disabled
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 font-medium text-sm rounded-lg"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest ml-1">
              Phone Number
            </label>
            {isLoading ? (
              <div className="w-full h-[42px] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse" />
            ) : (
              <input
                type="text"
                value={profile.phoneNumber}
                onChange={(e) => setProfile((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 font-medium text-sm rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
              />
            )}
          </div>

          {isLoading ? (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest ml-1">
                Preferred Language
              </label>
              <div className="w-full h-11 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse" />
            </div>
          ) : (
            <DropdownSelect
              label="Preferred Language"
              placeholderText={profile.language}
              dropdownItem={languages}
              onChange={(val: string) =>
                setProfile((prev: ProfileState) => ({
                  ...prev,
                  language: val,
                }))
              }
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest ml-1">
                Region/Timezone
              </label>
              <div className="w-full h-11 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse" />
            </div>
          ) : (
            <DropdownSelect
              label="Region/Timezone"
              placeholderText={profile.timezone}
              dropdownItem={timezones}
              onChange={(val: string) =>
                setProfile((prev: ProfileState) => ({
                  ...prev,
                  timezone: val,
                }))
              }
            />
          )}
          <div className="hidden sm:block" />
        </div>

        <div className="space-y-6 pt-4 border-t border-border dark:border-slate-800">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
            Security Settings
          </h5>
          <div className="grid">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-lg space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 dark:bg-blue-400/10 rounded-full -mr-12 -mt-12 transition-all duration-700 group-hover:scale-150" />
              <div className="flex items-center justify-between relative z-10">
                {isLoading ? (
                  <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                ) : (
                  <ToggleSwitchComponent
                    label="2FA Verification"
                    enabled={profile.verification2FA}
                    onChange={handle2FAChange}
                  />
                )}
                {!isLoading && !profile.verification2FA && (
                  <span className="text-[9px] font-black text-amber-600 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-600/70 dark:text-blue-400/70 font-medium leading-relaxed">
                Highly recommended for account security. Uses a verification
                code in addition to your password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BoxContainer>
  );
};

export default UserProfileSettings;
