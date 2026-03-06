import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import bgClinic from '../../assets/images/bg-clinic.png';
import { env } from '../../config/env';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';

interface DashboardStats {
  totalRequests: number;
  totalRegistrations: number;
  totalStudents: number;
  pendingRequests: number;
  completedRequests: number;
  activeStudents: number;
  inactiveStudents: number;
  lowStockItems: number;
  expiredItems: number;
}

interface MonthlyData {
  month: string;
  requests: number;
  registrations: number;
  uniqueStudents: number;
}

interface TopMedication {
  medication: string;
  count: number;
  percentage: number;
}

interface DepartmentStats {
  department: string;
  count: number;
  percentage: number;
}

interface DailyTrend {
  date: string;
  requests: number;
  registrations: number;
}

const ReportingDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [topMedications, setTopMedications] = useState<TopMedication[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod, selectedYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      params.append('period', selectedPeriod);
      params.append('year', selectedYear.toString());

      const response = await fetch(`${env.API_URL}/api/reports/dashboard?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setMonthlyData(data.data.monthlyData || []);
        setTopMedications(data.data.topMedications || []);
        setDepartmentStats(data.data.departmentStats || []);
        setDailyTrend(data.data.dailyTrend || []);
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-clinic-green animate-fade-in-up animate-delay-100">
                  Reporting Dashboard
                </h1>
                <div className="flex gap-2 flex-wrap animate-fade-in-up animate-delay-200">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent text-sm transition-all duration-200 hover:border-clinic-green/50 input-focus shadow-sm"
                  >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="365">Last Year</option>
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

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                  <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {!loading && !error && stats && (
                <>
                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-professional">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-blue-600 font-medium">Total Requests</p>
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalRequests}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {stats.pendingRequests} pending
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-professional">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-green-600 font-medium">Student Records</p>
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{stats.totalRegistrations}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {stats.activeStudents} active
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-professional">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-purple-600 font-medium">Unique Students</p>
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">{stats.totalStudents}</p>
                      <p className="text-xs text-purple-600 mt-1">
                        Total unique
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 shadow-professional">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-orange-600 font-medium">Inventory Alerts</p>
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-orange-900">{stats.lowStockItems + stats.expiredItems}</p>
                      <p className="text-xs text-orange-600 mt-1">
                        {stats.lowStockItems} low, {stats.expiredItems} expired
                      </p>
                    </div>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Monthly Trends */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="month" 
                            tickFormatter={formatMonthLabel}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any, name: any) => {
                              const numValue = typeof value === 'number' ? value : 0;
                              const nameStr = typeof name === 'string' ? name : '';
                              if (nameStr === 'requests') return [`${numValue}`, 'Request Forms'];
                              if (nameStr === 'registrations') return [`${numValue}`, 'Student Records'];
                              if (nameStr === 'uniqueStudents') return [`${numValue}`, 'Unique Students'];
                              return [`${numValue}`, nameStr];
                            }}
                            labelFormatter={(label) => `Month: ${formatMonthLabel(label)}`}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="requests" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Request Forms" />
                          <Area type="monotone" dataKey="registrations" stackId="1" stroke="#10B981" fill="#10B981" name="Student Records" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Top Medications */}
                    {topMedications.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Medications</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={topMedications}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {topMedications.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Department Stats */}
                  {departmentStats.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={departmentStats} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="department" type="category" width={120} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#8B5CF6" name="Number of Students" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Daily Trend */}
                  {dailyTrend.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity Trend</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any, name: any) => {
                              const numValue = typeof value === 'number' ? value : 0;
                              const nameStr = typeof name === 'string' ? name : '';
                              if (nameStr === 'requests') return [`${numValue}`, 'Requests'];
                              if (nameStr === 'registrations') return [`${numValue}`, 'Registrations'];
                              return [`${numValue}`, nameStr];
                            }}
                            labelFormatter={(label) => `Date: ${formatDate(label)}`}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} name="Requests" />
                          <Line type="monotone" dataKey="registrations" stroke="#10B981" strokeWidth={2} name="Registrations" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-600 font-medium">Completion Rate</p>
                      <p className="text-xl font-bold text-blue-900">
                        {stats.totalRequests > 0 
                          ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
                          : 0}%
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {stats.completedRequests} of {stats.totalRequests} completed
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-600 font-medium">Student Activity</p>
                      <p className="text-xl font-bold text-green-900">
                        {stats.totalRegistrations > 0 
                          ? Math.round((stats.activeStudents / stats.totalRegistrations) * 100)
                          : 0}%
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {stats.activeStudents} of {stats.totalRegistrations} active
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-600 font-medium">Avg Requests/Student</p>
                      <p className="text-xl font-bold text-purple-900">
                        {stats.totalStudents > 0 
                          ? (stats.totalRequests / stats.totalStudents).toFixed(1)
                          : 0}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Per student average
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportingDashboard;
