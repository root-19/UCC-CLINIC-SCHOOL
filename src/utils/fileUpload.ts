import { env } from '../config/env';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export const uploadFile = async (file: File): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${env.API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

export const validateFile = (file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } => {
  // Check file size (default 5MB)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file type (allow common document types)
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
  ];

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Only PDF, Word, and image files (JPEG, PNG, GIF) are allowed' 
    };
  }

  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word')) return '📝';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('text')) return '📄';
  return '📎';
};
