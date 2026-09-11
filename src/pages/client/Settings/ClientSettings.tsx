import { useState, useEffect } from "react";
import ToggleSwitchComponent from "@/Common/Settings/ToggleSwitchComponent";
import ColorPickerComponent from "@/Common/Settings/ColorPickerComponent";
import FileUploadComponent from "@/Common/Settings/FileUploadComponent";
import BoxContainer from "@/Common/BoxContainer";
import DropdownSelect from "@/Common/DropdownSelect";
import PrimaryButton from "@/Common/PrimaryButton";
// import APIConnectionCard from "@/components/client/Settings/APIConnectionCard";
import Notification from "./Components/Notification";
import UserProfileSettings from "./Components/UserProfileSettings";
import { useSelector } from "react-redux";
import {
  useGetClientDetailsQuery,
  useUpdateClientDetailsMutation,
  IClientDetailsRequest,
} from "@/store/Api/ClientDashboardApi/ClientDetailsApi";
import { toast } from "sonner";

interface BrandingState {
  primaryColor: string;
  secondaryColor: string;
  logo: File | null;
  favicon: File | null;
}

interface BillingState {
  currentPlan: string;
  billingCycle: string;
  nextRenewal: string;
  paymentMethod: string;
  enableAutoRenew: boolean;
  address: string;
}

const ClientSettings = () => {
  const adminClientId = useSelector((state: any) => state.auth.user?.adminClientId);
  const { data: clientDetailsData, isLoading: clientLoading } = useGetClientDetailsQuery(
    { id: adminClientId },
    { skip: !adminClientId }
  );
  const isLoading = adminClientId ? clientLoading : false;
  const [updateClientDetails, { isLoading: isUpdatingClient }] = useUpdateClientDetailsMutation();

  const [branding, setBranding] = useState<BrandingState>({
    primaryColor: "#7F56D9",
    secondaryColor: "#6366F1",
    logo: null,
    favicon: null,
  });

  const [billing, setBilling] = useState<BillingState>({
    currentPlan: "Business",
    billingCycle: "Yearly",
    nextRenewal: "25/6/2026",
    paymentMethod: "Stripe",
    enableAutoRenew: true,
    address: "123 Business Ave\nSuite 500\nSan Francisco, CA 94105",
  });

  useEffect(() => {
    if (clientDetailsData?.data) {
      const client = clientDetailsData.data;
      setBranding((prev) => ({
        ...prev,
        primaryColor: client.primaryColor || "#7F56D9",
        secondaryColor: client.secondaryColor || "#6366F1",
      }));
      setBilling((prev) => ({
        ...prev,
        currentPlan: client.subscriptionPlan || "Business",
        billingCycle: client.billingCycle === "MONTHLY" ? "Monthly" : "Yearly",
      }));
    }
  }, [clientDetailsData]);

  const handleBrandingSave = async () => {
    if (!adminClientId) return;

    const formData = new FormData();
    if (branding.logo) {
      formData.append("logo", branding.logo);
    }
    if (branding.favicon) {
      formData.append("favicon", branding.favicon);
    }
    formData.append("primaryColor", branding.primaryColor);
    formData.append("secondaryColor", branding.secondaryColor);

    try {
      await updateClientDetails({ id: adminClientId, data: formData }).unwrap();
      toast.success("Branding updated successfully");
      setBranding(prev => ({ ...prev, logo: null, favicon: null }));
    } catch {
      toast.error("Failed to update branding settings");
    }
  };

  const handleBillingSave = async () => {
    if (!adminClientId) return;

    const billingPayload: Partial<IClientDetailsRequest> = {
      subscriptionPlan: billing.currentPlan,
      billingCycle: billing.billingCycle === "Monthly" ? "MONTHLY" : "YEARLY",
    };

    try {
      await updateClientDetails({ id: adminClientId, data: billingPayload }).unwrap();
      toast.success("Billing settings updated successfully");
    } catch {
      toast.error("Failed to update billing settings");
    }
  };

  const logoPreview = branding.logo
    ? URL.createObjectURL(branding.logo)
    : (clientDetailsData?.data?.logoUrl || undefined);

  const faviconPreview = branding.favicon
    ? URL.createObjectURL(branding.favicon)
    : (clientDetailsData?.data?.faviconUrl || undefined);

  return (
    <div className=" mx-auto animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Column 1 */}
        <div className="space-y-6">
          <UserProfileSettings />

          <BoxContainer className="border-border dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
                Setup Your Branding
              </h4>
              <PrimaryButton
                type="Primary"
                title={isUpdatingClient ? "Saving..." : "Save Changes"}
                onClick={handleBrandingSave}
                disabled={isUpdatingClient}
                className="scale-90"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="w-full h-[170px] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse" />
                </div>
              ) : (
                <FileUploadComponent
                  label="Client Logo *"
                  description="64x64 or 256x256"
                  requirements="SVG, PNG, JPG (max 2MB)"
                  buttonText="Upload Logo"
                  onFileUpload={(file) => setBranding((prev) => ({ ...prev, logo: file }))}
                  previewUrl={logoPreview}
                />
              )}
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="w-full h-[170px] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse" />
                </div>
              ) : (
                <FileUploadComponent
                  label="Favicon"
                  description="32x32"
                  requirements="SVG, PNG (max 512KB)"
                  buttonText="Upload Fav"
                  onFileUpload={(file) => setBranding((prev) => ({ ...prev, favicon: file }))}
                  previewUrl={faviconPreview}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-250 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="flex-1 h-10 bg-gray-250 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                </div>
              ) : (
                <ColorPickerComponent
                  label="Primary Brand Color"
                  value={branding.primaryColor}
                  onChange={(val: string) =>
                    setBranding((prev: BrandingState) => ({
                      ...prev,
                      primaryColor: val,
                    }))
                  }
                />
              )}
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-250 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="flex-1 h-10 bg-gray-250 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                </div>
              ) : (
                <ColorPickerComponent
                  label="Secondary Brand Color"
                  value={branding.secondaryColor}
                  onChange={(val: string) =>
                    setBranding((prev: BrandingState) => ({
                      ...prev,
                      secondaryColor: val,
                    }))
                  }
                />
              )}
            </div>
          </BoxContainer>
        </div>

        {/* Column 2 */}
        <div className="space-y-8">
          <BoxContainer className="border-border dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
                    Billing & Plan
                  </h4>
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">
                    Pro
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-wide">
                  Available on Cloud
                </p>
              </div>
              <PrimaryButton
                type="Primary"
                title="Save Changes"
                onClick={handleBillingSave}
                disabled={true}
                className="scale-90"
              />
            </div>

            <div className="space-y-6 opacity-60 pointer-events-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isLoading ? (
                  <div className="space-y-1">
                    <div className="h-5 w-24 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="w-full h-11 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse" />
                  </div>
                ) : (
                  <DropdownSelect
                    label="Current Plan"
                    placeholderText={billing.currentPlan}
                    dropdownItem={[
                      { value: "Business", title: "Business" },
                      { value: "Premium", title: "Premium" },
                    ]}
                    onChange={(val: string) =>
                      setBilling((prev: BillingState) => ({
                        ...prev,
                        currentPlan: val,
                      }))
                    }
                  />
                )}
                {isLoading ? (
                  <div className="space-y-1">
                    <div className="h-5 w-24 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="w-full h-11 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse" />
                  </div>
                ) : (
                  <DropdownSelect
                    label="Billing Cycle"
                    placeholderText={billing.billingCycle}
                    dropdownItem={[
                      { value: "Yearly", title: "Yearly" },
                      { value: "Monthly", title: "Monthly" },
                    ]}
                    onChange={(val: string) =>
                      setBilling((prev: BillingState) => ({
                        ...prev,
                        billingCycle: val,
                      }))
                    }
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Billing Address
                </label>
                {isLoading ? (
                  <div className="w-full h-24 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse" />
                ) : (
                  <textarea
                    className="w-full text-xs p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-lg h-24 resize-none transition-all focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 outline-none"
                    value={billing.address}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setBilling((prev: BillingState) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800">
                {isLoading ? (
                  <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                ) : (
                  <ToggleSwitchComponent
                    label="Auto-renew"
                    enabled={billing.enableAutoRenew}
                    onChange={(val: boolean) =>
                      setBilling((prev: BillingState) => ({
                        ...prev,
                        enableAutoRenew: val,
                      }))
                    }
                  />
                )}
                <PrimaryButton
                  type="Outline"
                  title="Upgrade"
                  disabled={true}
                  className="scale-75 origin-right"
                />
              </div>
            </div>
          </BoxContainer>

          <Notification title="Notification Settings" />
          {/* Full width row at bottom for API Connections */}
          {/* <div className="">
            <BoxContainer className="shadow-sm border-border dark:bg-slate-900 dark:border-slate-800">
              <h4 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-6">
                API Connections
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                <APIConnectionCard
                  name="Slack"
                  status="Active"
                  icon="/slack.png"
                  lastSynced="Today"
                />
                <APIConnectionCard
                  name="Salesforce"
                  status="Pending"
                  icon="/salesforce.png"
                  lastSynced="Today"
                />
                <APIConnectionCard
                  name="AWS S3"
                  status="Active"
                  icon="/aws.png"
                  lastSynced="Today"
                />
              </div>
            </BoxContainer>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ClientSettings;
