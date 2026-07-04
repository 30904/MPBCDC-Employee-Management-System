import apiClient from './apiClient.js';
import { unwrapApiData } from './response.js';

/** Matches backend/config/upload.js — multipart/form-data, PDF only, max 5MB */
export const UPLOAD_CONVENTION = {
  fieldName: 'file',
  maxSizeMb: 5,
  allowedMimeTypes: ['application/pdf'],
  allowedExtensions: ['.pdf'],
  endpoint: '/uploads',
};

function validatePdfFile(file) {
  if (!file) {
    throw new Error('No file selected');
  }

  const name = file.name?.toLowerCase() || '';
  const isPdf =
    UPLOAD_CONVENTION.allowedMimeTypes.includes(file.type) ||
    UPLOAD_CONVENTION.allowedExtensions.some((ext) => name.endsWith(ext));

  if (!isPdf) {
    throw new Error('Only PDF files are allowed');
  }

  const maxBytes = UPLOAD_CONVENTION.maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File too large. Maximum size is ${UPLOAD_CONVENTION.maxSizeMb}MB`);
  }
}

/**
 * Upload a PDF attachment for loan/leave applications.
 * @param {File} file - PDF file (max 5MB)
 * @returns {Promise<{ attachmentPath: string, url: string, filename: string }>}
 */
export async function uploadPdfFile(file) {
  validatePdfFile(file);

  const formData = new FormData();
  formData.append(UPLOAD_CONVENTION.fieldName, file);

  const response = await apiClient.post(UPLOAD_CONVENTION.endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return unwrapApiData(response);
}
