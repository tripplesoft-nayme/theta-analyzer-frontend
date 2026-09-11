/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Pause,
  Ticket,
} from "lucide-react";
import ClientInfoCards from "@/components/admin/clientInfoCards/clientInfoCards";
import ClientSingleOverviewTab from "@/components/admin/clientSingleOverView/ClientSingleOverviewTab";
import ClientPrograms from "@/components/admin/clientSingleProgramsTab/clientSingleProgramTab";
import ClientSingleActiveAlerts from "@/components/admin/clientSingleAlerts/ClientSingleActiveAlerts";
import ClientSingleSubscriptionTab from "@/components/admin/clientSingleSubscriptionDetails/ClientSingleSubscriptionTab";
import ClientSingleActivityLog from "@/components/admin/clientSingleActivityLog/clientSingleActivityLog";

export function SingleClient() {
  const [customers, setCustomers] = useState<any[]>([]);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    fetch("/customerData.json")
      .then((res) => res.json())
      .then((data) => setCustomers(data));
  }, []);

  const userData = customers.find((c) => c.id === Number(id));
  if (!userData) return <p>Client not found</p>;

  // Fix: actual data is inside userData.user
  console.log(userData);
  const {
    client,
    metrics,
    planSummary,
    programs,
    alertsList,
    invoices,
    activityLog,
  } = userData.user;
  const { plan } = userData.user.client;

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Metrics Cards */}
        <ClientInfoCards metrics={metrics} />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger className="cursor-pointer" value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="program">
              Program
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="alerts">
              Alerts
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="subscription">
              Subscription
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="activity">
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ClientSingleOverviewTab planSummary={planSummary} />
          </TabsContent>

          <TabsContent value="program" className="mt-6">
            <ClientPrograms programs={programs} />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <ClientSingleActiveAlerts alerts={alertsList} />
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <ClientSingleSubscriptionTab
              invoices={invoices}
              subscription={plan}
            />
          </TabsContent>
          <TabsContent value="activity" className="mt-6">
            <ClientSingleActivityLog activityLogs={activityLog} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white px-6">
        <div className="space-y-6">
          {/* Client Information */}
          <div className="border border-gray-200 px-5 py-5 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Client Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">{client.company}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Primary Contact</p>
                  <p className="font-medium">{client.primaryContact}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-blue-600">{client.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{client.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Info */}
          <div className="border border-gray-200 px-5 py-5 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Plan Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Current Plan:</p>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 mt-1"
                >
                  {client.plan.current}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Billing Cycle:</p>
                <p className="font-medium">{client.plan.billingCycle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Renewal:</p>
                <p className="font-medium">{client.plan.nextRenewal}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status:</p>
                <Badge className="bg-green-100 text-green-800 mt-1">
                  {client.plan.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Action</h3>
            <div className="space-y-3">
              <Button
                className="w-full justify-start gap-2 bg-transparent"
                variant="outline"
              >
                <Pause className="w-4 h-4" />
                Suspend Client
              </Button>
              <Button
                className="w-full justify-start gap-2 bg-transparent"
                variant="outline"
              >
                <Ticket className="w-4 h-4" />
                View Support Tickets
                <Badge variant="secondary" className="ml-auto">
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
