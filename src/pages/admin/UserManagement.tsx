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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
