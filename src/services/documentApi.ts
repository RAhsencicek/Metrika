/**
 * Document Upload API Service
 * 
 * This service handles file uploads to the backend.
 * Set USE_MOCK_API to false when backend is ready.
 */

import type { DocumentType } from '../store/documentStore';

// Toggle this to switch between mock and real API
const USE_MOCK_API = true;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface UploadDocumentResponse {
    id: string;
    name: string;
    type: DocumentType;
    size: number;
    url: string; // URL where document is stored (e.g., S3 URL or data URL for mock)
    uploadDate: string;
}

export interface UploadDocumentRequest {
    file: File;
    fileName: string;
    fileType: DocumentType;
    uploaderId: string;
    projectId?: string;
}

/**
 * Mock upload function - simulates backend upload
 * Stores file as data URL (for demo purposes)
 */
async function mockUploadDocument(
    request: UploadDocumentRequest,
    onProgress?: (progress: number) => void
): Promise<UploadDocumentResponse> {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();

            // Simulate upload progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress >= 95) {
                    progress = 95;
                    clearInterval(progressInterval);
                }
                onProgress?.(Math.min(Math.round(progress), 95));
            }, 100);

            reader.onload = () => {
                clearInterval(progressInterval);
                onProgress?.(100);

                // Create mock response
                const response: UploadDocumentResponse = {
                    id: `doc-${crypto.randomUUID()}`,
                    name: request.fileName,
                    type: request.fileType,
                    size: request.file.size,
                    url: reader.result as string, // Data URL of the file
                    uploadDate: new Date().toISOString(),
                };

                // Simulate network delay
                setTimeout(() => {
                    resolve(response);
                }, 300);
            };

            reader.onerror = () => {
                clearInterval(progressInterval);
                reject(new Error('Dosya okunamadı'));
            };

            // Only store small files as data URL to avoid localStorage quota issues
            // Larger files get a placeholder URL (will work with real backend)
            const MAX_DATA_URL_SIZE = 1 * 1024 * 1024; // 1MB max for localStorage safety

            if (request.file.size > MAX_DATA_URL_SIZE) {
                // For files > 1MB, just store metadata with placeholder URL
                clearInterval(progressInterval);
                onProgress?.(100);

                setTimeout(() => {
                    resolve({
                        id: `doc-${crypto.randomUUID()}`,
                        name: request.fileName,
                        type: request.fileType,
                        size: request.file.size,
                        url: `/documents/${encodeURIComponent(request.fileName)}`, // Placeholder URL
                        uploadDate: new Date().toISOString(),
                    });
                }, 500);
            } else {
                reader.readAsDataURL(request.file);
            }
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Real upload function - sends to backend API
 */
async function realUploadDocument(
    request: UploadDocumentRequest,
    onProgress?: (progress: number) => void
): Promise<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('fileName', request.fileName);
    formData.append('fileType', request.fileType);
    formData.append('uploaderId', request.uploaderId);
    if (request.projectId) {
        formData.append('projectId', request.projectId);
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    onProgress(progress);
                }
            });
        }

        // Handle completion
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response: UploadDocumentResponse = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (e) {
                    reject(new Error('Invalid server response'));
                }
            } else {
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
                } catch {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
            reject(new Error('Upload cancelled'));
        });

        // Send request
        xhr.open('POST', `${API_BASE_URL}/api/documents/upload`);

        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.send(formData);
    });
}

/**
 * Upload document - automatically uses mock or real API based on USE_MOCK_API flag
 * @param request Upload request parameters
 * @param onProgress Progress callback (0-100)
 * @returns Promise with uploaded document info
 */
export async function uploadDocument(
    request: UploadDocumentRequest,
    onProgress?: (progress: number) => void
): Promise<UploadDocumentResponse> {
    if (USE_MOCK_API) {
        console.log('[Mock API] Uploading document:', request.fileName);
        return mockUploadDocument(request, onProgress);
    } else {
        console.log('[Real API] Uploading document to:', API_BASE_URL);
        return realUploadDocument(request, onProgress);
    }
}

/**
 * Trigger AI analysis for uploaded document
 * @param documentId Document ID to analyze
 * @returns Promise with analysis result
 */
export async function analyzeDocument(documentId: string): Promise<any> {
    if (USE_MOCK_API) {
        console.log('[Mock API] Analyzing document:', documentId);
        // Mock analysis is handled by the store's triggerAnalysis method
        return { success: true, documentId };
    }

    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Analysis failed' }));
        throw new Error(error.message || 'Analysis failed');
    }

    return response.json();
}

/**
 * Delete document from backend
 * @param documentId Document ID to delete
 */
export async function deleteDocumentApi(documentId: string): Promise<void> {
    if (USE_MOCK_API) {
        console.log('[Mock API] Deleting document:', documentId);
        // Mock delete is handled by the store
        return;
    }

    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Delete failed' }));
        throw new Error(error.message || 'Delete failed');
    }
}
