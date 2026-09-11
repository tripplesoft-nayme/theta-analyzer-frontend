import { ClientBilling } from '../types/clientBilling';
import clientBillingsData from '../../../../lib/clientBillingsData.json';

// Simulate API calls - in a real app, these would be actual API endpoints
export const clientBillingService = {
  // Get all client billings
  getClientBillings: async (): Promise<ClientBilling[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return clientBillingsData;
  },

  // Get client billing by ID
  getClientBillingById: async (id: string): Promise<ClientBilling | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return clientBillingsData.find(client => client.id === id);
  },

  // Update client billing
  updateClientBilling: async (updatedClient: ClientBilling): Promise<ClientBilling> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    // In a real app, this would make an API call to update the data
    return updatedClient;
  },

  // Search client billings
  searchClientBillings: async (searchTerm: string): Promise<ClientBilling[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return clientBillingsData.filter(client =>
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  // Filter client billings
  filterClientBillings: async (filters: {
    planType?: string;
    status?: string;
  }): Promise<ClientBilling[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let filteredData = [...clientBillingsData];
    
    if (filters.planType && filters.planType !== 'Plan Type') {
      filteredData = filteredData.filter(client => client.planType === filters.planType);
    }
    
    if (filters.status && filters.status !== 'Status') {
      filteredData = filteredData.filter(client => client.status === filters.status);
    }
    
    return filteredData;
  }
};