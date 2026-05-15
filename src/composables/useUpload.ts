import { documentsApi } from '@/api/library';
import { getApiErrorMessage } from '@/utils/errors';
import { ref } from 'vue';

export const useUpload = () => {
  const uploading = ref(false);
  const uploadError = ref('');

  const uploadFile = async (file: File) => {
    uploading.value = true;
    uploadError.value = '';

    try {
      const document = await documentsApi.upload(file);
      return {
        ...document,
        url: document.path?.replace(/\\/g, '/') ?? '',
      };
    } catch (error) {
      uploadError.value = getApiErrorMessage(error, 'Не удалось загрузить файл');
      throw error;
    } finally {
      uploading.value = false;
    }
  };

  return { uploadFile, uploading, uploadError };
};
