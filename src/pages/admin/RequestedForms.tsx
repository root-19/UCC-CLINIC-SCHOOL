import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import bgClinic from '../../assets/images/bg-clinic.png';
import { env } from '../../config/env';
import { sendEmailNotification, createApprovalEmailTemplate, createRejectionEmailTemplate, createProcessingEmailTemplate } from '../../utils/emailService';
import { uploadFile, validateFile, formatFileSize, getFileIcon, type UploadedFile } from '../../utils/fileUpload';

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
  attachments?: UploadedFile[];
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
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestForm | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Convert to Philippine time (UTC+8)
    const phTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
    return phTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila'
    });
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      setUpdatingId(requestId);
      
      // Find the request to get details for email
      const request = requests.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Update status via API
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
        
        // Send email notification based on status
        let emailTemplate;
        let emailMessage;

        switch (newStatus) {
          case 'approved':
            emailTemplate = createApprovalEmailTemplate(request.fullname, request);
            emailMessage = 'Request approved! Student has been notified via email with attachments.';
            break;
          case 'rejected':
            emailTemplate = createRejectionEmailTemplate(request.fullname, request, rejectionReason);
            emailMessage = 'Request rejected! Student has been notified via email.';
            break;
          case 'processing':
            emailTemplate = createProcessingEmailTemplate(request.fullname, request);
            emailMessage = 'Request set to processing! Student has been notified via email.';
            break;
          case 'pending':
            emailTemplate = createProcessingEmailTemplate(request.fullname, request);
            emailMessage = 'Request reset to pending! Student has been notified via email.';
            break;
          default:
            emailMessage = `Status updated to ${newStatus}.`;
        }

        // Send email notification if template exists
        if (emailTemplate) {
          try {
            console.log('Sending email notification...');
            console.log('Email template exists:', !!emailTemplate);
            
            const emailResult = await sendEmailNotification({
              to: request.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html
            });

            console.log('Email notification result:', emailResult);

            if (emailResult.success) {
              console.log('Email notification sent successfully');
            } else {
              console.error('Email notification failed:', emailResult.message);
              if (emailResult.message.includes('SMTP configuration')) {
                emailMessage += ' (Email notification failed - Gmail App Password needs setup)';
              } else {
                emailMessage += ' (Email notification failed)';
              }
            }
          } catch (emailError) {
            console.error('Email service error:', emailError);
            console.error('Full email error details:', JSON.stringify(emailError, null, 2));
            
            // Check if it's a network error
            if (emailError instanceof TypeError && emailError.message.includes('fetch')) {
              emailMessage += ' (Email notification failed - Network error)';
            } else if (emailError instanceof TypeError && emailError.message.includes('NetworkError')) {
              emailMessage += ' (Email notification failed - CORS/Network issue)';
            } else {
              emailMessage += ' (Email notification failed)';
            }
          }
        } else {
          console.log('No email template found for status:', newStatus);
        }
        
        alert(emailMessage);
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

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validation = validateFile(file);
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        return false;
      }
      return true;
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (requestId: string) => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    try {
      setUploadingFile(true);
      const uploadedFiles: UploadedFile[] = [];

      for (const file of selectedFiles) {
        const uploadedFile = await uploadFile(file);
        uploadedFiles.push(uploadedFile);
      }

      // Update request with attachments
      const response = await fetch(`${env.API_URL}/api/requests/${requestId}/attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attachments: uploadedFiles }),
      });

      if (response.ok) {
        // Update local state
        setRequests(requests.map(req => 
          req.id === requestId 
            ? { ...req, attachments: [...(req.attachments || []), ...uploadedFiles] }
            : req
        ));
        
        setSelectedFiles([]);
        setShowAttachmentModal(false);
        alert('Files uploaded successfully!');
      } else {
        throw new Error('Failed to attach files to request');
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const openAttachmentModal = (request: RequestForm) => {
    setSelectedRequest(request);
    setShowAttachmentModal(true);
  };

  const openRejectionModal = (request: RequestForm) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const handleRejectWithReason = async () => {
    if (!selectedRequest) return;
    
    await handleUpdateStatus(selectedRequest.id, 'rejected');
    setShowRejectionModal(false);
    setSelectedRequest(null);
    setRejectionReason('');
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
                          {request.attachments && request.attachments.length > 0 && (
                            <p>
                              <span className="font-medium">Attachments:</span> {request.attachments.length} file(s)
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
                                onClick={() => openRejectionModal(request)}
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
                            onClick={() => openAttachmentModal(request)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-sm font-medium"
                          >
                            📎 Attach
                          </button>
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
                          Attachments
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
                            {request.attachments && request.attachments.length > 0 ? (
                              <div className="flex items-center">
                                <span className="text-blue-600">📎 {request.attachments.length} file(s)</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">No attachments</span>
                            )}
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
                                    onClick={() => openRejectionModal(request)}
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
                                onClick={() => openAttachmentModal(request)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                                title="Attach Files"
                              >
                                📎
                              </button>
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

      {/* Attachment Modal */}
      {showAttachmentModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Attach Files - {selectedRequest.fullname}
            </h2>
            
            {/* Existing Attachments */}
            {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Existing Attachments</h3>
                <div className="space-y-2">
                  {selectedRequest.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFileIcon(attachment.type)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Add New Files</h3>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-clinic-green transition-colors"
              >
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Click to select files or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, Word, Images (Max 5MB per file)</p>
                </div>
              </button>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Files</h3>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFileIcon(file.type)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAttachmentModal(false);
                  setSelectedRequest(null);
                  setSelectedFiles([]);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFileUpload(selectedRequest.id)}
                disabled={uploadingFile || selectedFiles.length === 0}
                className="px-4 py-2 bg-clinic-green text-white rounded-md hover:bg-clinic-green-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploadingFile ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Reject Request</h3>
                <p className="text-sm text-gray-500">{selectedRequest.fullname}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-green"
                placeholder="Provide a reason for rejecting this request..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectWithReason}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestedForms;
