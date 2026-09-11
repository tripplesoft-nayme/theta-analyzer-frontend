import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface EncryptionSettings {
  encryptionType: string;
  accessTokenExpiry: string;
  idleSessionTimeout: string;
  webhookSignatureValidation: boolean;
  keyRotationPolicy: string;
}

const DataEncryption: React.FC = () => {
  const [settings, setSettings] = useState<EncryptionSettings>({
    encryptionType: 'AES-256',
    accessTokenExpiry: '24',
    idleSessionTimeout: '5 minute before',
    webhookSignatureValidation: true,
    keyRotationPolicy: 'Monthly'
  });

  const [dropdownStates, setDropdownStates] = useState({
    encryptionType: false,
    accessTokenExpiry: false,
    idleSessionTimeout: false,
    keyRotationPolicy: false
  });

  const encryptionOptions = ['AES-256', 'AES-128', 'RSA-2048', 'ChaCha20'];
  const expiryOptions = ['1', '6', '12', '24', '48', '72'];
  const timeoutOptions = ['1 minute before', '5 minute before', '10 minute before', '15 minute before', '30 minute before'];
  const rotationOptions = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'];

  const toggleDropdown = (dropdown: keyof typeof dropdownStates) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const handleSelectOption = (field: keyof EncryptionSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setDropdownStates(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const handleToggle = () => {
    setSettings(prev => ({
      ...prev,
      webhookSignatureValidation: !prev.webhookSignatureValidation
    }));
  };

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
                onClick={() => handleSelectOption(field as keyof EncryptionSettings, option)}
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
        Data Encryption Settings
      </h1>

      <DropdownField
        label="Encryption Type"
        value={settings.encryptionType}
        options={encryptionOptions}
        field="encryptionType"
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

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Webhook Signature Validation
          </label>
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer focus:ring-offset-2 ${
              settings.webhookSignatureValidation 
                ? 'bg-blue-600' 
                : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.webhookSignatureValidation 
                  ? 'translate-x-6' 
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <DropdownField
        label="Key Rotation Policy"
        value={settings.keyRotationPolicy}
        options={rotationOptions}
        field="keyRotationPolicy"
      />
    </div>
  );
};

export default DataEncryption;