import api from './axios';

export async function getDocuments() {
  const response = await api.get('/api/documents');
  return response.data;
}

export async function uploadDocument(file, onUploadProgress) {
  const formData = new FormData();

  formData.append('file', file);

  const response = await api.post(
    '/api/documents/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }
  );

  return response.data;
}

export async function deleteDocument(documentId) {
  const response = await api.delete(
    `/api/documents/${documentId}`
  );

  return response.data;
}