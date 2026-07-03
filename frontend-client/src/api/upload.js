import apiClient from './apiClient.js';

/**
 * Upload a PDF attachment for loan/leave applications.
 * @param {File} file - PDF file (max 5MB)
 * @returns {Promise<{ attachmentPath: string, url: string, filename: string }>}
 */
export async function uploadPdfFile(file) {
  if (!file) {
    throw new Error('No file selected');
  }

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only PDF files are allowed');
  }

  const maxMb = 5;
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error(`File too large. Maximum size is ${maxMb}MB`);
  }

  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data ?? data;
}
