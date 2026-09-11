/* eslint-disable @typescript-eslint/no-explicit-any */
import { StepOne } from "@/components/admin/addClientSteps/stepOne";
import { StepTwo } from "@/components/admin/addClientSteps/stepTwo";
import { StepThree } from "@/components/admin/addClientSteps/stepThree";
import { StepFour } from "@/components/admin/addClientSteps/stepFour";
import { StepFive } from "@/components/admin/addClientSteps/stepFive";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FormSubmissionSuccess } from "@/components/form-submission-success";
import { formSchema, type FormData } from "@/types/form-types";
import { useCreateClientMutation } from "@/store/Api/AdminApi/ClientApi";

const steps = [
  {
    id: 1,
    title: "Create Account",
    description: "Add new clients to your Theta analyzers",
  },
  {
    id: 2,
    title: "Branding & Layout",
    description: "Define the visual and layout preferences for this client",
  },
  {
    id: 3,
    title: "Add Instance",
    description: "Set up the technical environment for the client account",
  },
  {
    id: 4,
    title: "Test All Library",
    description: "Verify all selected charts render and function correctly",
  },
  {
    id: 5,
    title: "Storage & Subscription",
    description:
      "Configure client's storage limits, billing plan, and optional modules",
  },
];

export default function MultiLevelForm() {
  const [createClient] = useCreateClientMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Step 1 - Create Account
      name: "",
      email: "",
      contactPersonName: "",
      phoneNumber: "",
      isReferred: false,
      password: "",
      referrerName: "",
      referrerEmail: "",
      referrerPhone: "",
      discoverySource: "",

      // Step 2 - Branding & Layout
      logo: null,
      favicon: null,
      primaryColor: "#7F50D9",
      secondaryColor: "#6366F1",
      showFooter: true,
      customFooterText: "© 2023 Client Company. All rights reserved",
      supportContactLink: "Mail to: support@thetaanalyzer.com",

      // Step 3 - Add Instance
      subdomain: "",
      region: "US-East",
      timeZone: "[UTC-05:00] Eastern Time (US & Canada)",
      language: "English",
      enableOnboarding: true,
      autoGenDashboard: true,
      industryTemplate: "Real Estate",

      // Step 4 - Test Library
      enableCustomCharts: true,
      assignedCharts: [],
      notifyDevQATeam: false,
      selectedTeamMember: "",

      // Step 5 - Storage & Subscription
      storageQuotaGb: 10,
      archiveThreshold: 0,
      archiveAfterDays: 90,
      usageWarningAlert: true,
      billingCycle: "Monthly",
      subscriptionPlan: "",
      startBillingDate: "",
      paymentMethod: "Stripe",
      discountCode: "",
      trialPeriodDays: 15,
      internalNotes: "",
    },
    mode: "onChange",
  });
  type AnyObject = Record<string, any>;

  const { handleSubmit, trigger, reset } = methods;

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate);

    console.log(`[v0] Step ${currentStep} validation:`, {
      isStepValid,
      errors: methods.formState.errors,
    });

    if (isStepValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
      console.log(`[v0] Moving to step ${currentStep + 1}`);
    } else if (!isStepValid) {
      console.log(
        `[v0] Step ${currentStep} validation failed:`,
        methods.formState.errors
      );
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      console.log(`[v0] Moving back to step ${currentStep - 1}`);
    }
  };

  const isEmptyValue = (value: any) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (
      typeof value === "object" &&
      !(value instanceof File) &&
      Object.keys(value).length === 0
    )
      return true;

    return false;
  };

  const buildClientFormData = (payload: AnyObject) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (isEmptyValue(value)) return;

      // File fields
      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      // Arrays
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
        return;
      }

      // Scalars
      formData.append(key, String(value));
    });

    return formData;
  };

  const onSubmit = async (data: FormData) => {
    console.log("[v0] Form submitted successfully:", data);

    try {
      const formData = buildClientFormData(data);
      console.log("[v0] Form data:", JSON.stringify(  formData));
      const result = await createClient(formData).unwrap();
      console.log("[v0] Client creation result:", result);

      setSubmittedData(data);
      setIsSubmitted(true);
    } catch (error) {
      console.error("[v0] Form submission error:", error);
      alert("❌ Error submitting form. Please try again.");
    }
  };

  const handleStartOver = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    setCurrentStep(1);
    reset();
  };

  const handleGoHome = () => {
    console.log("[v0] Navigating to dashboard...");
    alert("Navigating to dashboard...");
  };

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return [
          "name",
          "email",
          "contactPersonName",
          "phoneNumber",
          "password",
        ];
      case 2:
        return ["primaryColor", "secondaryColor"];
      case 3:
        return [
          "subdomain",
          "region",
          "timeZone",
          "language",
          "industryTemplate",
        ];
      case 4:
        return ["enableCustomCharts"];
      case 5:
        return [
          "storageQuotaGb",
          "billingCycle",
          "subscriptionPlan",
          "startBillingDate",
        ];
      default:
        return [];
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOne />;
      case 2:
        return <StepTwo />;
      case 3:
        return <StepThree />;
      case 4:
        return <StepFour />;
      case 5:
        return <StepFive />;
      default:
        return <StepOne />;
    }
  };

  if (isSubmitted && submittedData) {
    return (
      <FormSubmissionSuccess
        formData={submittedData}
        onStartOver={handleStartOver}
        onGoHome={handleGoHome}
      />
    );
  }

  const progressPercentage = (currentStep / 5) * 100;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {steps[currentStep - 1].title}
              </h1>
              <p className="text-gray-600 mt-1">
                {steps[currentStep - 1].description}
              </p>
            </div>
            <div className="flex items-center gap-4">
            </div>
          </div>
          {/* Steps Timeline */}
          <div className="relative mt-10">
            {/* Connecting line */}
            <div className="absolute top-6 left-5 right-5 h-0.5 bg-gray-200 -translate-y-1/2">
              <div
                className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Steps */}
            <div className="flex justify-between relative z-10">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center w-20">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shadow-sm ${
                      currentStep > step.id
                        ? "bg-blue-600 text-white shadow-blue-200"
                        : currentStep === step.id
                        ? "bg-blue-600 text-white shadow-blue-200 ring-4 ring-blue-100"
                        : "bg-white border-2 border-gray-300 text-gray-500"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="text-xs mt-3 text-center max-w-24">
                    <div
                      className={`font-semibold leading-tight ${
                        currentStep >= step.id
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div
                      className={`text-xs mt-1 leading-tight ${
                        currentStep >= step.id
                          ? "text-blue-500"
                          : "text-gray-500"
                      }`}
                    >
                      {step.description.split(" ").slice(0, 3).join(" ")}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Form Content */}
        <Card className="border border-gray-200 shadow-md">
          <CardContent className="p-8">{renderStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            className="cursor-pointer"
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            {currentStep === 1 ? "Cancel" : "← Previous"}
          </Button>

          <Button
            type={currentStep === 5 ? "submit" : "button"}
            onClick={currentStep === 5 ? undefined : nextStep}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            {currentStep === 5 ? "Submit →" : "Next →"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
