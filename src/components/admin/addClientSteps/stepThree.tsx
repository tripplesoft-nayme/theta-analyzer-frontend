import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Globe, Server } from "lucide-react"
import type { FormData } from "@/types/form-types"
import { CustomCheckBox } from "@/components/ui/CustomCheckBox"

export function StepThree() {
  const { control, watch } = useFormContext<FormData>()
  const subdomain = watch("subdomain")
  const region = watch("region")

  return (
    <div className="space-y-8">
      {/* Company Configuration */}
      <div>
        <h3 className="text-xl font-medium text-blue-600 mb-4">Company Configuration</h3>
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={control}
            name="subdomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md">Subdomain *</FormLabel>
                <div className="flex items-center mt-1">
                  <Input
                    placeholder="Enter company name"
                    value={field.value}
                    onChange={field.onChange}
                    className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500 rounded-r-none"
                  />
                  <div className="px-3 py-2 bg-gray-50 rounded-r-md text-sm text-gray-600">
                    .thetaanalyzer.com
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md">Region/Server Location *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1 border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-none">
                    <SelectItem value="US-East">US-East</SelectItem>
                    <SelectItem value="US-West">US-West</SelectItem>
                    <SelectItem value="EU-Central">EU-Central</SelectItem>
                    <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="timeZone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md">Time zone</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1 border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-white">
                    <SelectItem value="[UTC-05:00] Eastern Time (US & Canada)">
                      [UTC-05:00] Eastern Time (US & Canada)
                    </SelectItem>
                    <SelectItem value="[UTC-08:00] Pacific Time (US & Canada)">
                      [UTC-08:00] Pacific Time (US & Canada)
                    </SelectItem>
                    <SelectItem value="[UTC+00:00] Greenwich Mean Time">[UTC+00:00] Greenwich Mean Time</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md">Default Language</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1 border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-none">
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* System Setup */}
      <div>
        <h3 className="text-xl font-medium text-blue-600 mb-4">System Setup</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={control}
              name="enableOnboarding"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <CustomCheckBox checked={field.value} onChange={field.onChange} />
                  <FormLabel>Enable Onboarding Guide</FormLabel>
                </FormItem>
              )}
            />
            <p className="text-sm text-gray-600">Client will see onboarding steps and feature checklists.</p>
          </div>
          <div className="space-y-4">
            <FormField
              control={control}
              name="autoGenDashboard"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <CustomCheckBox checked={field.value} onChange={field.onChange} />
                  <FormLabel>Auto-Generate Welcome Dashboard</FormLabel>
                </FormItem>
              )}
            />
            <p className="text-sm text-gray-600">Create a default dashboard with 3 KPIs and 1 chart.</p>
          </div>
        </div>

        <div className="mt-6">
          <FormField
            control={control}
            name="industryTemplate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md">Assign Industry Template *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-3 max-w-xs border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white cursor-pointer border-none">
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Instance Preview */}
      <div>
        <h3 className="text-xl font-medium text-blue-600 mb-4">Instance Preview</h3>
        <div className="grid grid-cols-2 gap-6">
          <Card className="border border-gray-300">
            <CardContent className="p-4 flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium">Client URL</p>
                <p className="text-sm text-gray-600">{subdomain || "acme"}.thetaanalyzer.com</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-300">
            <CardContent className="p-4 flex items-center gap-3">
              <Server className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium">Server Location</p>
                <p className="text-sm text-gray-600">{region} (Virginia)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
