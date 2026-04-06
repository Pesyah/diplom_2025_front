import client from '@/api/client';
import { ref } from 'vue';

export const useUpload = () => {
  const uploading = ref(false);

  const uploadFile = async (file: File) => {
    uploading.value = true;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await client.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data; // возвращаем весь объект
    } finally {
      uploading.value = false;
    }
  };

  return { uploadFile, uploading };
};
