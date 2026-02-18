import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import { env } from '../../config/env';

const EmailTest = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [emailConfig, setEmailConfig] = useState<any>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const fetchEmailConfig = async () => {
    try {
      const response = await fetch(`${env.API_URL}/api/test/email-config`);
      const data = await response.json();
      setEmailConfig(data.config);
    } catch (error) {
      console.error('Error fetching email config:', error);
    }
  };

  const testBasicEmail = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${env.API_URL}/api/test/email-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      });

      const result = await response.json();
      setResults(prev => [{ ...result, test: 'Basic Email Test', timestamp: new Date().toLocaleString() }, ...prev]);
    } catch (error) {
      setResults(prev => [{ 
        success: false, 
        message: 'Network error occurred', 
        test: 'Basic Email Test', 
        timestamp: new Date().toLocaleString(),
        error: error 
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const testRequestStatusEmail = async (status: string) => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${env.API_URL}/api/test/request-status-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail, status }),
      });

      const result = await response.json();
      setResults(prev => [{ ...result, test: `Request Status Email (${status})`, timestamp: new Date().toLocaleString() }, ...prev]);
    } catch (error) {
      setResults(prev => [{ 
        success: false, 
        message: 'Network error occurred', 
        test: `Request Status Email (${status})`, 
        timestamp: new Date().toLocaleString(),
        error: error 
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const testInventoryEmail = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${env.API_URL}/api/test/inventory-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      });

      const result = await response.json();
      setResults(prev => [{ ...result, test: 'Inventory Expiration Email', timestamp: new Date().toLocaleString() }, ...prev]);
    } catch (error) {
      setResults(prev => [{ 
        success: false, 
        message: 'Network error occurred', 
        test: 'Inventory Expiration Email', 
        timestamp: new Date().toLocaleString(),
        error: error 
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <AdminTopBar onMenuClick={toggleSidebar} />

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Service Test</h1>
              <p className="text-gray-600">Test the SMTP email service functionality</p>
            </div>

            {/* Email Configuration Status */}
            {emailConfig && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Email User:</span>
                    <span className="text-sm">{emailConfig.emailUser}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Email Password:</span>
                    <span className="text-sm">{emailConfig.emailPassword}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Admin Email:</span>
                    <span className="text-sm">{emailConfig.adminEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Service:</span>
                    <span className="text-sm">{emailConfig.service}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Test Form */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Test Email</h2>
              
              <div className="mb-4">
                <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  id="testEmail"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter your email address for testing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={testBasicEmail}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Test Basic Email'}
                </button>
                
                <button
                  onClick={() => testRequestStatusEmail('approved')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Test Approved Email'}
                </button>
                
                <button
                  onClick={() => testRequestStatusEmail('rejected')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Test Rejected Email'}
                </button>
                
                <button
                  onClick={testInventoryEmail}
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Test Inventory Email'}
                </button>
              </div>
            </div>

            {/* Test Results */}
            {results.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
                  <button
                    onClick={clearResults}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Clear Results
                  </button>
                </div>
                
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-md border ${
                        result.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{result.test}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          result.success
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{result.message}</p>
                      <p className="text-xs text-gray-500">{result.timestamp}</p>
                      {result.details && (
                        <div className="mt-2 text-xs text-gray-600">
                          <p><strong>Recipient:</strong> {result.details.recipient}</p>
                          {result.details.status && <p><strong>Status:</strong> {result.details.status}</p>}
                          {result.details.expiringItemsCount && <p><strong>Expiring Items:</strong> {result.details.expiringItemsCount}</p>}
                          {result.details.expiredItemsCount && <p><strong>Expired Items:</strong> {result.details.expiredItemsCount}</p>}
                        </div>
                      )}
                      {result.error && (
                        <div className="mt-2 text-xs text-red-600">
                          <p><strong>Error:</strong> {JSON.stringify(result.error)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmailTest;
