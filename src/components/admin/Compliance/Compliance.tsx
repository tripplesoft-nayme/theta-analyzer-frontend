import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ComplianceSettings {
  gdprCompliance: boolean;
  hipaaCompliance: boolean;
  soc2AuditLogging: boolean;
  dataRetentionPeriod: string;
  accessTokenExpiry: string;
  idleSessionTimeout: string;
}

const Compliance: React.FC = () => {
  const [settings, setSettings] = useState<ComplianceSettings>({
    gdprCompliance: true,
    hipaaCompliance: true,
    soc2AuditLogging: true,
    dataRetentionPeriod: '1 year',
    accessTokenExpiry: '24',
    idleSessionTimeout: '5 minute before'
  });

  const [dropdownStates, setDropdownStates] = useState({
    dataRetentionPeriod: false,
    accessTokenExpiry: false,
    idleSessionTimeout: false
  });

  const retentionOptions = ['3 months', '6 months', '1 year', '2 years', '3 years', '5 years', '7 years'];
  const expiryOptions = ['1', '6', '12', '24', '48', '72'];
  const timeoutOptions = ['1 minute before', '5 minute before', '10 minute before', '15 minute before', '30 minute before'];

  const toggleDropdown = (dropdown: keyof typeof dropdownStates) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const handleSelectOption = (field: keyof ComplianceSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setDropdownStates(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const handleToggle = (field: keyof Pick<ComplianceSettings, 'gdprCompliance' | 'hipaaCompliance' | 'soc2AuditLogging'>) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const ToggleField: React.FC<{
    label: string;
    checked: boolean;
    onToggle: () => void;
  }> = ({ label, checked, onToggle }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer focus:ring-offset-2 ${
            checked 
              ? 'bg-blue-600' 
              : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              checked 
                ? 'translate-x-6' 
                : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  const DropdownField: React.FC<{
    label: string;
    value: string;
    options: string[];
    field: keyof typeof dropdownStates;
  }> = ({ label, value, options, field }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => toggleDropdown(field)}
          className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <span>{value}</span>
          <ChevronDown 
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 transition-transform ${
              dropdownStates[field] ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {dropdownStates[field] && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelectOption(field as keyof ComplianceSettings, option)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-[50%] bg-white p-6 rounded-lg border border-gray-200">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">
        Compliance Settings
      </h1>

      <ToggleField
        label="GDPR Compliance Mode"
        checked={settings.gdprCompliance}
        onToggle={() => handleToggle('gdprCompliance')}
      />

      <ToggleField
        label="HIPAA Compliance Mode"
        checked={settings.hipaaCompliance}
        onToggle={() => handleToggle('hipaaCompliance')}
      />

      <ToggleField
        label="SOC 2 Audit Logging"
        checked={settings.soc2AuditLogging}
        onToggle={() => handleToggle('soc2AuditLogging')}
      />

      <DropdownField
        label="Data Retention Period"
        value={settings.dataRetentionPeriod}
        options={retentionOptions}
        field="dataRetentionPeriod"
      />

      <DropdownField
        label="Access Token Expiry (hours)"
        value={settings.accessTokenExpiry}
        options={expiryOptions}
        field="accessTokenExpiry"
      />

      <DropdownField
        label="Idle Session Timeout Warning"
        value={settings.idleSessionTimeout}
        options={timeoutOptions}
        field="idleSessionTimeout"
      />
    </div>
  );
};

export default Compliance;