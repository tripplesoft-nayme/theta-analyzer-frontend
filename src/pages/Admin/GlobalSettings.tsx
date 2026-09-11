
import { useState } from 'react';
import { Upload, ChevronDown } from 'lucide-react';

const LanguageSettingsPanel = () => {
  const [defaultLanguage, setDefaultLanguage] = useState('English (US)');
  const [defaultTimezone, setDefaultTimezone] = useState('(UTC-08:00) Pacific Time (US & Canada)');
  const [allowTimezoneOverride, setAllowTimezoneOverride] = useState(true);
  const [showRelativeTimestamps, setShowRelativeTimestamps] = useState(true);
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('12 hour');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('Sunday');
  const [primaryColor, setPrimaryColor] = useState('#7F56D9');
  const [secondaryColor, setSecondaryColor] = useState('#6366F1');

  const languages = ['English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Arabic'];
  const timezones = [
    '(UTC-08:00) Pacific Time (US & Canada)',
    '(UTC-07:00) Mountain Time (US & Canada)',
    '(UTC-06:00) Central Time (US & Canada)',
    '(UTC-05:00) Eastern Time (US & Canada)',
    '(UTC+00:00) London',
    '(UTC+01:00) Paris',
    '(UTC+02:00) Athens',
    '(UTC+05:30) India',
  ];
  const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY'];
  const timeFormats = ['12 hour', '24 hour'];
  const weekDays = ['Sunday', 'Monday'];

  return (
    <div className="min-h-screen">
      <div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">
            Language, Date & Time zone Settings
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Default Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Default Language</label>
                <div className="relative">
                  <select
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm"
                  >
                    {languages.map((lang) => (
                      <option key={lang}>{lang}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Default Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Default Timezone</label>
                <div className="relative">
                  <select
                    value={defaultTimezone}
                    onChange={(e) => setDefaultTimezone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm"
                  >
                    {timezones.map((tz) => (
                      <option key={tz}>{tz}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Timezone Override - TOGGLE */}
              <div className="flex items-center gap-1.5">

                <button
                  onClick={() => setAllowTimezoneOverride(!allowTimezoneOverride)}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${allowTimezoneOverride ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${allowTimezoneOverride ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>

                <span className="text-sm text-gray-700">
                  Allow user-level time zone override
                </span>
              </div>


              {/* Date Format & Time Format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Date Format</label>
                  <div className="relative">
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm"
                    >
                      {dateFormats.map((format) => (
                        <option key={format}>{format}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Time Format</label>
                  <div className="relative">
                    <select
                      value={timeFormat}
                      onChange={(e) => setTimeFormat(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm"
                    >
                      {timeFormats.map((format) => (
                        <option key={format}>{format}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* First Day & Show relative timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">First Day of Week</label>
                  <div className="relative">
                    <select
                      value={firstDayOfWeek}
                      onChange={(e) => setFirstDayOfWeek(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm"
                    >
                      {weekDays.map((day) => (
                        <option key={day}>{day}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Show relative timestamps - TOGGLE */}
                <div className="flex flex-col">
                  <div className="flex items-center mb-3 gap-1.5">
                    <button
                      onClick={() => setShowRelativeTimestamps(!showRelativeTimestamps)}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${showRelativeTimestamps ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${showRelativeTimestamps ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                    <span className="text-sm text-gray-700">Show relative timestamps</span>
                  </div>
                  {showRelativeTimestamps && (
                    <div className="px-4 py-3">
                      Sun Day 7/6/2025 9:13 AM
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Branding */}
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900">Default Branding</h2>

              {/* Client Logo + Favicon side by side */}
              <div className="flex  gap-8">
                {/* Client Logo */}
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Client logo*</label>
                  <p className="text-sm text-gray-500 mb-4">64X64 or 256×256px</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mb-4">SVG, PNG, JPG or GIF (max size 2mb)</p>
                    <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Upload Logo
                    </button>
                  </div>
                </div>

                {/* Favicon */}
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Favicon (Optional)</label>
                  <p className="text-sm text-gray-500 mb-4">32X32</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mb-4">SVG, PNG (max size 512kb)</p>
                    <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Upload Favicon
                    </button>
                  </div>
                </div>
              </div>


              <div className="flex flex-wrap gap-8">
                {/* Primary Color */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Primary brand color*</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 border border-gray-300 rounded-md cursor-pointer appearance-none bg-white p-1"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32 bg-white text-sm"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Secondary brand color*</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-12 h-12 border border-gray-300 rounded-md cursor-pointer appearance-none bg-white p-1"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32 bg-white text-sm"
                    />
                  </div>
                </div>
              </div>


            </div>

          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-8 mt-8 border-t border-gray-200">
            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettingsPanel;