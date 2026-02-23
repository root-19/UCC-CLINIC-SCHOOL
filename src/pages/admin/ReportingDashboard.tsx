import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import { DEV_CONFIG } from '../../config/dev-config';

interface ReportData {
  medical: {
    totalCases: number;
    diseaseBreakdown: Record<string, number>;
    statusBreakdown: Record<string, number>;
    dailyTrends: Record<string, number>;
    severityBreakdown: {
      mild: number;
      moderate: number;
      severe: number;
      critical: number;
    };
    topDiseases: Array<{
      disease: string;
      count: number;
      percentage: number;
    }>;
    averagePerDay: number;
  };
  inventory: {
    consumption: {
      totalConsumed: number;
      itemsConsumed: Record<string, { quantity: number; unit: string; times: number }>;
      consumptionReasons: Record<string, number>;
      topConsumedItems: Array<{ itemName: string; totalQuantity: number; unit: string }>;
    };
    additions: {
      totalAdded: number;
      itemsAdded: Record<string, { quantity: number; unit: string; batches: number }>;
      categoriesAdded: Record<string, number>;
      totalValue: number;
    };
  };
  registrations: {
    totalRegistrations: number;
    gradeLevelBreakdown: Record<string, number>;
    genderBreakdown: { male: number; female: number; other: number };
    registrationTrends: Record<string, number>;
    newVsReturning: { new: number; returning: number };
  };
  summary: {
    totalMedicalCases: number;
    totalInventoryConsumed: number;
    totalInventoryAdded: number;
    totalRegistrations: number;
    totalInventoryValue: number;
  };
}

interface ChronologicalData {
  metadata: {
    dataType: string;
    resolution: string;
    dateRange: {
      start: string;
      end: string;
    };
    totalDays: number;
  };
  timeline: Array<{
    date: string;
    timestamp: number;
    medical?: {
      cases: number;
      diseases: Record<string, number>;
      severity: Record<string, number>;
    };
    inventory?: {
      consumed: number;
      added: number;
      netChange: number;
    };
    registrations?: {
      new: number;
      returning: number;
    };
  }>;
}

const ReportingDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Report state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [chronologicalData, setChronologicalData] = useState<ChronologicalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'inventory' | 'registrations' | 'chronological'>('overview');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch monthly report
  const fetchMonthlyReport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/reporting/monthly?month=${selectedMonth}&year=${selectedYear}`);
      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
      } else {
        console.error('Failed to fetch report:', result.message);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch chronological data
  const fetchChronologicalData = async () => {
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/chronological/timeline?dataType=combined&resolution=${groupBy}&startDate=${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01&endDate=${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-31`);
      const result = await response.json();
      
      if (result.success) {
        setChronologicalData(result.data);
      } else {
        console.error('Failed to fetch chronological data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching chronological data:', error);
    }
  };

  // Fetch disease statistics
  const fetchDiseaseStats = async () => {
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/reporting/diseases`);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching disease stats:', error);
      return null;
    }
  };

  // Fetch inventory statistics
  const fetchInventoryStats = async () => {
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/reporting/inventory`);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchMonthlyReport();
      fetchChronologicalData();
    }
  }, [user, selectedMonth, selectedYear, groupBy]);

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const renderOverviewTab = () => {
    if (!reportData) return null;

    const { medical, inventory, registrations, summary } = reportData;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Medical Cases */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Cases</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 012-2h-2a2 2 0 01-2 2v12a2 2 0 002 2h2a2 2 0 012 2v-2a2 2 0 012-2h-2" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600">{reportData?.summary?.totalMedicalCases}</div>
          <div className="text-sm text-gray-600">Medical Cases</div>
          <div className="text-xs text-gray-500 mt-1">Avg: {reportData?.medical?.averagePerDay} per day</div>
        </div>

        {/* Inventory Consumed */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Consumed</h3>
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l8 4m0-10l-8-4-8 4" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-600">{reportData?.summary?.totalInventoryConsumed || 0}</div>
          <div className="text-sm text-gray-600">Units Consumed</div>
          <div className="text-xs text-gray-500 mt-1">Net: {(reportData?.summary?.totalInventoryAdded || 0) - (reportData?.summary?.totalInventoryConsumed || 0)}</div>
        </div>

        {/* Inventory Added */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Added</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l4 4m-4-4l4 4M4 16v4m0 0l4 4m-4-4l4 4" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600">{reportData?.summary?.totalInventoryAdded || 0}</div>
          <div className="text-sm text-gray-600">Units Added</div>
          <div className="text-xs text-gray-500 mt-1">Value: {formatCurrency(reportData?.summary?.totalInventoryValue || 0)}</div>
        </div>

        {/* Registrations */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Registrations</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 01-7 7h7a7 7 0 017 0h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-600">{reportData?.summary?.totalRegistrations || 0}</div>
          <div className="text-sm text-gray-600">New Students</div>
          <div className="text-xs text-gray-500 mt-1">New: {reportData?.registrations?.newVsReturning?.new || 0} | Returning: {reportData?.registrations?.newVsReturning?.returning || 0}</div>
        </div>
      </div>
    );
  };

  const renderMedicalTab = () => {
    if (!reportData) return null;

    const { medical } = reportData;

    return (
      <div className="space-y-6">
        {/* Disease Breakdown */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Top Diseases</h4>
              <div className="space-y-2">
                {medical.topDiseases.slice(0, 5).map((disease, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{disease.disease}</span>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">{disease.count}</div>
                      <div className="text-xs text-gray-500">{disease.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Severity Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(medical.severityBreakdown).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="capitalize font-medium text-gray-900">{severity}</span>
                    <span className={`text-lg font-semibold ${
                      severity === 'critical' ? 'text-red-600' :
                      severity === 'severe' ? 'text-orange-600' :
                      severity === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                    }`}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(medical.statusBreakdown).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderInventoryTab = () => {
    if (!reportData) return null;

    const { inventory } = reportData;

    return (
      <div className="space-y-6">
        {/* Inventory Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumption Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Consumed:</span>
                <span className="font-semibold text-orange-600">{inventory.consumption.totalConsumed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Top Item:</span>
                <span className="font-semibold text-gray-900">
                  {inventory.consumption.topConsumedItems[0]?.itemName || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Top Quantity:</span>
                <span className="font-semibold text-gray-900">
                  {inventory.consumption.topConsumedItems[0]?.totalQuantity || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Addition Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Added:</span>
                <span className="font-semibold text-green-600">{inventory.additions.totalAdded}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(inventory.additions.totalValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categories:</span>
                <span className="font-semibold text-gray-900">{Object.keys(inventory.additions.categoriesAdded).length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Net Change</h3>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                summary.totalInventoryAdded > summary.totalInventoryConsumed 
                  ? 'text-green-600' 
                  : summary.totalInventoryAdded < summary.totalInventoryConsumed 
                  ? 'text-red-600' 
                  : 'text-gray-600'
              }`}>
                {summary.totalInventoryAdded - summary.totalInventoryConsumed}
              </div>
              <div className="text-sm text-gray-600">
                {summary.totalInventoryAdded > summary.totalInventoryConsumed ? 'Net Gain' : 
                 summary.totalInventoryAdded < summary.totalInventoryConsumed ? 'Net Loss' : 'Balanced'}
              </div>
            </div>
          </div>
        </div>

        {/* Top Consumed Items */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Consumed Items</h3>
          <div className="space-y-2">
            {inventory.consumption.topConsumedItems.slice(0, 10).map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{item.itemName}</span>
                <div className="text-right">
                  <div className="text-lg font-semibold text-orange-600">{item.totalQuantity}</div>
                  <div className="text-xs text-gray-500">{item.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consumption Reasons */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumption Reasons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(inventory.consumption.consumptionReasons).map(([reason, count]) => (
              <div key={reason} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{reason}</span>
                <span className="text-lg font-semibold text-blue-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRegistrationsTab = () => {
    if (!reportData) return null;

    const { registrations } = reportData;

    return (
      <div className="space-y-6">
        {/* Registration Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Registrations:</span>
                <span className="font-semibold text-purple-600">{registrations.totalRegistrations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Students:</span>
                <span className="font-semibold text-green-600">{registrations.newVsReturning.new}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Returning:</span>
                <span className="font-semibold text-blue-600">{registrations.newVsReturning.returning}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(registrations.genderBreakdown).map(([gender, count]) => (
                <div key={gender} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="capitalize font-medium text-gray-900">{gender}</span>
                  <span className="text-lg font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grade Level Breakdown */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Level Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(registrations.gradeLevelBreakdown).map(([grade, count]) => (
              <div key={grade} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{grade}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Trends */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h3>
          <div className="space-y-2">
            {Object.entries(registrations.registrationTrends)
              .sort(([a,], [b]) => parseInt(a) - parseInt(b))
              .slice(0, 10)
              .map(([date, count]) => (
                <div key={date} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{date}</span>
                  <span className="text-lg font-semibold text-purple-600">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const renderChronologicalTab = () => {
    if (!chronologicalData) return null;

    return (
      <div className="space-y-6">
        {/* Chronological Controls */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
              >
                <option value="hour">Hourly</option>
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
              >
                <option value="combined">Combined</option>
                <option value="medical">Medical Only</option>
                <option value="inventory">Inventory Only</option>
                <option value="registrations">Registrations Only</option>
              </select>
            </div>

            <div>
              <button
                onClick={fetchChronologicalData}
                className="px-4 py-2 bg-clinic-green text-white rounded-md hover:bg-clinic-green-hover transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Timeline Overview - {getMonthName(selectedMonth)} {selectedYear}
          </h3>
          
          {chronologicalData.timeline.length > 0 ? (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{chronologicalData.timeline.length}</div>
                  <div className="text-sm text-gray-600">Timeline Entries</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {chronologicalData.timeline.reduce((sum, entry) => sum + (entry.medical?.cases || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Cases</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {chronologicalData.timeline.reduce((sum, entry) => sum + (entry.inventory?.consumed || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Consumed</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {chronologicalData.timeline.reduce((sum, entry) => sum + (entry.registrations?.new || 0), 0)}
                  </div>
                  <div className="text-sm text-600">New Registrations</div>
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {chronologicalData.timeline.slice(0, 10).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{entry.date}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long' })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {entry.medical && (
                            <div className="text-center px-2 py-1 bg-blue-100 rounded text-blue-800 text-xs">
                              {entry.medical.cases} cases
                            </div>
                          )}
                          {entry.inventory && (
                            <div className="text-center px-2 py-1 bg-orange-100 rounded text-orange-800 text-xs">
                              {entry.inventory.consumed}
                            </div>
                          )}
                          {entry.registrations && (
                            <div className="text-center px-2 py-1 bg-purple-100 rounded text-purple-800 text-xs">
                              {entry.registrations.new} new
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No chronological data available for the selected period.
            </div>
          )}
        </div>
      </div>
    );
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reporting Dashboard</h1>
              <p className="text-gray-600">Comprehensive data analysis and reporting for the UCC Clinic system</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  >
                    <option value={2023}>2023</option>
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>

                <button
                  onClick={fetchMonthlyReport}
                  disabled={isLoading}
                  className="px-4 py-2 bg-clinic-green text-white rounded-md hover:bg-clinic-green-hover disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Generate Report'}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  {['overview', 'medical', 'inventory', 'registrations', 'chronological'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? 'border-clinic-green text-clinic-green'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                    <p className="ml-4 text-gray-600">Loading report data...</p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'overview' && renderOverviewTab()}
                    {activeTab === 'medical' && renderMedicalTab()}
                    {activeTab === 'inventory' && renderInventoryTab()}
                    {activeTab === 'registrations' && renderRegistrationsTab()}
                    {activeTab === 'chronological' && renderChronologicalTab()}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportingDashboard;
