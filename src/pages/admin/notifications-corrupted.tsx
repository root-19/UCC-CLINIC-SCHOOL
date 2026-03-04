import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import bgClinic from '../../assets/images/bg-clinic.png';
import { env } from '../../config/env';

interface Announcement {
  id: string;
  title: string;
  description: string;
  image?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const Announcement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${env.API_URL}/api/announcement`);
      const data = await response.json();

      if (data.success) {
        setAnnouncements(data.data);
      } else {
        setError(data.message || 'Failed to fetch announcements');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${env.API_URL}/api/announcement/${editingId}`
        : `${env.API_URL}/api/announcement`;
      
      const method = editingId ? 'PUT' : 'POST';

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setShowAddForm(false);
        setEditingId(null);
        setFormData({
          title: '',
          description: '',
        });
        setSelectedImage(null);
        setImagePreview(null);
        fetchAnnouncements();
      } else {
        alert(data.message || `Failed to ${editingId ? 'update' : 'add'} announcement`);
      }
    } catch (err) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} announcement:`, err);
      alert('Network error. Please try again.');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      description: announcement.description,
    });
    setSelectedImage(null);
    setImagePreview(announcement.image ? `${env.API_URL}${announcement.image}` : null);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleDelete = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      setDeletingId(announcementId);
      const response = await fetch(`${env.API_URL}/api/announcement/${announcementId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchAnnouncements();
      } else {
        alert(data.message || 'Failed to delete announcement');
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
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
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-clinic-green animate-fade-in-up animate-delay-100">Announcements</h1>
                <button
                  onClick={() => {
                    if (showAddForm) {
                      handleCancel();
                    } else {
                      setShowAddForm(true);
                    }
                  }}
                  className="px-6 py-2.5 bg-clinic-green text-white rounded-lg hover:bg-clinic-green-hover hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-sm sm:text-base font-semibold shadow-md animate-scale-in animate-delay-200"
                >
                  {showAddForm ? 'Cancel' : editingId ? 'Cancel Edit' : 'Add Announcement'}
                </button>
              </div>

              {/* Add/Edit Announcement Form */}
              {showAddForm && (
                <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-professional animate-fade-in-up animate-delay-200">
                  <h2 className="text-xl font-semibold mb-4 text-clinic-green">
                    {editingId ? 'Edit Announcement' : 'Add New Announcement'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                        placeholder="Enter announcement title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent resize-y"
                        placeholder="Enter announcement description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                      />
                      {imagePreview && (
                        <div className="mt-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-full h-48 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-clinic-green text-white rounded-lg hover:bg-clinic-green-hover transition-colors font-medium"
                      >
                        {editingId ? 'Update Announcement' : 'Add Announcement'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                  <p className="mt-4 text-gray-600">Loading announcements...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {!loading && !error && announcements.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No announcements found.</p>
                  <p className="text-gray-500 text-sm mt-2">Click "Add Announcement" to create your first announcement.</p>
                </div>
              )}

              {!loading && !error && announcements.length > 0 && (
                <div className="overflow-x-auto">
                  {/* Mobile Card View */}
                  <div className="block sm:hidden space-y-4">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg flex-1 pr-2">
                            {announcement.title}
                          </h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(announcement)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(announcement.id)}
                              disabled={deletingId === announcement.id}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium disabled:bg-gray-400"
                            >
                              {deletingId === announcement.id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                        {announcement.image && (
                          <div className="mb-3">
                            <img
                              src={`${env.API_URL}${announcement.image}`}
                              alt={announcement.title}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
                          {announcement.description}
                        </p>
                        <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
                          <p>Created: {formatDate(announcement.createdAt)}</p>
                          {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt && (
                            <p>Updated: {formatDate(announcement.updatedAt)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <table className="hidden sm:table w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Title
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Description
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Created At
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Updated At
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {announcements.map((announcement) => (
                        <tr key={announcement.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-medium">
                            {announcement.title}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 max-w-md">
                            <div className="line-clamp-2">
                              {announcement.description}
                            </div>
                            {announcement.image && (
                              <div className="mt-2">
                                <img
                                  src={`${env.API_URL}${announcement.image}`}
                                  alt={announcement.title}
                                  className="w-20 h-20 object-cover rounded"
                                />
                              </div>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {formatDate(announcement.createdAt)}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt
                              ? formatDate(announcement.updatedAt)
                              : 'N/A'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(announcement)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                                title="Edit Announcement"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(announcement.id)}
                                disabled={deletingId === announcement.id}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium disabled:bg-gray-400"
                                title="Delete Announcement"
                              >
                                {deletingId === announcement.id ? '...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && !error && announcements.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Total Announcements: <span className="font-semibold">{announcements.length}</span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Announcement;

import { useState, useEffect } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<ComprehensiveReport | null>(null);
  const [loading, setLoading] = useState(true);
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
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import { env } from '../../config/env';

const EmailTest = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import { DEV_CONFIG } from '../../config/dev-config';

interface EnhancedInventoryItem {
  id: string;
  name: string;
  genericName: string;
  categoryHierarchy: {
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
    level6: string;
    level7: string;
    level8: string;
  };
  brand: string;
  manufacturer: string;
  quantity: number;
  unit: string;
  deliveryDate: Date;
  expirationDate: Date;
  manufacturingDate: Date;
  batchNumber: string;
  serialNumber: string;
  sku: string;
  barcode: string;
  cost: number;
  supplier: string;
  supplierContact: string;
  storageLocation: string;
  storageConditions: string;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  description: string;
  notes: string;
  isActive: boolean;
  stockStatus: 'normal' | 'low' | 'critical' | 'overstock';
  expirationStatus: 'good' | 'warning' | 'expiring' | 'expired';
  daysUntilExpiration: number;
  batches: Array<{
    batchNumber: string;
    quantity: number;
    deliveryDate: Date;
    expirationDate: Date;
    manufacturingDate: Date;
    cost: number;
    supplier: string;
    serialNumber: string;
    isActive: boolean;
  }>;
  totalQuantity: number;
  lastUpdated: Date;
  createdAt: Date;
}

const EnhancedInventory = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // State management
  const [items, setItems] = useState<EnhancedInventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(true);
  const [showEditModal, setShowEditModal] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(true);
  const [selectedItem, setSelectedItem] = useState<EnhancedInventoryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExpiringOnly, setShowExpiringOnly] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    subcategory: '',
    subsubcategory: '',
    categoryLevel3: '',
    categoryLevel4: '',
    categoryLevel5: '',
    categoryLevel6: '',
    categoryLevel7: '',
    brand: '',
    manufacturer: '',
    quantity: '',
    unit: 'pcs',
    deliveryDate: '',
    expirationDate: '',
    manufacturingDate: '',
    batchNumber: '',
    serialNumber: '',
    sku: '',
    barcode: '',
    cost: '',
    supplier: '',
    supplierContact: '',
    storageLocation: '',
    storageConditions: '',
    minStockLevel: '10',
    maxStockLevel: '100',
    reorderPoint: '20',
    description: '',
    notes: ''
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      setIsLoading(true);
      let url = `${DEV_CONFIG.API_URL}/api/enhanced-inventory/items`;
      
      // Add filters
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (searchTerm) params.append('search', searchTerm);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setItems(result.data);
      } else {
        console.error('Failed to fetch inventory items:', result.message);
        // Set empty array to prevent white screen
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      // Set empty array to prevent white screen
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories and brands
  const fetchCategoriesAndBrands = async () => {
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/enhanced-inventory/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data.categories || []);
        setBrands(result.data.brands || []);
      } else {
        console.error('Failed to fetch categories:', result.message);
        setCategories([]);
        setBrands([]);
      }
    } catch (error) {
      console.error('Error fetching categories and brands:', error);
      setCategories([]);
      setBrands([]);
    }
  };

  // Fetch expiring items
  const fetchExpiringItems = async () => {
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/enhanced-inventory/expiring?daysAhead=90`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Expiring items fetched:', result.data?.length || 0);
      } else {
        console.error('Failed to fetch expiring items:', result.message);
      }
    } catch (error) {
      console.error('Error fetching expiring items:', error);
    }
  };

  // Create inventory item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/enhanced-inventory/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          genericName: '',
          category: '',
          subcategory: '',
          subsubcategory: '',
          categoryLevel3: '',
          categoryLevel4: '',
          categoryLevel5: '',
          categoryLevel6: '',
          categoryLevel7: '',
          brand: '',
          manufacturer: '',
          quantity: '',
          unit: 'pcs',
          deliveryDate: '',
          expirationDate: '',
          manufacturingDate: '',
          batchNumber: '',
          serialNumber: '',
          sku: '',
          barcode: '',
          cost: '',
          supplier: '',
          supplierContact: '',
          storageLocation: '',
          storageConditions: '',
          minStockLevel: '10',
          maxStockLevel: '100',
          reorderPoint: '20',
          description: '',
          notes: ''
        });
        fetchInventoryItems();
        alert('Enhanced inventory item created successfully!');
      } else {
        alert(result.message || 'Failed to create inventory item');
      }
    } catch (error) {
      console.error('Error creating inventory item:', error);
      alert('Failed to create inventory item');
    }
  };

  // Edit inventory item
  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) return;
    
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/enhanced-inventory/items/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowEditModal(false);
        setSelectedItem(null);
        resetForm();
        fetchInventoryItems();
        alert('Enhanced inventory item updated successfully!');
      } else {
        alert(result.message || 'Failed to update inventory item');
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert('Failed to update inventory item');
    }
  };

  // Delete inventory item
  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/enhanced-inventory/items/${selectedItem.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedItem(null);
        fetchInventoryItems();
        alert('Enhanced inventory item deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete inventory item');
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Failed to delete inventory item');
    }
  };

  // Open edit modal with item data
  const openEditModal = (item: EnhancedInventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || '',
      genericName: item.genericName || '',
      category: item.categoryHierarchy?.level1 || '',
      subcategory: item.categoryHierarchy?.level2 || '',
      subsubcategory: item.categoryHierarchy?.level3 || '',
      categoryLevel3: item.categoryHierarchy?.level3 || '',
      categoryLevel4: item.categoryHierarchy?.level4 || '',
      categoryLevel5: item.categoryHierarchy?.level5 || '',
      categoryLevel6: item.categoryHierarchy?.level6 || '',
      categoryLevel7: item.categoryHierarchy?.level7 || '',
      brand: item.brand || '',
      manufacturer: item.manufacturer || '',
      quantity: item.totalQuantity?.toString() || '',
      unit: item.unit || 'pcs',
      deliveryDate: item.deliveryDate ? new Date(item.deliveryDate).toISOString().split('T')[0] : '',
      expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : '',
      manufacturingDate: item.manufacturingDate ? new Date(item.manufacturingDate).toISOString().split('T')[0] : '',
      batchNumber: item.batchNumber || '',
      serialNumber: item.serialNumber || '',
      sku: item.sku || '',
      barcode: item.barcode || '',
      cost: item.cost?.toString() || '',
      supplier: item.supplier || '',
      supplierContact: item.supplierContact || '',
      storageLocation: item.storageLocation || '',
      storageConditions: item.storageConditions || '',
      minStockLevel: item.minStockLevel?.toString() || '10',
      maxStockLevel: item.maxStockLevel?.toString() || '100',
      reorderPoint: item.reorderPoint?.toString() || '20',
      description: item.description || '',
      notes: item.notes || ''
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (item: EnhancedInventoryItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      category: '',
      subcategory: '',
      subsubcategory: '',
      categoryLevel3: '',
      categoryLevel4: '',
      categoryLevel5: '',
      categoryLevel6: '',
      categoryLevel7: '',
      brand: '',
      manufacturer: '',
      quantity: '',
      unit: 'pcs',
      deliveryDate: '',
      expirationDate: '',
      manufacturingDate: '',
      batchNumber: '',
      serialNumber: '',
      sku: '',
      barcode: '',
      cost: '',
      supplier: '',
      supplierContact: '',
      storageLocation: '',
      storageConditions: '',
      minStockLevel: '10',
      maxStockLevel: '100',
      reorderPoint: '20',
      description: '',
      notes: ''
    });
  };

  // Get stock status color
  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'overstock': return 'bg-orange-100 text-orange-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  // Get expiration status color
  const getExpirationStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800';
      case 'expiring': return 'bg-orange-100 text-orange-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  // Format date
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'N/A';
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  useEffect(() => {
    if (user) {
      fetchInventoryItems();
      fetchCategoriesAndBrands();
      fetchExpiringItems();
    }
  }, [user, selectedCategory, selectedBrand, searchTerm]);

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Inventory Management</h1>
              <p className="text-gray-600">Comprehensive inventory tracking with 7-level categorization, brand management, and expiry date monitoring</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  >
                    <option value="">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, SKU, or barcode..."
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="expiringOnly"
                    checked={showExpiringOnly}
                    onChange={(e) => setShowExpiringOnly(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="expiringOnly" className="text-sm text-gray-700">
                    Show expiring items only
                  </label>
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-clinic-green text-white rounded-md hover:bg-clinic-green-hover transition-colors"
                >
                  Add New Item
                </button>
              </div>
            </div>

            {/* Inventory Items */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                  <p className="ml-4 text-gray-600">Loading inventory items...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l8 4m0-10l-8-4-8 4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
                  <p className="text-gray-500">Get started by adding your first enhanced inventory item.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Brand
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expiry
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              {item.genericName && (
                                <div className="text-xs text-gray-500 italic">{item.genericName}</div>
                              )}
                              <div className="text-xs text-gray-500">SKU: {item.sku || 'N/A'}</div>
                              <div className="text-xs text-gray-500">Batch: {item.batchNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.categoryHierarchy.level1}
                              {item.categoryHierarchy.level2 && (
                                <div className="text-xs text-gray-500">→ {item.categoryHierarchy.level2}</div>
                              )}
                              {item.categoryHierarchy.level3 && (
                                <div className="text-xs text-gray-500">→ {item.categoryHierarchy.level3}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.brand || 'N/A'}</div>
                            {item.manufacturer && (
                              <div className="text-xs text-gray-500">{item.manufacturer}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(item.stockStatus)}`}>
                                {item.stockStatus}
                              </span>
                              <span className="ml-2 text-sm text-gray-900">
                                {item.totalQuantity} {item.unit}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExpirationStatusColor(item.expirationStatus)}`}>
                                {item.expirationStatus}
                              </span>
                              <span className="ml-2 text-sm text-gray-900">
                                {formatDate(item.expirationDate)}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                ({item.daysUntilExpiration} days)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.cost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => openEditModal(item)}
                              className="bg-blue-text-clinic-green hover:text-clinic-green-hover mr-3"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => openDeleteModal(item)}
                              className="bg-red-500 text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Enhanced Inventory Item</h2>
            
            <form onSubmit={handleCreateItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Generic Name
                    </label>
                    <input
                      type="text"
                      value={formData.genericName}
                      onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Paracetamol 500mg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="ml">Milliliters</option>
                      <option value="mg">Milligrams</option>
                      <option value="g">Grams</option>
                      <option value="kg">Kilograms</option>
                      <option value="l">Liters</option>
                      <option value="box">Boxes</option>
                      <option value="bottles">Bottles</option>
                      <option value="tablets">Tablets</option>
                      <option value="capsules">Capsules</option>
                    </select>
                  </div>
                </div>

                {/* Category Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Category Hierarchy</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level 1 Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Medicine"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level 2 Subcategory
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Pain Relief"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level 3 Subcategory
                    </label>
                    <input
                      type="text"
                      value={formData.subsubcategory}
                      onChange={(e) => setFormData({...formData, subsubcategory: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Analgesics"
                    />
                  </div>
                </div>

                {/* Brand & Manufacturer */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Brand Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Biogesic"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., United Laboratories"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Date Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturing Date
                    </label>
                    <input
                      type="date"
                      value={formData.manufacturingDate}
                      onChange={(e) => setFormData({...formData, manufacturingDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>
                </div>

                {/* Tracking Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Tracking Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="Auto-generated if empty"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="For unique items"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="Stock Keeping Unit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="For scanning"
                    />
                  </div>
                </div>

                {/* Supplier & Cost */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Supplier & Cost</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Contact
                    </label>
                    <input
                      type="text"
                      value={formData.supplierContact}
                      onChange={(e) => setFormData({...formData, supplierContact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="Phone number or email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost per Unit *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Storage Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Storage Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Location
                    </label>
                    <input
                      type="text"
                      value={formData.storageLocation}
                      onChange={(e) => setFormData({...formData, storageLocation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Cabinet A-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Conditions
                    </label>
                    <input
                      type="text"
                      value={formData.storageConditions}
                      onChange={(e) => setFormData({...formData, storageConditions: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="e.g., Room temperature, Refrigerated"
                    />
                  </div>
                </div>

                {/* Stock Levels */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Stock Levels</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Stock Level
                    </label>
                    <input
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData({...formData, minStockLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus: outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Stock Level
                    </label>
                    <input
                      type="number"
                      value={formData.maxStockLevel}
                      onChange={(e) => setFormData({...formData, maxStockLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus: outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Point
                    </label>
                    <input
                      type="number"
                      value={formData.reorderPoint}
                      onChange={(e) => setFormData({...formData, reorderPoint: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus: outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="20"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus: outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="Product description, usage instructions, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus: outline-none focus:ring-2 focus:ring-clinic-green"
                      placeholder="Additional notes or special handling instructions"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-clinic-green text-white rounded-md hover:bg-clinic-green-hover transition-colors"
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Enhanced Inventory Item</h2>
            
            <form onSubmit={handleEditItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Generic Name
                    </label>
                    <input
                      type="text"
                      value={formData.genericName}
                      onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="ml">Milliliters</option>
                      <option value="mg">Milligrams</option>
                      <option value="g">Grams</option>
                      <option value="kg">Kilograms</option>
                      <option value="l">Liters</option>
                      <option value="box">Box</option>
                      <option value="bottle">Bottle</option>
                      <option value="vial">Vial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>
                </div>

                {/* Category Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Contact
                    </label>
                    <input
                      type="text"
                      value={formData.supplierContact}
                      onChange={(e) => setFormData({...formData, supplierContact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-clinic-green text-white rounded-md hover:bg-clinic-green-hover transition-colors"
                >
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Delete Inventory Item</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{selectedItem.name}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This will permanently remove the item from the inventory.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EnhancedInventory;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import WelcomeCard from '../../components/admin/WelcomeCard';
import RegisterPatientCard from '../../components/admin/RegisterPatientCard';
import MonthlyReportCard from '../../components/admin/MonthlyReportCard';
import bgClinic from '../../assets/images/bg-clinic.png';

const AdminHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRegisterPatient = () => {
    navigate('/admin/registration');
  };

  const handleViewReport = () => {
    navigate('/admin/monthly-report');
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
          <div className="relative z-10 p-3 sm:p-4 md:p-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Welcome Card */}
              <WelcomeCard 
                name={user.username ? `Dr. ${user.username}` : 'Dr. Lhemmuel M. Fiesta'}
                title="Clinic Physician"
              />

              {/* Register New Patient Card */}
              <RegisterPatientCard onClick={handleRegisterPatient} />
            </div>

            {/* Monthly Report Card */}
            <div className="mb-4 sm:mb-6">
              <MonthlyReportCard onClick={handleViewReport} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHome;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import bgClinic from '../../assets/images/bg-clinic.png';
import { env } from '../../config/env';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expirationDate: Date | string;
  deliveryDate?: Date | string;
  supplier?: string;
  cost?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const Inventory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reduceQuantityId, setReduceQuantityId] = useState<string | null>(null);
  const [reduceAmount, setReduceAmount] = useState('');
  const [expirationNotifications, setExpirationNotifications] = useState<InventoryItem[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'pcs',
    expirationDate: '',
    deliveryDate: '',
    supplier: '',
    cost: '',
  });

  // Common units for dropdown
  const commonUnits = [
    'pcs',
    'boxes',
    'bottles',
    'vials',
    'syringes',
    'packs',
    'rolls',
    'ml',
    'l',
    'mg',
    'g',
    'kg',
  ];

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(inventoryItems);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.unit.toLowerCase().includes(query) ||
        (item.supplier && item.supplier.toLowerCase().includes(query))
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, inventoryItems]);

  // Check for expiration notifications
  const checkExpirationNotifications = (items: InventoryItem[]) => {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    
    const expiringItems = items.filter(item => {
      if (!item.expirationDate) return false;
      const expDate = typeof item.expirationDate === 'string' 
        ? new Date(item.expirationDate) 
        : item.expirationDate;
      
      // Check if expired or expiring within 1 month
      return expDate <= oneMonthFromNow;
    });
    
    setExpirationNotifications(expiringItems);
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/api/inventory`);
      const data = await response.json();

      if (data.success) {
        setInventoryItems(data.data);
        setFilteredItems(data.data);
        // Check for expiration notifications
        checkExpirationNotifications(data.data);
      } else {
        setError(data.message || 'Failed to fetch inventory');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${env.API_URL}/api/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddForm(false);
        setFormData({
          name: '',
          quantity: '',
          unit: 'pcs',
          expirationDate: '',
          deliveryDate: '',
          supplier: '',
          cost: '',
        });
        fetchInventory();
      } else {
        alert(data.message || 'Failed to add inventory item');
      }
    } catch (err) {
      console.error('Error adding inventory item:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleReduceQuantity = async (itemId: string) => {
    if (!reduceAmount || Number(reduceAmount) <= 0) {
      alert('Please enter a valid quantity to reduce');
      return;
    }

    try {
      setUpdatingId(itemId);
      const response = await fetch(`${env.API_URL}/api/inventory/${itemId}/quantity`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: Number(reduceAmount) }),
      });

      const data = await response.json();

      if (data.success) {
        setReduceQuantityId(null);
        setReduceAmount('');
        fetchInventory();
      } else {
        alert(data.message || 'Failed to reduce quantity');
      }
    } catch (err) {
      console.error('Error reducing quantity:', err);
      alert('Network error. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`${env.API_URL}/api/inventory/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchInventory();
      } else {
        alert(data.message || 'Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Network error. Please try again.');
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpiringSoon = (expirationDate: Date | string) => {
    if (!expirationDate) return false;
    const dateObj = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate;
    const today = new Date();
    const diffTime = dateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0; // Expiring within 30 days
  };

  const isExpired = (expirationDate: Date | string) => {
    if (!expirationDate) return false;
    const dateObj = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate;
    return dateObj < new Date();
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
                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                  <h1 className="text-2xl sm:text-3xl font-bold text-clinic-green animate-fade-in-up animate-delay-100">Clinic Inventory</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold text-clinic-green">LIFO</span> (Last In First Out) - Newest items are used first
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-6 py-2.5 bg-clinic-green text-white rounded-lg hover:bg-clinic-green-hover hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-sm sm:text-base font-semibold shadow-md animate-scale-in animate-delay-200"
                >
                  {showAddForm ? 'Cancel' : 'Add Item'}
                </button>
              </div>

              {/* Expiration Notifications */}
              {expirationNotifications.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 rounded-xl shadow-professional animate-fade-in-up animate-delay-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Expiration Alert: {expirationNotifications.length} item(s) expiring soon or expired
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          {expirationNotifications.slice(0, 5).map((item) => {
                            const expDate = typeof item.expirationDate === 'string' 
                              ? new Date(item.expirationDate) 
                              : item.expirationDate;
                            const isExpired = expDate < new Date();
                            const daysUntilExpiry = Math.ceil((expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            
                            return (
                              <li key={item.id}>
                                <span className="font-medium">{item.name}</span> - 
                                {isExpired ? (
                                  <span className="text-red-600"> Expired on {formatDate(item.expirationDate)}</span>
                                ) : (
                                  <span> Expires in {daysUntilExpiry} day(s) ({formatDate(item.expirationDate)})</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        {expirationNotifications.length > 5 && (
                          <p className="mt-2 font-medium">...and {expirationNotifications.length - 5} more</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, unit, or supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green focus:border-transparent transition-all duration-200 hover:border-clinic-green/50 input-focus animate-fade-in-up animate-delay-300"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="mt-2 text-sm text-gray-600">
                    Found {filteredItems.length} item(s)
                  </p>
                )}
              </div>

              {/* Add Item Form */}
              {showAddForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Inventory Item</h2>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                        placeholder="e.g., Paracetamol 500mg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supplier
                      </label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                        placeholder="e.g., Medical Supplies Co."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                        placeholder="Enter quantity"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                      >
                        {commonUnits.map(unit => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost per Unit
                      </label>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                        placeholder="e.g., 25.50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Date *
                      </label>
                      <input
                        type="date"
                        name="deliveryDate"
                        value={formData.deliveryDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiration Date *
                      </label>
                      <input
                        type="date"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-clinic-green text-white rounded-lg hover:bg-clinic-green-hover transition-colors font-medium"
                      >
                        Add Item
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                  <p className="mt-4 text-gray-600">Loading inventory...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {!loading && !error && inventoryItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No inventory items found.</p>
                  <p className="text-gray-500 text-sm mt-2">Click "Add Item" to start adding inventory.</p>
                </div>
              )}

              {!loading && !error && inventoryItems.length > 0 && (
                <div className="overflow-x-auto">
                  {/* Mobile Card View */}
                  <div className="block sm:hidden space-y-4">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-professional card-hover animate-fade-in-up"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            {item.supplier && (
                              <p className="text-sm text-gray-600">Supplier: {item.supplier}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isExpired(item.expirationDate)
                              ? 'bg-red-100 text-red-800'
                              : isExpiringSoon(item.expirationDate)
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isExpired(item.expirationDate)
                              ? 'Expired'
                              : isExpiringSoon(item.expirationDate)
                              ? 'Expiring Soon'
                              : 'Active'}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                          <p>
                            <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
                          </p>
                          {item.cost && (
                            <p>
                              <span className="font-medium">Cost per Unit:</span> ₱{parseFloat(item.cost.toString()).toFixed(2)}
                            </p>
                          )}
                          {item.deliveryDate && (
                            <p>
                              <span className="font-medium">Delivery Date:</span> {formatDate(item.deliveryDate)}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Expiration Date:</span>{' '}
                            <span className={isExpired(item.expirationDate) ? 'text-red-600 font-semibold' : ''}>
                              {formatDate(item.expirationDate)}
                            </span>
                          </p>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {reduceQuantityId === item.id ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="number"
                                value={reduceAmount}
                                onChange={(e) => setReduceAmount(e.target.value)}
                                placeholder="Qty"
                                min="1"
                                max={item.quantity}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <button
                                onClick={() => handleReduceQuantity(item.id)}
                                disabled={updatingId === item.id}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400"
                              >
                                {updatingId === item.id ? '...' : 'Reduce'}
                              </button>
                              <button
                                onClick={() => {
                                  setReduceQuantityId(null);
                                  setReduceAmount('');
                                }}
                                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setReduceQuantityId(item.id);
                                  setReduceAmount('');
                                }}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Reduce
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <table className="hidden sm:table w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Item Name
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Supplier
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Quantity
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Cost/Unit
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Delivery Date
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Expiration Date
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-all duration-200 animate-fade-in">
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-medium">
                            {item.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {item.supplier || 'N/A'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {item.cost ? `₱${parseFloat(item.cost.toString()).toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {item.deliveryDate ? formatDate(item.deliveryDate) : 'N/A'}
                          </td>
                          <td className={`border border-gray-300 px-4 py-3 text-sm ${
                            isExpired(item.expirationDate) ? 'text-red-600 font-semibold' : 'text-gray-700'
                          }`}>
                            {formatDate(item.expirationDate)}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isExpired(item.expirationDate)
                                ? 'bg-red-100 text-red-800'
                                : isExpiringSoon(item.expirationDate)
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {isExpired(item.expirationDate)
                                ? 'Expired'
                                : isExpiringSoon(item.expirationDate)
                                ? 'Expiring Soon'
                                : 'Active'}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {reduceQuantityId === item.id ? (
                              <div className="flex gap-2 items-center">
                                <input
                                  type="number"
                                  value={reduceAmount}
                                  onChange={(e) => setReduceAmount(e.target.value)}
                                  placeholder="Qty"
                                  min="1"
                                  max={item.quantity}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <button
                                  onClick={() => handleReduceQuantity(item.id)}
                                  disabled={updatingId === item.id}
                                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium disabled:bg-gray-400"
                                >
                                  {updatingId === item.id ? '...' : 'Reduce'}
                                </button>
                                <button
                                  onClick={() => {
                                    setReduceQuantityId(null);
                                    setReduceAmount('');
                                  }}
                                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setReduceQuantityId(item.id);
                                    setReduceAmount('');
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                                  title="Reduce Quantity"
                                >
                                  Reduce
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
                                  title="Delete Item"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && !error && filteredItems.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Showing {filteredItems.length} of {inventoryItems.length} item(s)
                </div>
              )}

              {!loading && !error && filteredItems.length === 0 && inventoryItems.length > 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No items found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Inventory;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import { env } from '../../config/env';

interface RequestForm {
  id: string;
  fullname: string;
  age: number;
  sex: string;
  civilStatus: string;
  mobileNumber: string;
  yearSection: string;
  schoolIdNumber: string;
  department: string;
  assessment: string;
  requestType: string;
  notes: string;
  email: string;
  userType: string;
  requestDate: any;
  status: string;
  createdAt: any;
  updatedAt: any;
}

const AdminNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<RequestForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${env.API_URL}/api/requests`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        // Filter pending requests
        const pending = data.data.filter((req: RequestForm) => req.status === 'pending');
        setPendingRequests(pending);
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPendingRequests();
    }
  }, [user]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewRequest = () => {
    navigate(`/admin/requested-form`);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pendingRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pendingRequests.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">View and manage all pending requests and notifications</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-red-600">{pendingRequests.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-blue-600">{pendingRequests.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Updated</p>
                    <p className="text-lg font-bold text-gray-900">Just now</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Requests Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Pending Requests</h2>
                  <p className="text-sm text-gray-600 mt-1">Requests awaiting your review and action</p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="itemsPerPage" className="text-sm text-gray-600">Show:</label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                  <span className="text-sm text-gray-600">entries</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Personal Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Academic Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                          <p className="text-gray-500 text-sm mt-2">Loading notifications...</p>
                        </td>
                      </tr>
                    ) : currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                          <p className="text-gray-500">All caught up! No requests need your attention right now.</p>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{request.fullname}</div>
                                <div className="text-sm text-gray-500">{request.email}</div>
                                <div className="text-sm text-gray-500">{request.mobileNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>Age: {request.age}</div>
                              <div>Sex: {request.sex}</div>
                              <div>Civil Status: {request.civilStatus}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>{request.yearSection}</div>
                              <div className="text-gray-500">{request.schoolIdNumber}</div>
                              <div className="text-gray-500">{request.department}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{request.requestType}</div>
                            {request.notes && (
                              <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                {request.notes}
                              </div>
                            )}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                              {request.userType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => navigate(`/admin/requested-form`)}
                              className="text-clinic-green hover:text-clinic-green-hover transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, pendingRequests.length)} of{' '}
                      {pendingRequests.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        Previous
                      </button>
                      
                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 text-sm border rounded-md ${
                              currentPage === number
                                ? 'bg-clinic-green text-white border-clinic-green'
                                : 'border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {number}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {pendingRequests.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => navigate('/admin/requested-form')}
                    className="w-full text-center text-sm text-clinic-green hover:text-clinic-green-hover font-medium py-2 transition-colors"
                  >
                    View All Requests in Requested Form Page
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminNotifications;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import bgClinic from '../../assets/images/bg-clinic.png';
import { env } from '../../config/env';
import ViewRecordsModal from '../../components/ViewRecordsModal';

interface RegistrationForm {
  id: string;
  fullname: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  studentIdLrn?: string;
  age?: string;
  dateOfBirth?: string;
  sex?: string;
  courseYear?: string;
  yearSection: string;
  schoolIdNumber: string;
  departmentCourse: string;
  contactNumber?: string;
  address?: string;
  parentGuardianName?: string;
  parentGuardianContact?: string;
  // Health History
  immunizationRecords?: string;
  previousCheckupRecords?: string;
  previousInjuriesHospitalizations?: string;
  chronicIllnesses?: string;
  status: string;
  createdAt: any;
  updatedAt: any;
}

const RegistrationStudent = () => {
  const { user, canViewStudents, canEditStudents } = useAuth();
  const navigate = useNavigate();

  // Permission check - redirect if user cannot view students
  useEffect(() => {
    if (!canViewStudents()) {
      navigate('/admin/home');
    }
  }, [canViewStudents, navigate]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [registrations, setRegistrations] = useState<RegistrationForm[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<RegistrationForm[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewRecordsModalOpen, setViewRecordsModalOpen] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<RegistrationForm | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Alphabetical sorting function by last name
  const sortByName = (students: RegistrationForm[], order: 'asc' | 'desc' = 'asc') => {
    return [...students].sort((a, b) => {
      // Get last names, fallback to full name if last name is not available
      const lastNameA = a.lastName || a.fullname?.split(' ').pop() || '';
      const lastNameB = b.lastName || b.fullname?.split(' ').pop() || '';
      
      // Capitalize first letter and make the rest lowercase for proper comparison
      const normalizedA = lastNameA.charAt(0).toUpperCase() + lastNameA.slice(1).toLowerCase();
      const normalizedB = lastNameB.charAt(0).toUpperCase() + lastNameB.slice(1).toLowerCase();
      
      if (order === 'asc') {
        return normalizedA.localeCompare(normalizedB);
      } else {
        return normalizedB.localeCompare(normalizedA);
      }
    });
  };

  // Department list - same as request form
  const departments = [
    'College of Business and Accountancy',
    'College of Education',
    'College of Criminology',
    'College of Law',
    'Department of Tourism and Hospitality Industry Management',
    'Computer Studies Department',
    'Psychology Department',
    'Political Science Department',
    'Graduate School',
    'Other',
  ];

  // Form state
  const [formData, setFormData] = useState({
    fullname: '',
    firstName: '',
    middleName: '',
    lastName: '',
    studentIdLrn: '',
    age: '',
    dateOfBirth: '',
    sex: '',
    courseYear: '',
    yearSection: '',
    schoolIdNumber: '',
    departmentCourse: '',
    contactNumber: '',
    address: '',
    parentGuardianName: '',
    parentGuardianContact: '',
    // Health History
    immunizationRecords: '',
    previousCheckupRecords: '',
    previousInjuriesHospitalizations: '',
    chronicIllnesses: '',
  });

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Get unique departments from existing registrations (for filter dropdown)
  const uniqueDepartments = Array.from(new Set(registrations.map(r => r.departmentCourse).filter(Boolean))).sort();

  // Filter registrations based on search, department, and status
  useEffect(() => {
    let filtered = [...registrations];

    // Filter by status tab
    if (activeTab === 'active') {
      filtered = filtered.filter(r => r.status === 'active');
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(r => r.status === 'inactive');
    }

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(r => r.departmentCourse === selectedDepartment);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.fullname.toLowerCase().includes(query) ||
        r.schoolIdNumber.toLowerCase().includes(query) ||
        (r.studentIdLrn && r.studentIdLrn.toLowerCase().includes(query)) ||
        r.yearSection.toLowerCase().includes(query) ||
        r.departmentCourse.toLowerCase().includes(query) ||
        (r.contactNumber && r.contactNumber.toLowerCase().includes(query))
      );
    }

    // Apply alphabetical sorting by last name to filtered results
    const sortedFiltered = sortByName(filtered, sortOrder);
    setFilteredRegistrations(sortedFiltered);
  }, [registrations, activeTab, selectedDepartment, searchQuery, sortOrder]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/api/registrations`);
      const data = await response.json();

      if (data.success) {
        // Sort registrations alphabetically by last name
        const sortedRegistrations = sortByName(data.data, sortOrder);
        setRegistrations(sortedRegistrations);
        setFilteredRegistrations(sortedRegistrations);
      } else {
        setError(data.message || 'Failed to fetch registrations');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleViewRecord = (registration: RegistrationForm) => {
    setSelectedStudent(registration);
    setViewRecordsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${env.API_URL}/api/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddForm(false);
        setFormData({
          fullname: '',
          firstName: '',
          middleName: '',
          lastName: '',
          studentIdLrn: '',
          age: '',
          dateOfBirth: '',
          sex: '',
          courseYear: '',
          yearSection: '',
          schoolIdNumber: '',
          departmentCourse: '',
          contactNumber: '',
          address: '',
          parentGuardianName: '',
          parentGuardianContact: '',
          immunizationRecords: '',
          previousCheckupRecords: '',
          previousInjuriesHospitalizations: '',
          chronicIllnesses: '',
        });
        fetchRegistrations();
      } else {
        alert(data.message || 'Failed to add registration');
      }
    } catch (err) {
      console.error('Error adding registration:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleUpdateStatus = async (registrationId: string, newStatus: 'active' | 'inactive') => {
    try {
      setUpdatingId(registrationId);
      const response = await fetch(`${env.API_URL}/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the registration in the local state
        setRegistrations(registrations.map(reg =>
          reg.id === registrationId
            ? { ...reg, status: newStatus, updatedAt: new Date() }
            : reg
        ));
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Network error. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (registrationId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to delete the record for ${studentName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(registrationId);
      const response = await fetch(`${env.API_URL}/api/registrations/${registrationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove the registration from the local state
        setRegistrations(registrations.filter(reg => reg.id !== registrationId));
        alert('Student record deleted successfully');
      } else {
        alert(data.message || 'Failed to delete record');
      }
    } catch (err) {
      console.error('Error deleting registration:', err);
      alert('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Add toggle sort function
  const toggleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
  };

  const handlePrint = (registration: RegistrationForm) => {

    // Format the date
    const formatDateForPrint = (timestamp: any) => {
      if (!timestamp) return 'N/A';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Create HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Record - ${registration.fullname}</title>
          <style>
            @media print {
              @page {
                margin: 1cm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #10B981;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #10B981;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              background-color: #10B981;
              color: white;
              padding: 10px 15px;
              margin: 0 -20px 15px -20px;
              font-size: 18px;
              font-weight: bold;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              color: #555;
              margin-bottom: 5px;
            }
            .info-value {
              color: #333;
              padding: 5px;
              background-color: #f9f9f9;
              border-left: 3px solid #10B981;
              padding-left: 10px;
            }
            .full-width {
              grid-column: 1 / -1;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 15px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
            }
            .status-active {
              background-color: #D1FAE5;
              color: #065F46;
            }
            .status-inactive {
              background-color: #F3F4F6;
              color: #374151;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              .no-print {
                display: none;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>STUDENT REGISTRATION RECORD</h1>
            <p>University Medical Clinic</p>
            <p>Printed on: ${new Date().toLocaleString('en-US')}</p>
          </div>

          <div class="section">
            <div class="section-title">1. Student Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${registration.fullname || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Student ID / LRN</div>
                <div class="info-value">${registration.studentIdLrn || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">First Name</div>
                <div class="info-value">${registration.firstName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Middle Name</div>
                <div class="info-value">${registration.middleName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Last Name</div>
                <div class="info-value">${registration.lastName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">School ID Number</div>
                <div class="info-value">${registration.schoolIdNumber || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Age</div>
                <div class="info-value">${registration.age || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date of Birth</div>
                <div class="info-value">${registration.dateOfBirth || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Sex</div>
                <div class="info-value">${registration.sex || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Course & Year</div>
                <div class="info-value">${registration.courseYear || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Year & Section</div>
                <div class="info-value">${registration.yearSection || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Department/Course</div>
                <div class="info-value">${registration.departmentCourse || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Contact Number</div>
                <div class="info-value">${registration.contactNumber || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge ${registration.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${registration.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div class="info-item full-width">
                <div class="info-label">Address</div>
                <div class="info-value">${registration.address || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">2. Parent/Guardian Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Parent/Guardian Name</div>
                <div class="info-value">${registration.parentGuardianName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Parent/Guardian Contact</div>
                <div class="info-value">${registration.parentGuardianContact || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">3. Health History</div>
            <div class="info-grid">
              <div class="info-item full-width">
                <div class="info-label">Immunization Records</div>
                <div class="info-value">${registration.immunizationRecords || 'N/A'}</div>
              </div>
              <div class="info-item full-width">
                <div class="info-label">Previous Check-up Records</div>
                <div class="info-value">${registration.previousCheckupRecords || 'N/A'}</div>
              </div>
              <div class="info-item full-width">
                <div class="info-label">Previous Injuries / Hospitalizations</div>
                <div class="info-value">${registration.previousInjuriesHospitalizations || 'N/A'}</div>
              </div>
              <div class="info-item full-width">
                <div class="info-label">Chronic Illnesses</div>
                <div class="info-value">${registration.chronicIllnesses || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">4. Record Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Date Registered</div>
                <div class="info-value">${formatDateForPrint(registration.createdAt)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Last Updated</div>
                <div class="info-value">${formatDateForPrint(registration.updatedAt)}</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This is an official document from the University Medical Clinic</p>
            <p>Record ID: ${registration.id}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };


  const getStatusBadge = (status: string) => {
    const isActive = status === 'active';
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                <h1 className="text-2xl sm:text-3xl font-bold text-clinic-green animate-fade-in-up animate-delay-100">Student Records</h1>
                {canEditStudents() && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-6 py-2.5 bg-clinic-green text-white rounded-lg hover:bg-clinic-green-hover hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-sm sm:text-base font-semibold shadow-md animate-scale-in animate-delay-200"
                >
                  {showAddForm ? 'Cancel' : 'Add Student'}
                </button>
              )}
              </div>

              {/* Status Tabs */}
              <div className="mb-6 border-b border-gray-200 animate-fade-in-up animate-delay-200">
                <nav className="flex space-x-4" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`py-2.5 px-4 border-b-2 font-semibold text-sm transition-all duration-300 ${
                      activeTab === 'all'
                        ? 'border-clinic-green text-clinic-green scale-105'
                        : 'border-transparent text-gray-500 hover:text-clinic-green hover:border-clinic-green/50'
                    }`}
                  >
                    All Students ({registrations.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`py-2.5 px-4 border-b-2 font-semibold text-sm transition-all duration-300 ${
                      activeTab === 'active'
                        ? 'border-clinic-green text-clinic-green scale-105'
                        : 'border-transparent text-gray-500 hover:text-clinic-green hover:border-clinic-green/50'
                    }`}
                  >
                    Active ({registrations.filter(r => r.status === 'active').length})
                  </button>
                  <button
                    onClick={() => setActiveTab('inactive')}
                    className={`py-2.5 px-4 border-b-2 font-semibold text-sm transition-all duration-300 ${
                      activeTab === 'inactive'
                        ? 'border-clinic-green text-clinic-green scale-105'
                        : 'border-transparent text-gray-500 hover:text-clinic-green hover:border-clinic-green/50'
                    }`}
                  >
                    Inactive ({registrations.filter(r => r.status === 'inactive').length})
                  </button>
                </nav>
              </div>

              {/* Search and Filter Bar */}
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, ID, department, or contact..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green focus:border-transparent transition-all duration-200 hover:border-clinic-green/50 input-focus animate-fade-in-up animate-delay-300"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Department Filter */}
                <div>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green focus:border-transparent bg-white transition-all duration-200 hover:border-clinic-green/50 input-focus animate-fade-in-up animate-delay-400"
                  >
                    <option value="">All Departments</option>
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Button */}
                <div>
                  <button
                    onClick={toggleSort}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green focus:border-transparent bg-white transition-all duration-200 hover:border-clinic-green/50 input-focus animate-fade-in-up animate-delay-500 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <span className="text-gray-700">
                      Sort: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                    </span>
                  </button>
                </div>
              </div>

              {searchQuery || selectedDepartment ? (
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredRegistrations.length} of {registrations.length} student(s)
                </div>
              ) : null}

              {/* Add Registration Form */}
              {showAddForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Student Registration</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Section 1: Student Information */}
                    <div className="border-b border-gray-300 pb-4">
                      <h3 className="text-lg font-semibold text-clinic-green mb-3">1. Student Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Student ID / LRN *
                          </label>
                          <input
                            type="text"
                            name="studentIdLrn"
                            value={formData.studentIdLrn}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Enter Student ID or LRN"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Middle Name
                          </label>
                          <input
                            type="text"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Middle name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Last name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Age *
                          </label>
                          <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Enter age"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth *
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sex *
                          </label>
                          <select
                            name="sex"
                            value={formData.sex}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent bg-white"
                          >
                            <option value="">Select Sex</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course & Year *
                          </label>
                          <input
                            type="text"
                            name="courseYear"
                            value={formData.courseYear}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="e.g., BSIT - 3rd Year"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year & Section *
                          </label>
                          <input
                            type="text"
                            name="yearSection"
                            value={formData.yearSection}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="e.g., 3rd Year - Section A"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department/Course *
                          </label>
                          <select
                            name="departmentCourse"
                            value={formData.departmentCourse}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent bg-white"
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            School ID Number *
                          </label>
                          <input
                            type="text"
                            name="schoolIdNumber"
                            value={formData.schoolIdNumber}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Enter school ID"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number *
                          </label>
                          <input
                            type="text"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Enter contact number"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address *
                          </label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Enter address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Parent/Guardian Name *
                          </label>
                          <input
                            type="text"
                            name="parentGuardianName"
                            value={formData.parentGuardianName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Enter parent/guardian name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Parent/Guardian Contact *
                          </label>
                          <input
                            type="text"
                            name="parentGuardianContact"
                            value={formData.parentGuardianContact}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Enter parent/guardian contact"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 6: Health History */}
                    <div className="border-b border-gray-300 pb-4">
                      <h3 className="text-lg font-semibold text-clinic-green mb-3">6. Health History</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Immunization Records
                          </label>
                          <textarea
                            name="immunizationRecords"
                            value={formData.immunizationRecords}
                            onChange={(e) => setFormData({ ...formData, immunizationRecords: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Enter immunization records (e.g., vaccines received, dates)"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Previous Check-up Records
                          </label>
                          <textarea
                            name="previousCheckupRecords"
                            value={formData.previousCheckupRecords}
                            onChange={(e) => setFormData({ ...formData, previousCheckupRecords: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Enter previous check-up records"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Previous Injuries / Hospitalizations
                          </label>
                          <textarea
                            name="previousInjuriesHospitalizations"
                            value={formData.previousInjuriesHospitalizations}
                            onChange={(e) => setFormData({ ...formData, previousInjuriesHospitalizations: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Enter previous injuries or hospitalizations"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chronic Illnesses
                          </label>
                          <textarea
                            name="chronicIllnesses"
                            value={formData.chronicIllnesses}
                            onChange={(e) => setFormData({ ...formData, chronicIllnesses: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent"
                            placeholder="Enter chronic illnesses (e.g., Asthma, diabetes, heart condition, etc.)"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-clinic-green text-white rounded-lg hover:bg-clinic-green-hover transition-colors font-medium"
                      >
                        Add Registration
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                  <p className="mt-4 text-gray-600">Loading registrations...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {!loading && !error && filteredRegistrations.length === 0 && registrations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No student records found.</p>
                  <p className="text-gray-500 text-sm mt-2">Click "Add Student" to start adding students.</p>
                </div>
              )}

              {!loading && !error && filteredRegistrations.length === 0 && registrations.length > 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No students found matching your filters.</p>
                </div>
              )}

              {!loading && !error && filteredRegistrations.length > 0 && (
                <div className="overflow-x-auto">
                  {/* Mobile Card View */}
                  <div className="block sm:hidden space-y-4">
                    {filteredRegistrations.map((registration) => (
                      <div
                        key={registration.id}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-professional card-hover animate-fade-in-up"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900">{registration.fullname}</h3>
                          {getStatusBadge(registration.status || 'active')}
                        </div>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Student ID/LRN:</span> {registration.studentIdLrn || 'N/A'}
                          </p>
                          <p>
                            <span className="font-medium">Year & Section:</span> {registration.yearSection}
                          </p>
                          <p>
                            <span className="font-medium">School ID:</span> {registration.schoolIdNumber}
                          </p>
                          <p>
                            <span className="font-medium">Department/Course:</span> {registration.departmentCourse}
                          </p>
                          <p>
                            <span className="font-medium">Contact:</span> {registration.contactNumber || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 mt-3">
                            Registered: {formatDate(registration.createdAt)}
                          </p>
                        </div>
                        {/* Action Buttons */}
                        <div className="mt-4 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewRecord(registration)}
                              className="flex-1 px-3 py-2 bg-clinic-green text-white rounded-lg hover:bg-clinic-green-hover transition-colors text-sm font-medium"
                            >
                              View Record
                            </button>
                            <button
                              onClick={() => handlePrint(registration)}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Print
                            </button>
                          </div>
                          <div className="flex gap-2">
                            {registration.status === 'active' ? (
                              <button
                                onClick={() => handleUpdateStatus(registration.id, 'inactive')}
                                disabled={updatingId === registration.id}
                                className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                {updatingId === registration.id ? 'Updating...' : 'Set Inactive'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(registration.id, 'active')}
                                disabled={updatingId === registration.id}
                                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                {updatingId === registration.id ? 'Updating...' : 'Set Active'}
                              </button>
                            )}
                            {canEditStudents() && (
                              <button
                                onClick={() => handleDelete(registration.id, registration.fullname)}
                                disabled={deletingId === registration.id}
                                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                {deletingId === registration.id ? 'Deleting...' : 'Delete'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <table className="hidden sm:table w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Fullname
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Student ID/LRN
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Year & Section
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          School ID
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Department/Course
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Contact
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((registration) => (
                        <tr key={registration.id} className="hover:bg-gray-50 transition-all duration-200 animate-fade-in">
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-medium">
                            {registration.fullname}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {registration.studentIdLrn || 'N/A'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {registration.yearSection}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {registration.schoolIdNumber}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {registration.departmentCourse}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {registration.contactNumber || 'N/A'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {getStatusBadge(registration.status || 'active')}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleViewRecord(registration)}
                                className="px-3 py-1 bg-clinic-green text-white rounded hover:bg-clinic-green-hover transition-colors text-xs font-medium"
                                title="View Record"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handlePrint(registration)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                                title="Print Record"
                              >
                                Print
                              </button>
                              {registration.status === 'active' ? (
                                <button
                                  onClick={() => handleUpdateStatus(registration.id, 'inactive')}
                                  disabled={updatingId === registration.id}
                                  className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-xs font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  title="Set Inactive"
                                >
                                  {updatingId === registration.id ? '...' : 'Inactive'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStatus(registration.id, 'active')}
                                  disabled={updatingId === registration.id}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  title="Set Active"
                                >
                                  {updatingId === registration.id ? '...' : 'Active'}
                                </button>
                              )}
                              {canEditStudents() && (
                              <button
                                onClick={() => handleDelete(registration.id, registration.fullname)}
                                disabled={deletingId === registration.id}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                title="Delete Record"
                              >
                                {deletingId === registration.id ? '...' : 'Delete'}
                              </button>
                            )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && !error && filteredRegistrations.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Showing {filteredRegistrations.length} of {registrations.length} student(s)
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* View Records Modal */}
      {selectedStudent && (
        <ViewRecordsModal
          isOpen={viewRecordsModalOpen}
          onClose={() => {
            setViewRecordsModalOpen(false);
            setSelectedStudent(null);
          }}
          studentId={selectedStudent.id}
          studentData={{
            fullname: selectedStudent.fullname,
            firstName: selectedStudent.firstName,
            middleName: selectedStudent.middleName,
            lastName: selectedStudent.lastName,
            schoolIdNumber: selectedStudent.schoolIdNumber,
            department: selectedStudent.departmentCourse,
            yearSection: selectedStudent.yearSection,
          }}
        />
      )}
    </div>
  );
};

export default RegistrationStudent;
import { useState, useEffect } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Report state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [chronologicalData, setChronologicalData] = useState<ChronologicalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const renderOverviewTab = () => {
    if (!reportData) return null;

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
                reportData?.summary?.totalInventoryAdded > reportData?.summary?.totalInventoryConsumed 
                  ? 'text-green-600' 
                  : reportData?.summary?.totalInventoryAdded < reportData?.summary?.totalInventoryConsumed 
                  ? 'text-red-600' 
                  : 'text-gray-600'
              }`}>
                {(reportData?.summary?.totalInventoryAdded || 0) - (reportData?.summary?.totalInventoryConsumed || 0)}
              </div>
              <div className="text-sm text-gray-600">
                {reportData?.summary?.totalInventoryAdded > reportData?.summary?.totalInventoryConsumed ? 'Net Gain' : 
                 reportData?.summary?.totalInventoryAdded < reportData?.summary?.totalInventoryConsumed ? 'Net Loss' : 'Balanced'}
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
} from 'recharts';

interface MonthlyData {
  month: string;
  requests: number;
  registrations: number;
  total: number;
}

interface MedicationData {
  medication: string;
  requests: number;
}

interface AssessmentData {
  assessment: string;
  count: number;
}

interface DepartmentData {
  department: string;
  count: number;
}

interface ReportData {
  monthlyData: MonthlyData[];
  medicationData: MedicationData[];
  assessmentData: AssessmentData[];
  departmentData: DepartmentData[];
  totalRequests: number;
  totalRegistrations: number;
  totalStudents: number;
  requestStudents: number;
  registrationStudents: number;
}

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchReports();
  }, [selectedYear, selectedMonth]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.append('year', selectedYear.toString());
      if (selectedMonth) {
        params.append('month', selectedMonth);
      }

      const response = await fetch(`${env.API_URL}/api/reports/medication?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setReportData(data.data);
      } else {
        setError(data.message || 'Failed to fetch reports');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (!user) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

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
                <h1 className="text-2xl sm:text-3xl font-bold text-clinic-green animate-fade-in-up animate-delay-100">Monthly Reports</h1>
                <div className="flex gap-2 flex-wrap animate-fade-in-up animate-delay-200">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent text-sm transition-all duration-200 hover:border-clinic-green/50 input-focus shadow-sm"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinic-green focus:border-transparent text-sm transition-all duration-200 hover:border-clinic-green/50 input-focus shadow-sm"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                  <p className="mt-4 text-gray-600">Loading reports...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {!loading && !error && reportData && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-600 font-medium">Total Request Forms</p>
                      <p className="text-2xl font-bold text-blue-900">{reportData.totalRequests}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-600 font-medium">Total Student Records</p>
                      <p className="text-2xl font-bold text-green-900">{reportData.totalRegistrations}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-600 font-medium">Total Unique Students</p>
                      <p className="text-2xl font-bold text-purple-900">{reportData.totalStudents}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <p className="text-sm text-orange-600 font-medium">Medication Types</p>
                      <p className="text-2xl font-bold text-orange-900">{reportData.medicationData.length}</p>
                    </div>
                  </div>

                  {/* Monthly Request Forms and Student Records Chart */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Monthly Request Forms & Student Records
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={reportData.monthlyData}>
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
                              if (nameStr === 'requests') return [`${numValue} requests`, 'Request Forms'];
                              if (nameStr === 'registrations') return [`${numValue} records`, 'Student Records'];
                              return [`${numValue} total`, 'Total'];
                            }}
                            labelFormatter={(label) => `Month: ${formatMonthLabel(label)}`}
                          />
                          <Legend />
                          <Bar dataKey="requests" fill="#3B82F6" name="Request Forms" />
                          <Bar dataKey="registrations" fill="#10B981" name="Student Records" />
                          <Bar dataKey="total" fill="#8B5CF6" name="Total" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Medications Chart */}
                  {reportData.medicationData.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Most Requested Medications
                      </h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Bar Chart */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={reportData.medicationData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis dataKey="medication" type="category" width={120} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="requests" fill="#10B981" name="Number of Requests" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                              <Pie
                                data={reportData.medicationData as unknown as Array<Record<string, unknown>>}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(props: unknown) => {
                                  const data = props as MedicationData;
                                  return `${data.medication}: ${data.requests}`;
                                }}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="requests"
                              >
                                {reportData.medicationData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assessment Types Chart */}
                  {reportData.assessmentData && reportData.assessmentData.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Assessment Types from Request Forms
                      </h2>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={reportData.assessmentData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="assessment" type="category" width={150} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#F59E0B" name="Number of Requests" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Department Chart */}
                  {reportData.departmentData && reportData.departmentData.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Requests & Records by Department
                      </h2>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={reportData.departmentData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="department" type="category" width={150} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#EC4899" name="Total Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {reportData.monthlyData.length === 0 && reportData.totalRequests === 0 && reportData.totalRegistrations === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-600 text-lg">No data available for the selected period.</p>
                      <p className="text-gray-500 text-sm mt-2">Please select a different year or month, or add request forms and student records.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import bgClinic from '../../assets/images/bg-clinic.png';
import { env } from '../../config/env';

interface RequestForm {
  id: string;
  fullname: string;
  yearSection: string;
  schoolIdNumber: string;
  department: string;
  assessment: string;
  email: string;
  requestDate?: any;
  status: string;
  createdAt: any;
  updatedAt: any;
}

const RequestedForms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [requests, setRequests] = useState<RequestForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/api/requests`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
      } else {
        setError(data.message || 'Failed to fetch requests');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      setUpdatingId(requestId);
      const response = await fetch(`${env.API_URL}/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the request in the local state
        setRequests(requests.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus, updatedAt: new Date() }
            : req
        ));
        
        // Show detailed success message with email confirmation
        const statusMessages = {
          approved: 'Request approved! Student has been notified via email.',
          rejected: 'Request rejected! Student has been notified via email.',
          processing: 'Request set to processing! Student has been notified via email.',
          pending: 'Request reset to pending! Student has been notified via email.'
        };
        
        const message = statusMessages[newStatus as keyof typeof statusMessages] || 
                       `Status updated to ${newStatus}. Email notification sent to student.`;
        
        alert(message);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Network error. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(requestId);
      const response = await fetch(`${env.API_URL}/api/requests/${requestId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove the request from the local state
        setRequests(requests.filter(req => req.id !== requestId));
        alert('Request deleted successfully.');
      } else {
        alert(data.message || 'Failed to delete request');
      }
    } catch (err) {
      console.error('Error deleting request:', err);
      alert('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-clinic-green animate-fade-in-up animate-delay-100">Requested Forms</h1>
              </div>

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                  <p className="mt-4 text-gray-600">Loading requests...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {!loading && !error && requests.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No request forms found.</p>
                </div>
              )}

              {!loading && !error && requests.length > 0 && (
                <div className="overflow-x-auto">
                  {/* Mobile Card View */}
                  <div className="block sm:hidden space-y-4">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-professional card-hover animate-fade-in-up"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900">{request.fullname}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Year & Section:</span> {request.yearSection}
                          </p>
                          <p>
                            <span className="font-medium">School ID:</span> {request.schoolIdNumber}
                          </p>
                          <p>
                            <span className="font-medium">Department:</span> {request.department}
                          </p>
                          <p>
                            <span className="font-medium">Assessment:</span> {request.assessment}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span> {request.email}
                          </p>
                          {request.requestDate && (
                            <p>
                              <span className="font-medium">Request Date & Time:</span> {formatDate(request.requestDate)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-3">
                            Submitted: {formatDate(request.createdAt)}
                          </p>
                        </div>
                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(request.id, 'approved')}
                                disabled={updatingId === request.id}
                                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                {updatingId === request.id ? 'Updating...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(request.id, 'rejected')}
                                disabled={updatingId === request.id}
                                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                {updatingId === request.id ? 'Updating...' : 'Reject'}
                              </button>
                            </>
                          )}
                          {(request.status === 'approved' || request.status === 'rejected') && (
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'pending')}
                              disabled={updatingId === request.id}
                                className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {updatingId === request.id ? 'Updating...' : 'Reset to Pending'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(request.id)}
                            disabled={deletingId === request.id}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {deletingId === request.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <table className="hidden sm:table w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Fullname
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Year & Section
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          School ID
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Department
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                         Form Request
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Email
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Request Date & Time
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50 transition-all duration-200 animate-fade-in">
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                            {request.fullname}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {request.yearSection}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {request.schoolIdNumber}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {request.department}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {request.assessment}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {request.email}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {request.requestDate ? formatDate(request.requestDate) : 'N/A'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex gap-2">
                              {request.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(request.id, 'approved')}
                                    disabled={updatingId === request.id}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    title="Approve"
                                  >
                                    {updatingId === request.id ? '...' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(request.id, 'rejected')}
                                    disabled={updatingId === request.id}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    title="Reject"
                                  >
                                    {updatingId === request.id ? '...' : 'Reject'}
                                  </button>
                                </>
                              )}
                              {(request.status === 'approved' || request.status === 'rejected') && (
                                <button
                                  onClick={() => handleUpdateStatus(request.id, 'pending')}
                                  disabled={updatingId === request.id}
                                  className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-xs font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  title="Reset to Pending"
                                >
                                  {updatingId === request.id ? '...' : 'Reset'}
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(request.id)}
                                disabled={deletingId === request.id}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                title="Delete Request"
                              >
                                {deletingId === request.id ? '...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && !error && requests.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Total Requests: <span className="font-semibold">{requests.length}</span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestedForms;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import { DEV_CONFIG } from '../../config/dev-config';

interface User {
  id: string;
  username: string;
  role: string;
  fullName: string;
  email: string;
  contactNumber: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student_assistant',
    fullName: '',
    email: '',
    contactNumber: '',
    studentId: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const fetchUsers = async () => {
    // Check if user management feature is available
    if (!DEV_CONFIG.FEATURES.USER_MANAGEMENT) {
      console.log('User management feature not available in production');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/auth/users`);
      
      // Check if response is ok and get content type
      if (!response.ok) {
        const text = await response.text();
        console.error('Server returned error:', response.status, text);
        
        // If it's a 404, the feature might not be deployed yet
        if (response.status === 404) {
          console.log('User management endpoints not deployed yet');
          return;
        }
        
        throw new Error(`Server error: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        console.error('API error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // Check if response is ok and get content type
      if (!response.ok) {
        const text = await response.text();
        console.error('Server returned error:', response.status, text);
        alert(`Server error: ${response.status}`);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        alert('Server returned non-JSON response');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        setShowCreateModal(false);
        setFormData({
          username: '',
          password: '',
          role: 'student_assistant',
          fullName: '',
          email: '',
          contactNumber: '',
          studentId: ''
        });
        fetchUsers();
        alert('User created successfully!');
      } else {
        // Handle specific duplicate errors
        if (result.type === 'username') {
          alert(`Username "${formData.username}" already exists. Please choose a different username.`);
        } else if (result.type === 'fullName') {
          const existing = result.existingUser;
          alert(`⚠️ Duplicate User Detected!\n\nA user with the name "${formData.fullName}" already exists:\n\n• Name: ${existing.fullName}\n• Role: ${existing.role}\n• Student ID: ${existing.studentId || 'Not specified'}\n\nPlease verify if this is the same person or use a different name.`);
        } else if (result.type === 'studentId') {
          const existing = result.existingUser;
          alert(`⚠️ Duplicate Student ID!\n\nStudent ID "${formData.studentId}" is already registered to:\n\n• Name: ${existing.fullName}\n• Role: ${existing.role}\n• Student ID: ${existing.studentId}\n\nPlease verify the student ID or contact the existing user.`);
        } else if (result.type === 'email') {
          const existing = result.existingUser;
          alert(`⚠️ Duplicate Email!\n\nEmail "${formData.email}" is already registered to:\n\n• Name: ${existing.fullName}\n• Role: ${existing.role}\n• Email: ${existing.email}\n\nPlease use a different email address.`);
        } else if (result.type === 'contactNumber') {
          const existing = result.existingUser;
          alert(`⚠️ Duplicate Contact Number!\n\nContact number "${formData.contactNumber}" is already registered to:\n\n• Name: ${existing.fullName}\n• Role: ${existing.role}\n• Contact: ${existing.contactNumber}\n\nPlease use a different contact number.`);
        } else {
          alert(result.message || 'Failed to create user');
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/auth/users/${userId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        fetchUsers();
        alert('User deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${DEV_CONFIG.API_URL}/api/auth/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const result = await response.json();
      
      if (result.success) {
        fetchUsers();
      } else {
        alert(result.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'nurse':
        return 'bg-blue-100 text-blue-800';
      case 'student_assistant':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'nurse':
        return 'Nurse';
      case 'student_assistant':
        return 'Student Assistant';
      default:
        return role;
    }
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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                <p className="text-gray-600">Create and manage user accounts for the clinic system</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!DEV_CONFIG.FEATURES.USER_MANAGEMENT}
                className={`px-4 py-2 rounded-md transition-colors ${
                  DEV_CONFIG.FEATURES.USER_MANAGEMENT 
                    ? 'bg-clinic-green text-white hover:bg-clinic-green-hover' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {DEV_CONFIG.FEATURES.USER_MANAGEMENT ? 'Create New User' : 'Feature Not Available'}
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">System Users</h2>
                <p className="text-sm text-gray-600 mt-1">All registered users in the clinic system</p>
                {!DEV_CONFIG.FEATURES.USER_MANAGEMENT && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Feature Unavailable:</strong> User management is only available in development mode. 
                      Run the local server to access this feature.
                    </p>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
                    <p className="text-gray-500 text-sm mt-2">Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">Get started by creating your first user account.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{userItem.fullName}</div>
                              <div className="text-sm text-gray-500">@{userItem.username}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(userItem.role)}`}>
                              {getRoleLabel(userItem.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{userItem.email || 'N/A'}</div>
                            <div>{userItem.contactNumber || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userItem.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {userItem.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(userItem.createdAt?.toDate?.() || userItem.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleToggleUserStatus(userItem.id, userItem.isActive)}
                              className={`mr-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                userItem.isActive
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {userItem.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            {userItem.id !== user.id && (
                              <button
                                onClick={() => handleDeleteUser(userItem.id)}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New User</h2>
            
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  >
                    <option value="student_assistant">Student Assistant</option>
                    <option value="nurse">Nurse</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                    placeholder="e.g., 123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-clinic-green text-white rounded-md hover:bg-clinic-green-hover transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
