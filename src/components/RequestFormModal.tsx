import { useState, useEffect } from 'react';
import Modal from './Modal';
import bgClinic from '../assets/images/bg-clinic.png';
import { env } from '../config/env';

interface RequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequestFormModal = ({ isOpen, onClose }: RequestFormModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    age: '',
    sex: '',
    civilStatus: '',
    mobileNumber: '',
    yearSection: '',
    schoolIdNumber: '',
    department: '',
    assessment: '',
    email: '',
    requestDateTime: '',
    userType: 'student',
    requestType: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Department list
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

  // Request types list
  const requestTypes = [
    'Medical Record',
    'Medical Certificate',
    'Fit to Work',
    'Laboratory Referral',
    'Appointment for Dental Check Up',
    'Appointment for General Check Up',
  ];

  // Sex options
  const sexOptions = ['Male', 'Female'];

  // Civil status options
  const civilStatusOptions = [
    'Single',
    'Married',
    'Divorced',
    'Widowed',
    'Separated',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Set default date and time to current date/time
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      // Format for datetime-local input: YYYY-MM-DDTHH:mm
      const dateTimeStr = now.toISOString().slice(0, 16);
      
      setFormData(prev => ({
        ...prev,
        requestDateTime: prev.requestDateTime || dateTimeStr,
      }));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate Student ID Number format
    const studentIdPattern = /^[0-9]{8}-[A-Z]$/;
    if (!studentIdPattern.test(formData.schoolIdNumber)) {
      setError('Student ID Number must be in format: 8 digits, dash, 1 letter (e.g., 12345678-A)');
      setLoading(false);
      return;
    }

    // Validate assessment field
    if (!formData.assessment || formData.assessment.trim() === '') {
      setError('Assessment/Complaint field is required. Please describe your medical condition or reason for visit.');
      setLoading(false);
      return;
    }

    try {
      // Combine name fields into fullname for backend
      const fullname = [formData.firstName, formData.middleName, formData.lastName]
        .filter(name => name.trim() !== '')
        .join(' ');

      const requestBody = {
        fullname,
        age: formData.age,
        sex: formData.sex,
        civilStatus: formData.civilStatus,
        mobileNumber: formData.mobileNumber,
        yearSection: formData.yearSection,
        schoolIdNumber: formData.schoolIdNumber,
        department: formData.department,
        assessment: formData.assessment,
        email: formData.email,
        requestDateTime: formData.requestDateTime,
        userType: formData.userType,
        requestType: formData.requestType,
        notes: formData.notes,
      };

      const response = await fetch(`${env.API_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Reset form
        const now = new Date();
        const dateTimeStr = now.toISOString().slice(0, 16);
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          age: '',
          sex: '',
          civilStatus: '',
          mobileNumber: '',
          yearSection: '',
          schoolIdNumber: '',
          department: '',
          assessment: '',
          email: '',
          requestDateTime: dateTimeStr,
          userType: 'student',
          requestType: '',
          notes: '',
        });
        // Close modal after 2 seconds
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit request form');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative">
        {/* Background with blur effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 rounded-lg -z-10"
          style={{ backgroundImage: `url(${bgClinic})` }}
        />
        
        {/* Form Container */}
        <div className="relative bg-white/95 backdrop-blur-md rounded-xl p-6 sm:p-8 shadow-professional-lg animate-fade-in">
          <h2 className="text-3xl font-bold text-clinic-green mb-2 text-center animate-fade-in-up animate-delay-100">
            Request Form
          </h2>
          
          <p className="text-gray-600 text-center mb-6 text-sm sm:text-base animate-fade-in-up animate-delay-200">
            Submit your request forms conveniently. Kindly fill out all the necessary information.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Request form submitted successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="flex flex-col gap-4">
              {/* First Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label htmlFor="firstName" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green transition-all duration-200 hover:border-clinic-green/50 input-focus"
                  placeholder="Enter your first name"
                />
              </div>

              {/* Middle Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label htmlFor="middleName" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                  Middle Name:
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green transition-all duration-200 hover:border-clinic-green/50 input-focus"
                  placeholder="Enter your middle name (optional)"
                />
              </div>

              {/* Last Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label htmlFor="lastName" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green transition-all duration-200 hover:border-clinic-green/50 input-focus"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Personal Information Fields */}
            <div className="flex flex-col gap-4">
              {/* Age */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label htmlFor="age" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                  Age:
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="1"
                  max="120"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green transition-all duration-200 hover:border-clinic-green/50 input-focus"
                  placeholder="Enter your age"
                />
              </div>

              {/* Sex */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label htmlFor="sex" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                  Sex:
                </label>
                <select
                  id="sex"
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green bg-white"
                >
                  <option value="">Select Sex</option>
                  {sexOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Civil Status */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label htmlFor="civilStatus" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                  Civil Status:
                </label>
                <select
                  id="civilStatus"
                  name="civilStatus"
                  value={formData.civilStatus}
                  onChange={handleChange}
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green bg-white"
                >
                  <option value="">Select Civil Status</option>
                  {civilStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Number */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label htmlFor="mobileNumber" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                  Mobile Number:
                </label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10,11}"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green transition-all duration-200 hover:border-clinic-green/50 input-focus"
                  placeholder="09XXXXXXXXX"
                  title="Enter 10-11 digit mobile number"
                />
              </div>
            </div>

            {/* Course/Year & Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label htmlFor="yearSection" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                Course/Year & Section:
              </label>
              <input
                type="text"
                id="yearSection"
                name="yearSection"
                value={formData.yearSection}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green transition-all duration-200 hover:border-clinic-green/50 input-focus"
                placeholder="e.g., BSIT - 3rd Year - Section A"
              />
            </div>

            {/* Student ID Number */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label htmlFor="schoolIdNumber" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                Student ID Number:
              </label>
              <input
                type="text"
                id="schoolIdNumber"
                name="schoolIdNumber"
                value={formData.schoolIdNumber}
                onChange={(e) => {
                  // Format: 8 digits, dash, 1 letter
                  let value = e.target.value.toUpperCase();
                  // Remove any non-alphanumeric except dash
                  value = value.replace(/[^0-9A-Z-]/g, '');
                  // Limit to 10 characters (8 digits + dash + 1 letter)
                  if (value.length <= 10) {
                    setFormData({
                      ...formData,
                      schoolIdNumber: value,
                    });
                  }
                }}
                required
                pattern="[0-9]{8}-[A-Z]"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green transition-all duration-200 hover:border-clinic-green/50 input-focus"
                placeholder="12345678-A"
                title="Format: 8 digits, dash, and 1 letter (e.g., 12345678-A)"
              />
              {formData.schoolIdNumber && !/^[0-9]{8}-[A-Z]$/.test(formData.schoolIdNumber) && (
                <p className="text-red-600 text-xs mt-1 sm:mt-0 sm:ml-2">
                  Format: 8 digits, dash, 1 letter (e.g., 12345678-A)
                </p>
              )}
            </div>

            {/* Department */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label htmlFor="department" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                Department:
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green bg-white"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Assessment Field */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label htmlFor="assessment" className="text-gray-700 font-medium sm:w-40 flex-shrink-0 pt-2">
                Assessment/Complaint:
              </label>
              <textarea
                id="assessment"
                name="assessment"
                value={formData.assessment}
                onChange={handleChange}
                required
                rows={3}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green transition-all duration-200 hover:border-clinic-green/50 input-focus resize-none"
                placeholder="Describe your medical condition, symptoms, or reason for visit..."
              />
            </div>

            {/* Request Type Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label htmlFor="requestType" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                Request Type:
              </label>
              <select
                id="requestType"
                name="requestType"
                value={formData.requestType}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green bg-white"
              >
                <option value="">Select Request Type</option>
                {requestTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes Field */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label htmlFor="notes" className="text-gray-700 font-medium sm:w-40 flex-shrink-0 pt-2">
                Additional Notes:
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green transition-all duration-200 hover:border-clinic-green/50 input-focus resize-none"
                placeholder="Enter any additional information or special requests..."
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label htmlFor="email" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                Email Address:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green transition-all duration-200 hover:border-clinic-green/50 input-focus"
                placeholder="your.email@example.com"
              />
            </div>

            {/* User Type Selection */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label className="text-gray-700 font-medium sm:w-40 flex-shrink-0 pt-2">
                Request Type:
              </label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="student"
                    checked={formData.userType === 'student'}
                    onChange={handleChange}
                    className="w-4 h-4 text-clinic-green focus:ring-clinic-green border-gray-300"
                  />
                  <span className="text-gray-700">Student</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="faculty"
                    checked={formData.userType === 'faculty'}
                    onChange={handleChange}
                    className="w-4 h-4 text-clinic-green focus:ring-clinic-green border-gray-300"
                  />
                  <span className="text-gray-700">Faculty</span>
                </label>
              </div>
            </div>

            {/* Request Date and Time */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label htmlFor="requestDateTime" className="text-gray-700 font-medium sm:w-40 flex-shrink-0">
                Request Date & Time:
              </label>
              <input
                type="datetime-local"
                id="requestDateTime"
                name="requestDateTime"
                value={formData.requestDateTime}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-green transition-all duration-200 hover:border-clinic-green/50 input-focus"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-clinic-green text-white rounded-lg font-semibold shadow-md hover:bg-clinic-green-hover hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default RequestFormModal;

