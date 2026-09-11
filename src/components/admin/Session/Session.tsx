import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SessionSettings {
  sessionTimeout: string;
  maxConcurrentSessions: string;
  idleSessionTimeout: string;
  forceReAuthentication: boolean;
  rememberDevice: boolean;
}

const Session: React.FC = () => {
  const [settings, setSettings] = useState<SessionSettings>({
    sessionTimeout: '2 hour',
    maxConcurrentSessions: '4',
    idleSessionTimeout: '5 minute before',
    forceReAuthentication: true,
    rememberDevice: true
  });

  const [dropdownStates, setDropdownStates] = useState({
    sessionTimeout: false,
    maxConcurrentSessions: false,
    idleSessionTimeout: false
  });
  const timeoutOptions = ['30 minute', '1 hour', '2 hour', '4 hour', '8 hour', '24 hour'];
  const sessionOptions = ['1', '2', '3', '4', '5', '10', 'Unlimited'];
  const idleTimeoutOptions = ['1 minute before', '5 minute before', '10 minute before', '15 minute before', '30 minute before'];

  const toggleDropdown = (dropdown: keyof typeof dropdownStates) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const handleSelectOption = (field: keyof SessionSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setDropdownStates(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const handleToggle = (field: keyof Pick<SessionSettings, 'forceReAuthentication' | 'rememberDevice'>) => {
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
                onClick={() => handleSelectOption(field as keyof SessionSettings, option)}
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
    <div className="w-[49.5%] bg-white p-6 rounded-lg border border-gray-200">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">
        Session Settings
      </h1>

      <DropdownField
        label="Session Timeout"
        value={settings.sessionTimeout}
        options={timeoutOptions}
        field="sessionTimeout"
      />

      <DropdownField
        label="Max Concurrent Sessions per User"
        value={settings.maxConcurrentSessions}
        options={sessionOptions}
        field="maxConcurrentSessions"
      />

      <DropdownField
        label="Idle Session Timeout Warning"
        value={settings.idleSessionTimeout}
        options={idleTimeoutOptions}
        field="idleSessionTimeout"
      />

      <ToggleField
        label="Force Re-authentication for Sensitive Actions"
        checked={settings.forceReAuthentication}
        onToggle={() => handleToggle('forceReAuthentication')}
      />

      <ToggleField
        label="Remember Device Option"
        checked={settings.rememberDevice}
        onToggle={() => handleToggle('rememberDevice')}
      />
    </div>
  );
};

export default Session;