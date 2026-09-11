import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormData } from "@/types/form-types";
import { CustomCheckBox } from "@/components/ui/CustomCheckBox";

export function StepFive() {
  const { watch, setValue } = useFormContext<FormData>();
  const formData = watch();

  const updateFormData = (data: Partial<FormData>) => {
    Object.entries(data).forEach(([key, value]) => {
      setValue(key as keyof FormData, value, { shouldValidate: true });
    });
  };

  return (
    <div className="space-y-8">
      {/* Storage Configuration */}
      <div>
        <h3 className="text-xl font-medium text-blue-600 mb-4">
          Storage Configuration
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-md" htmlFor="storageQuotaGb">
              Storage Quota (GB) *
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="storageQuotaGb"
                type="number"
                placeholder="e.g 10 GB"
                value={formData.storageQuotaGb || ""}
                onChange={(e) =>
                  updateFormData({ storageQuotaGb: Number(e.target.value) })
                }
                className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500"
              />
            </div>
          </div>
          <div>
            <Label className="text-md" htmlFor="archiveAfterDays">
              Archive after (Days) *
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="archiveAfterDays"
                type="number"
                placeholder="e.g 90 days"
                value={formData.archiveAfterDays || ""}
                onChange={(e) =>
                  updateFormData({ archiveAfterDays: Number(e.target.value) })
                }
                className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-4">
            <CustomCheckBox
              checked={formData.usageWarningAlert || false}
              onChange={(checked) =>
                updateFormData({ usageWarningAlert: checked })
              }
            />
            <Label className="text-md" htmlFor="usageWarningAlert">
              Enable usage warning alerts
            </Label>
          </div>
          <p className="text-sm text-gray-600">
            Send alert when client reaches 80% of capacity
          </p>

          <div className="mt-4">
            <Label className="text-md" htmlFor="archiveThreshold">
              Auto-Archive Threshold (%) *
            </Label>
            <Input
              id="archiveThreshold"
              type="number"
              placeholder="e.g 85%"
              value={formData.archiveThreshold || ""}
              onChange={(e) =>
                updateFormData({ archiveThreshold: Number(e.target.value) })
              }
              className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500 mt-1 max-w-xs"
            />
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div>
        <h3 className="text-xl text-lg font-medium text-blue-600 mb-4">
          Billing Information
        </h3>

        <div className="mb-6">
          <Label>Billing Cycle</Label>
          <div className="flex gap-2 mt-2">
            {[
              { value: "MONTHLY", label: "Monthly" },
              {
                value: "HALFYEARLY",
                label: "Half-Yearly",
                discount: "Save up to 10% Annually",
              },
              {
                value: "YEARLY",
                label: "Yearly",
                discount: "Save 15% Annually",
              },
              {
                value: "TWOYEARLY",
                label: "2-Yearly",
                discount: "Save 20% Annually",
              },
              {
                value: "ENTERPRISE",
                label: "Enterprise",
                discount: "Custom Billing",
              },
            ].map((option) => (
              <div key={option.value} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => updateFormData({ billingCycle: option.value })}
                  className={`px-4 py-2 rounded-md border text-sm font-medium ${
                    formData.billingCycle === option.value
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
                {option.discount && (
                  <span className="text-xs text-green-600 mt-1">
                    {option.discount}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => updateFormData({ billingCycle: "Enterprise" })}
              className={`px-4 py-2 rounded-md border text-sm font-medium ${
                formData.billingCycle === "Enterprise"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Enterprise
            </button>
            <span className="text-xs text-blue-600 ml-2">Custom Billing</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-md" htmlFor="subscriptionPlan">
              Subscription Plan *
            </Label>
            <Select
              value={formData.subscriptionPlan || ""}
              onValueChange={(value) =>
                updateFormData({ subscriptionPlan: value })
              }
            >
              <SelectTrigger className="mt-1 border border-gray-300">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent className="bg-white border-none">
                <SelectItem value="basic">Basic Plan</SelectItem>
                <SelectItem value="professional">Professional Plan</SelectItem>
                <SelectItem value="enterprise">Enterprise Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-md" htmlFor="discountCode">
              Discount/Promotions
            </Label>
            <Input
              id="discountCode"
              placeholder="Enter discount rate or promo code here"
              value={formData.discountCode || ""}
              onChange={(e) => updateFormData({ discountCode: e.target.value })}
              className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500 mt-1"
            />
          </div>
          <div>
            <Label className="text-md" htmlFor="startBillingDate">
              Start Billing Date
            </Label>
            <Input
              id="startBillingDate"
              type="date"
              value={formData.startBillingDate || ""}
              onChange={(e) =>
                updateFormData({ startBillingDate: e.target.value })
              }
              className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500 mt-2"
            />
          </div>
          <div>
            <Label className="text-md" htmlFor="trialPeriodDays">
              Trial Period
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="trialPeriodDays"
                type="number"
                placeholder="e.g. 15 Days"
                value={formData.trialPeriodDays || ""}
                onChange={(e) =>
                  updateFormData({ trialPeriodDays: Number(e.target.value) })
                }
                className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500"
              />
            </div>
          </div>
          <div>
            <Label className="text-md" htmlFor="paymentMethod">
              Client's Preferred Payment Method *
            </Label>
            <Select
              value={formData.paymentMethod || ""}
              onValueChange={(value) =>
                updateFormData({ paymentMethod: value })
              }
            >
              <SelectTrigger className="mt-2 border border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-none">
                <SelectItem value="Stripe">Stripe</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-md" htmlFor="discountCodeSecond">
              Discount/Promotions
            </Label>
            <Input
              id="discountCodeSecond"
              placeholder="Enter discount rate or promo code here"
              value={formData.discountCode || ""}
              onChange={(e) => updateFormData({ discountCode: e.target.value })}
              className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Internal Notes */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <CustomCheckBox
            checked={!!formData.internalNotes || false}
            onChange={(checked) =>
              updateFormData({
                internalNotes: checked ? formData.internalNotes || " " : "",
              })
            }
          />
          <Label htmlFor="internalNotesToggle">Internal Notes</Label>
        </div>

        {formData.internalNotes !== undefined &&
          formData.internalNotes !== "" && (
            <div>
              <h4 className="text-blue-600 font-medium mb-2 text-md">
                Internal Notes for Admin only
              </h4>
              <div>
                <Label htmlFor="internalNotes">Admin Note</Label>
                <Textarea
                  id="internalNotes"
                  placeholder="e.g. Custom instance setup required for this client."
                  value={formData.internalNotes || ""}
                  onChange={(e) =>
                    updateFormData({ internalNotes: e.target.value })
                  }
                  className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500 mt-2"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Not visible to client
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
