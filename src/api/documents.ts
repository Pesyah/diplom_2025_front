import client from './client';

export interface UploadedDocument {
  id: string;
  url: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export const documentsApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<UploadedDocument>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
