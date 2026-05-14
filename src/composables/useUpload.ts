// src/composables/useUpload.ts
import client from '@/api/client';
import { ref } from 'vue';

export const useUpload = () => {
  const uploading = ref(false);
  const uploadError = ref('');

  const uploadFile = async (file: File) => {
    uploading.value = true;
    uploadError.value = '';

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await client.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Upload response:', res.data);

      // Возвращаем весь объект ответа + добавляем вычисляемое поле url для удобства
      return {
        ...res.data,
        // path приходит в формате "uploads\\documents\\file.png"
        url: res.data.path?.replace(/\\/g, '/') || '',
      };
    } catch (err: unknown) {
      const responseError = err as {
        response?: { data?: { message?: string } };
      };
      uploadError.value =
        responseError.response?.data?.message || 'Ошибка загрузки файла';
      console.error('Upload error:', err);
      throw err;
    } finally {
      uploading.value = false;
    }
  };

  return { uploadFile, uploading, uploadError };
};
