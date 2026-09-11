import React, { useState } from 'react';
import { ChevronDown, Mail, Info } from 'lucide-react';

const ManageBillings: React.FC = () => {
    const [currentPlan, setCurrentPlan] = useState('Business');
    const [billingCycle, setBillingCycle] = useState('Business');
    const [customPrice, setCustomPrice] = useState(' ');
    const [discountCode, setDiscountCode] = useState('');
    const [autoRenew, setAutoRenew] = useState(true);
    const [trialPeriod, setTrialPeriod] = useState(true);
    const [billingContact, setBillingContact] = useState('');
    const [billingEmail, setBillingEmail] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Stripe');
    const [taxNumber, setTaxNumber] = useState('');
    const [billingAddress, setBillingAddress] = useState(` `);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-12 gap-6">
                    {/* Main Content */}
                    <div className="col-span-8">
                        <div className="bg-white rounded-lg border border-gray-200">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h1 className="text-lg font-medium text-blue-600">Subscription Settings</h1>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-8">
                                {/* Plan Settings Section */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Plan</label>
                                        <div className="relative">
                                            <select
                                                value={currentPlan}
                                                onChange={(e) => setCurrentPlan(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                            >
                                                <option value="Business">Business</option>
                                                <option value="Professional">Professional</option>
                                                <option value="Enterprise">Enterprise</option>
                                                <option value="Starter">Starter</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle</label>
                                        <div className="relative">
                                            <select
                                                value={billingCycle}
                                                onChange={(e) => setBillingCycle(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                            >
                                                <option value="Business">Business</option>
                                                <option value="Monthly">Monthly</option>
                                                <option value="Quarterly">Quarterly</option>
                                                <option value="Annually">Annually</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Price and Discount */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Custom Price <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                            <input
                                                type="text"
                                                placeholder=''
                                                value={customPrice}
                                                onChange={(e) => setCustomPrice(e.target.value)}
                                                className="w-full pl-8 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <Info className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Discount/Promo Code <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <button className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium text-gray-700 hover:bg-gray-200">
                                                Applied
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Toggle Switches */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Auto Renew</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={autoRenew}
                                                onChange={(e) => setAutoRenew(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Trial Period</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={trialPeriod}
                                                onChange={(e) => setTrialPeriod(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Usage Overview Section */}
                                <div>
                                    <h3 className="text-sm font-medium text-blue-600 mb-4">Usage Overview</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Project Created</span>
                                                <span className="font-medium">9/10</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Total Users</span>
                                                <span className="font-medium">250/500</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Storage Usage</span>
                                                <span className="font-medium">5.5GB/12.0GB</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '46%' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 text-xs text-gray-500 space-x-4">
                                        <span>Native Add-ons</span>
                                        <span>Custom Branding</span>
                                        <span>Chart Library</span>
                                    </div>
                                </div>

                                {/* Billing Information Section */}
                                <div>
                                    <h3 className="text-sm font-medium text-blue-600 mb-4">Billing Information</h3>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Billing Contact Person <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={billingContact}
                                                placeholder='Jhon Ibne Sinha'
                                                onChange={(e) => setBillingContact(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Billing Email <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={billingEmail}
                                                    placeholder='service.xyz@builder.io'
                                                    onChange={(e) => setBillingEmail(e.target.value)}
                                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <Info className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                            <div className="flex items-center space-x-2">
                                                
                                                <div className="relative flex-1">
                                                    <select
                                                        value={paymentMethod}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md  bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                                    >
                                                        <option value="Stripe">Stripe</option>
                                                        <option value="PayPal">PayPal</option>
                                                        <option value="Bank Transfer">Bank Transfer</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tax ID/VAT Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder='THETADEPLOY26'
                                                value={taxNumber}
                                                onChange={(e) => setTaxNumber(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Billing Address <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={billingAddress}
                                            placeholder="123 Business Ave, Suite 500, San Francisco, CA 94105"
                                            onChange={(e) => setBillingAddress(e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        />

                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between pt-4">
                                    <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
                                        Cancel
                                    </button>
                                    <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-4">
                        <div className="space-y-4">
                            {/* Builder.io Header */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-gray-900">BUILDER.IO</span>
                                    </div>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                        Active
                                    </span>
                                </div>
                            </div>

                            {/* Current Plan Info */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h3 className="font-medium text-gray-900 mb-3">Current Plan</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Plan:</span>
                                        <span className="font-medium">Business</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Billing Cycle:</span>
                                        <span className="font-medium">Yearly</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Next Renewal:</span>
                                        <span className="font-medium">15 May 2026</span>
                                    </div>
                                </div>
                            </div>

                            {/* Account Info */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h3 className="font-medium text-gray-900 mb-3">Account Info</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trial Period:</span>
                                        <span className="font-medium">Completed</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trial Duration:</span>
                                        <span className="font-medium">30 Day</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Joined:</span>
                                        <span className="font-medium">1 Feb 2024</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageBillings;