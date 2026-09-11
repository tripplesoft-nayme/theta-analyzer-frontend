import React, { useState } from 'react';
import { X, Search, Save } from 'lucide-react';

interface Permission {
  module: string;
  platformAdmin: boolean;
  clientAdmin: boolean;
  staff: boolean;
  viewer: boolean;
}

const GlobalRoleManagement: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      module: 'Dashboard',
      platformAdmin: true,
      clientAdmin: true,
      staff: true,
      viewer: true,
    },
    {
      module: 'User Management',
      platformAdmin: true,
      clientAdmin: true,
      staff: true,
      viewer: false,
    },
    {
      module: 'Security Settings',
      platformAdmin: true,
      clientAdmin: true,
      staff: false,
      viewer: false,
    },
    {
      module: 'Billing',
      platformAdmin: true,
      clientAdmin: false,
      staff: false,
      viewer: false,
    },
    {
      module: 'Reports',
      platformAdmin: true,
      clientAdmin: true,
      staff: true,
      viewer: true,
    },
  ]);

  const togglePermission = (moduleIndex: number, role: keyof Omit<Permission, 'module'>) => {
    setPermissions(prev => prev.map((perm, index) =>
      index === moduleIndex
        ? { ...perm, [role]: !perm[role] }
        : perm
    ));
  };

  const filteredPermissions = permissions.filter(perm =>
    perm.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveChanges = () => {
    console.log('Saving changes:', permissions);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: () => void;
  }> = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
          }`}
      />
    </button>
  );

  return (
    <div>
      {/* Main Table View */}
      <div className="bg-white rounded-lg border border-gray-200 mt-8">
        <div className="flex items-center justify-between p-4 border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Template Global role management</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
            >
              Edit Template
            </button>
            <select className="px-3 py-2 border border-gray-300 focus:outline-none rounded-md text-sm cursor-pointer">
              <option>Industry</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto p-6 ">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viewer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissions.map((permission, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{permission.module}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {permission.platformAdmin ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-red-500">✕</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {permission.clientAdmin ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-red-500">✕</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {permission.staff ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-red-500">✕</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {permission.viewer ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-red-500">✕</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[80%] mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Template global role</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} className='cursor-pointer' />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="mb-6">
                <div className='border border-gray-200 rounded-md p-6'>
                  <div className='flex justify-between items-center mb-8'>
                    <h4 className="text-[24px] font-medium text-gray-900">Template Global role management</h4>
                    {/* Search Box */}
                    <div className="relative flex justify-end">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 " />
                      </div>
                      <input
                        type="text"
                        placeholder="Search module..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Permissions Grid */}
                  <div className="space-y-4 border border-gray-200 rounded-md">
                    <div className="grid grid-cols-5 gap-4 py-3 border-b border-t border-gray-200 bg-gray-100">
                      <div className="font-medium text-gray-700 ml-4">Module</div>
                      <div className="font-medium text-gray-700 text-center">Platform Admin</div>
                      <div className="font-medium text-gray-700 text-center">Client Admin</div>
                      <div className="font-medium text-gray-700 text-center">Staff</div>
                      <div className="font-medium text-gray-700 text-center">Viewer</div>
                    </div>

                    {filteredPermissions.map((permission) => {
                      const originalIndex = permissions.findIndex(p => p.module === permission.module);
                      return (
                        <div key={permission.module} className="grid grid-cols-5 gap-4 pb-3 items-center border-b border-border">
                          <div className="text-sm text-gray-900 ml-4">{permission.module}</div>
                          <div className="flex justify-center">
                            <ToggleSwitch
                              checked={permission.platformAdmin}
                              onChange={() => togglePermission(originalIndex, 'platformAdmin')}
                            />
                          </div>
                          <div className="flex justify-center">
                            <ToggleSwitch
                              checked={permission.clientAdmin}
                              onChange={() => togglePermission(originalIndex, 'clientAdmin')}
                            />
                          </div>
                          <div className="flex justify-center">
                            <ToggleSwitch
                              checked={permission.staff}
                              onChange={() => togglePermission(originalIndex, 'staff')}
                            />
                          </div>
                          <div className="flex justify-center">
                            <ToggleSwitch
                              checked={permission.viewer}
                              onChange={() => togglePermission(originalIndex, 'viewer')}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Warning Message */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex justify-center">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Changes to the global role template will override any client-specific settings. This may affect existinguser permissions across the platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none cursor-pointer"
              >
                <span className='flex items-center gap-1.5'>
                  <Save />
                  Save Changes
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalRoleManagement;