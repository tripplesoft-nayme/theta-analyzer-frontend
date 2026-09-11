export interface ClientBilling {
    id: string;
    clientId: string;
    companyName: string;
    companyLogo: string;
    subscriptionPlan: string;
    planType: string;
    billingCycle: string;
    renewsDate: string;
    status: string;
    paymentMethod?: string;
}