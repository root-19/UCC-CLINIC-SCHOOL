import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import { DEV_CONFIG } from '../../config/dev-config';

interface DiseaseStats {
  totalCases: number;
  dailyAverage: number;
  diseases: Record<string, number>;
  diseaseDetails: Record<string, {
    count: number;
    students: Array<{
      fullname: string;
      yearSection: string;
      schoolIdNumber: string;
      department: string;
      assessment: string;
      status: string;
      createdAt: any;
    }>;
  }>;
  status: Record<string, number>;
  department: Record<string, number>;
  topDiseases: Array<{ disease: string; count: number; percentage: number }>;
  monthlyTrends: Record<string, number>;
}

interface InventoryStats {
  totalItems: number;
  currentStock: Record<string, number>;
  lowStockItems: Array<{ name: string; quantity: number; minStock: number }>;
  categories: Record<string, number>;
  brands: Record<string, number>;
  totalValue: number;
  expiringItems: Array<{ name: string; expirationDate: any; daysUntilExpiration: number }>;
  newlyAdded: Array<{ name: string; quantity: number; addedDate: any; category: string }>;
}

interface ComprehensiveReport {
  period: {
    month: number;
    year: number;
    startDate: string;
    endDate: string;
    daysInMonth: number;
  };
  diseaseStatistics: DiseaseStats;
  inventoryStatistics: InventoryStats;
  summary: {
    totalMedicalCases: number;
    averageDailyCases: number;
    totalInventoryItems: number;
    totalInventoryValue: number;
    lowStockCount: number;
    expiringItemsCount: number;
    newlyAddedItemsCount: number;
    topDisease: string;
    topDiseaseCount: number;
    topDiseasePercentage: number;
  };
}

const ComprehensiveReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<ComprehensiveReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'diseases' | 'inventory'>('overview');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch comprehensive report
  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${DEV_CONFIG.API_URL}/api/comprehensive-reports/comprehensive?month=${selectedMonth}&year=${selectedYear}`
      );
      const result = await response.json();
      
      if (result.success) {
        setReport(result.data);
      } else {
        console.error('Failed to fetch report:', result.message);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReport();
    }
  }, [user, selectedMonth, selectedYear]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get month name
  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

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
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Comprehensive Reports</h1>
              <p className="text-gray-600">Detailed disease statistics and inventory reports for comprehensive analysis</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <option key={new Date().getFullYear() - i} value={new Date().getFullYear() - i}>
                        {new Date().getFullYear() - i}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={fetchReport}
                  disabled={loading}
                  className="px-4 py-2 bg-clinic-green text-white rounded-md hover:bg-clinic-green-hover transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Loading...' : 'Generate Report'}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-clinic-green text-clinic-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('diseases')}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      activeTab === 'diseases'
                        ? 'border-clinic-green text-clinic-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Disease Statistics
                  </button>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      activeTab === 'inventory'
                        ? 'border-clinic-green text-clinic-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Inventory Reports
                  </button>
                </nav>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                <p className="ml-4 text-gray-600">Generating comprehensive report...</p>
              </div>
            ) : !report ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m3-10V4a3 3 0 00-3-3h0a3 3 0 00-3 3v3m0 10V9a3 3 0 00-3-3h0a3 3 0 00-3 3v6" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Data</h3>
                <p className="text-gray-500">Select a month and year to generate a comprehensive report.</p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Medical Cases</p>
                            <p className="text-2xl font-bold text-gray-900">{report.summary.totalMedicalCases}</p>
                            <p className="text-xs text-gray-500">{report.summary.averageDailyCases} daily average</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Top Disease</p>
                            <p className="text-lg font-bold text-gray-900">{report.summary.topDisease}</p>
                            <p className="text-xs text-gray-500">{report.summary.topDiseaseCount} cases ({report.summary.topDiseasePercentage}%)</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l8 4m0-10l-8-4-8 4" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Inventory Items</p>
                            <p className="text-2xl font-bold text-gray-900">{report.summary.totalInventoryItems}</p>
                            <p className="text-xs text-gray-500">Value: {formatCurrency(report.summary.totalInventoryValue)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Items Requiring Attention</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {report.summary.lowStockCount + report.summary.expiringItemsCount}
                            </p>
                            <p className="text-xs text-gray-500">{report.summary.lowStockCount} low stock, {report.summary.expiringItemsCount} expiring</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Period Information */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Period</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Period</p>
                          <p className="font-medium text-gray-900">{getMonthName(report.period.month)} {report.period.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Start Date</p>
                          <p className="font-medium text-gray-900">{formatDate(report.period.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">End Date</p>
                          <p className="font-medium text-gray-900">{formatDate(report.period.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Days in Period</p>
                          <p className="font-medium text-gray-900">{report.period.daysInMonth} days</p>
                        </div>
                      </div>
                    </div>

                    {/* Top Diseases */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Diseases</h3>
                      <div className="space-y-3">
                        {report.diseaseStatistics.topDiseases.slice(0, 5).map((disease, index) => (
                          <div key={disease.disease} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="flex-shrink-0 w-8 h-8 bg-clinic-green text-white rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <span className="ml-3 font-medium text-gray-900">{disease.disease}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-600 mr-2">{disease.count} cases</span>
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-clinic-green h-2 rounded-full"
                                  style={{ width: `${disease.percentage}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm font-medium text-gray-900">{disease.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Disease Statistics Tab */}
                {activeTab === 'diseases' && (
                  <div className="space-y-6">
                    {/* Disease Breakdown */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Breakdown</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Disease
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cases
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Percentage
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Affected Students
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {report.diseaseStatistics.topDiseases.map((disease) => (
                              <tr key={disease.disease}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {disease.disease}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {disease.count}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex items-center">
                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                      <div
                                        className="bg-clinic-green h-2 rounded-full"
                                        style={{ width: `${disease.percentage}%` }}
                                      ></div>
                                    </div>
                                    {disease.percentage}%
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  <div className="max-h-20 overflow-y-auto">
                                    {report.diseaseStatistics.diseaseDetails[disease.disease]?.students.slice(0, 3).map((student, idx) => (
                                      <div key={idx} className="text-xs text-gray-600">
                                        {student.fullname} ({student.yearSection})
                                      </div>
                                    ))}
                                    {report.diseaseStatistics.diseaseDetails[disease.disease]?.students.length > 3 && (
                                      <div className="text-xs text-gray-500">
                                        +{report.diseaseStatistics.diseaseDetails[disease.disease].students.length - 3} more
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Department Breakdown */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Breakdown</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(report.diseaseStatistics.department).map(([dept, count]) => (
                          <div key={dept} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900">{dept}</h4>
                            <p className="text-2xl font-bold text-clinic-green">{count}</p>
                            <p className="text-sm text-gray-600">cases</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Inventory Reports Tab */}
                {activeTab === 'inventory' && (
                  <div className="space-y-6">
                    {/* Inventory Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Total Items</p>
                            <p className="text-xl font-bold text-gray-900">{report.inventoryStatistics.totalItems}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Value</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(report.inventoryStatistics.totalValue)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Status</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Low Stock Items</span>
                            <span className="font-medium text-red-600">{report.inventoryStatistics.lowStockItems.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Expiring Items</span>
                            <span className="font-medium text-orange-600">{report.inventoryStatistics.expiringItems.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Newly Added</span>
                            <span className="font-medium text-green-600">{report.inventoryStatistics.newlyAdded.length}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {Object.entries(report.inventoryStatistics.categories).map(([category, count]) => (
                            <div key={category} className="flex justify-between text-sm">
                              <span className="text-gray-600">{category}</span>
                              <span className="font-medium text-gray-900">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Low Stock Items */}
                    {report.inventoryStatistics.lowStockItems.length > 0 && (
                      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-red-600">Low Stock Items</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Item Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Current Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Minimum Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {report.inventoryStatistics.lowStockItems.map((item, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.quantity}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.minStock}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Low Stock
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Expiring Items */}
                    {report.inventoryStatistics.expiringItems.length > 0 && (
                      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-orange-600">Expiring Items</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Item Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Expiration Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Days Until Expiration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {report.inventoryStatistics.expiringItems.map((item, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(item.expirationDate)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.daysUntilExpiration} days
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      item.daysUntilExpiration <= 30 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-orange-100 text-orange-800'
                                    }`}>
                                      {item.daysUntilExpiration <= 30 ? 'Expiring Soon' : 'Expiring'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Newly Added Items */}
                    {report.inventoryStatistics.newlyAdded.length > 0 && (
                      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-green-600">Newly Added Items</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Item Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date Added
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {report.inventoryStatistics.newlyAdded.map((item, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.quantity}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.category}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(item.addedDate)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ComprehensiveReports;
