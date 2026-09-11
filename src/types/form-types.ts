import { z } from "zod"

export const formSchema = z.object({
  // Step 1 - Create Account
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Please enter a valid email address"),
  contactPersonName: z.string().min(1, "Contact person name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  isReferred: z.boolean(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referrerName: z.string().optional(),
  referrerEmail: z.string().email().optional().or(z.literal("")),
  referrerPhone: z.string().optional(),
  discoverySource: z.string().optional(),

  // Step 2 - Branding & Layout
  logo: z.any().optional(),
  favicon: z.any().optional(),
  primaryColor: z.string().min(1, "Primary color is required"),
  secondaryColor: z.string().min(1, "Secondary color is required"),
  showFooter: z.boolean(),
  customFooterText: z.string().optional(),
  supportContactLink: z.string().optional(),

  // Step 3 - Add Instance
  subdomain: z.string().min(1, "Subdomain is required"),
  region: z.string().optional(),
  timeZone: z.string().optional(),
  language: z.string().optional(),
  enableOnboarding: z.boolean(),
  autoGenDashboard: z.boolean(),
  industryTemplate: z.string().optional(),

  // Step 4 - Test Library
  enableCustomCharts: z.boolean(),
  assignedCharts: z.array(z.string()).default([]),
  notifyDevQATeam: z.boolean().optional(), // kept for UI logic
  selectedTeamMember: z.string().optional(), // kept for UI logic

  // Step 5 - Storage & Subscription
  storageQuotaGb: z.number().min(0, "Storage quota is required"),
  archiveThreshold: z.number().optional().or(z.literal(0)),
  archiveAfterDays: z.number().optional().or(z.literal(0)),
  usageWarningAlert: z.boolean(),
  billingCycle: z.string().min(1, "Billing cycle is required"),
  subscriptionPlan: z.string().min(1, "Subscription plan is required"),
  discountCode: z.string().optional(),
  startBillingDate: z.string().min(1, "Start billing date is required"),
  trialPeriodDays: z.number().optional().or(z.literal(0)),
  paymentMethod: z.string().optional(),
  internalNotes: z.string().optional(),
})

export type FormData = z.infer<typeof formSchema>
