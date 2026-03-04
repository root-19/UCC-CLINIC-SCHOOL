import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import bgClinic from '../../assets/images/bg-clinic.png';
import { env } from '../../config/env';

interface ComprehensiveReport {
  totalRequests: number;
  totalRegistrations: number;
  totalStudents: number;
  requestStudents: number;
  registrationStudents: number;
  monthlyData: Array<{
    month: string;
    requests: number;
    registrations: number;
    total: number;
  }>;
  medicationData: Array<{
    medication: string;
    requests: number;
  }>;
  assessmentData: Array<{
    assessment: string;
    count: number;
  }>;
  departmentData: Array<{
    department: string;
    count: number;
  }>;
}

const ComprehensiveReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<ComprehensiveReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'diseases' | 'inventory'>('overview');

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/api/reports/comprehensive?month=${selectedMonth}&year=${selectedYear}`);
      const data = await response.json();

      if (data.success) {
        setReport(data.data);
      } else {
        console.error('Failed to fetch report:', data.message);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
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

        {/* Content with Background */}
        <main className="flex-1 relative overflow-auto">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{ backgroundImage: `url(${bgClinic})` }}
          />
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />

          {/* Content */}
          <div className="relative z-10 p-3 sm:p-4 md:p-6">
            <div className="bg-white rounded-xl shadow-professional-lg p-4 sm:p-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-clinic-green animate-fade-in-up animate-delay-100">Comprehensive Reports</h1>
                <div className="flex gap-2 flex-wrap animate-fade-in-up animate-delay-200">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent text-sm transition-all duration-200 hover:border-clinic-green/50 input-focus shadow-sm"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleDateString('en-US', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent text-sm transition-all duration-200 hover:border-clinic-green/50 input-focus shadow-sm"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                  <p className="mt-4 text-gray-600">Loading comprehensive report...</p>
                </div>
              ) : report ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-600 font-medium">Total Requests</p>
                      <p className="text-2xl font-bold text-blue-900">{report.totalRequests}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-600 font-medium">Total Registrations</p>
                      <p className="text-2xl font-bold text-green-900">{report.totalRegistrations}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-600 font-medium">Total Students</p>
                      <p className="text-2xl font-bold text-purple-900">{report.totalStudents}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <p className="text-sm text-orange-600 font-medium">Medication Types</p>
                      <p className="text-2xl font-bold text-orange-900">{report.medicationData.length}</p>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      {['overview', 'diseases', 'inventory'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                            activeTab === tab
                              ? 'border-clinic-green text-clinic-green'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="mt-6">
                    {activeTab === 'overview' && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700">Comprehensive overview of clinic operations for {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                    )}
                    {activeTab === 'diseases' && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Disease Patterns</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700">Disease pattern analysis and trends</p>
                        </div>
                      </div>
                    )}
                    {activeTab === 'inventory' && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Analysis</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700">Medication usage and inventory insights</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No data available for the selected period.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ComprehensiveReports;
