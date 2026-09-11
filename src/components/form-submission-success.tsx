import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Download, Home, RefreshCw } from "lucide-react"
import type { FormData } from "@/types/form-types"

interface FormSubmissionSuccessProps {
  formData: FormData
  onStartOver: () => void
  onGoHome: () => void
}

export function FormSubmissionSuccess({ formData, onStartOver, onGoHome }: FormSubmissionSuccessProps) {
  const handleDownloadSummary = () => {
    const summary = {
      submissionDate: new Date().toISOString(),
      name: formData.name,
      email: formData.email,
      subdomain: formData.subdomain,
      subscriptionPlan: formData.subscriptionPlan,
      billingCycle: formData.billingCycle,
      storageQuotaGb: formData.storageQuotaGb,
    }

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formData.name}-submission-summary.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Success Icon and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Congratulations!</h1>
          <p className="text-xl text-muted-foreground text-balance">
            Your multilevel form has been successfully submitted
          </p>
        </div>

        {/* Success Details Card */}
        <Card className="mb-8 border border-border shadow-lg">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Client Information</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Name:</span> {formData.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {formData.email}
                    </p>
                    <p>
                      <span className="font-medium">Contact:</span> {formData.contactPersonName}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Instance Details</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Subdomain:</span> {formData.subdomain}
                    </p>
                    <p>
                      <span className="font-medium">Region:</span> {formData.region}
                    </p>
                    <p>
                      <span className="font-medium">Timezone:</span> {formData.timeZone}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Subscription</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Plan:</span> {formData.subscriptionPlan}
                    </p>
                    <p>
                      <span className="font-medium">Billing:</span> {formData.billingCycle}
                    </p>
                    <p>
                      <span className="font-medium">Storage:</span> {formData.storageQuotaGb} GB
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">What's Next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Our team will review your submission</li>
                    <li>• You'll receive a confirmation email within 24 hours</li>
                    <li>• Setup will begin once approved</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownloadSummary} variant="outline" className="flex items-center gap-2 bg-transparent cursor-pointer">
            <Download className="w-4 h-4" />
            Download Summary
          </Button>
          <Button onClick={onStartOver} variant="outline" className="flex items-center gap-2 bg-transparent cursor-pointer">
            <RefreshCw className="w-4 h-4" />
            Submit Another Form
          </Button>
          <Button onClick={onGoHome} className="flex items-center gap-2 cursor-pointer">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Need help? Contact our support team at support@company.com</p>
        </div>
      </div>
    </div>
  )
}
