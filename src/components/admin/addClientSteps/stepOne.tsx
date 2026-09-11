"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FormData } from "@/types/form-types";
import { CustomCheckBox } from "@/components/ui/CustomCheckBox";

export function StepOne() {
  const { control, watch } = useFormContext<FormData>();
  const isReferred = watch("isReferred");
  return (
    <div className="space-y-8">
      {/* Company Information */}
      <div>
        <h3 className="text-xl font-medium text-blue-600 mb-4">
          Company Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md">Client Name *</FormLabel>
                <Input
                  className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500"
                  placeholder="Enter Client company name"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md">Email *</FormLabel>
                <Input
                  className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500"
                  type="email"
                  placeholder="Enter your email"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="contactPersonName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md">Contact Person Name *</FormLabel>
                <Input
                  className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500"
                  placeholder="Enter company contact person name"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md">Phone number *</FormLabel>
                <div className="flex">
                  <select className="appearance-none px-3 py-1 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-sm">
                    <option>US</option>
                  </select>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    {...field}
                    className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500 rounded-l-none"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md">Password *</FormLabel>
                <Input
                  type="password"
                  className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500"
                  placeholder="Enter a secure password"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="isReferred"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3 mt-6">
              <CustomCheckBox checked={field.value} onChange={field.onChange} />
              <FormLabel className="text-md font-medium text-gray-800">
                Client is referred by a partner or contact
              </FormLabel>
            </FormItem>
          )}
        />
      </div>

      {/* Referrer Information */}
      {isReferred && (
        <div>
          <h3 className="text-xl font-medium text-blue-600 mb-4">
            Referrer Information
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={control}
              name="referrerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Name *</FormLabel>
                  <Input
                    className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500"
                    placeholder="Enter referrer name"
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="referrerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter referrer email"
                    value={field.value || ""}
                    onChange={field.onChange}
                    className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="referrerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Phone number *</FormLabel>
                  <div className="flex">
                    <select className="appearance-none px-3 py-1 border border-gray-300 border-r-0 rounded-l-md bg-gray-50 text-sm">
                      <option>US</option>
                    </select>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={field.value || ""}
                      onChange={field.onChange}
                      className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500 rounded-l-none"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="discoverySource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">
                    How did this client hear about us?
                  </FormLabel>
                  <Textarea
                    placeholder="e.g. Social Media, Google, Friend, etc"
                    value={field.value || ""}
                    onChange={field.onChange}
                    rows={3}
                    className="border border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:border-2 focus:border-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Not visible to client
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
