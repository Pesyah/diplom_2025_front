<!-- views/alerts/GlobalAlertCreatePage.vue -->
<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card shadow">
        <div class="card-body p-4">
          <h2 class="mb-4">Создание глобального уведомления</h2>

          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Заголовок *</label>
              <input
                v-model="form.title"
                type="text"
                class="form-control"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Описание *</label>
              <textarea
                v-model="form.description"
                class="form-control"
                rows="5"
                required
              ></textarea>
            </div>

            <!-- Загрузка файлов -->
            <div class="mb-3">
              <label class="form-label">Документы</label>
              <input
                type="file"
                ref="fileInput"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.png"
                class="form-control"
                @change="handleFilesUpload"
                :disabled="uploading"
              />
              <div v-if="uploading" class="text-muted small mt-1">
                Загрузка файлов...
              </div>
            </div>

            <!-- Список загруженных файлов -->
            <div v-if="documentUrls.length > 0" class="mb-3">
              <h6>Прикреплённые файлы:</h6>
              <div class="list-group">
                <div
                  v-for="(url, index) in documentUrls"
                  :key="index"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span class="text-truncate"
                    >📄 {{ getFileNameFromUrl(url) }}</span
                  >
                  <div>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary me-1"
                      @click="downloadDocument(url)"
                      title="Скачать"
                    >
                      ⬇️
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="removeDocument(index)"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 d-flex gap-2">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="loading || uploading"
              >
                {{ loading ? 'Сохранение...' : 'Создать' }}
              </button>
              <router-link to="/global-alerts" class="btn btn-outline-secondary"
                >Отмена</router-link
              >
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { alertsApi } from '@/api/alerts';
import { useUpload } from '@/composables/useUpload';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const loading = ref(false);
const documentUrls = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const { uploadFile, uploading } = useUpload();

const form = reactive({
  title: '',
  description: '',
});

const handleFilesUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files?.length) return;

  for (const file of Array.from(files)) {
    try {
      const uploadedDoc = await uploadFile(file);
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const fullUrl = uploadedDoc.path.startsWith('http')
        ? uploadedDoc.path
        : `${baseUrl}/${uploadedDoc.path.replace(/^\//, '')}`;
      documentUrls.value.push(fullUrl);
    } catch (err) {
      console.error('Ошибка загрузки файла:', file.name, err);
      alert(`Не удалось загрузить файл ${file.name}`);
    }
  }
  target.value = '';
};

const removeDocument = (index: number) => {
  documentUrls.value.splice(index, 1);
};

const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const fileName = urlObj.pathname.split('/').pop() || url;
    return decodeURIComponent(fileName);
  } catch {
    return url.split('/').pop() || url;
  }
};

const downloadDocument = async (url: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = getFileNameFromUrl(url);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Ошибка скачивания:', err);
    window.open(url, '_blank');
  }
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    await alertsApi.createGlobalAlert({
      title: form.title,
      description: form.description,
      documents: documentUrls.value.filter((url) => url.trim() !== ''),
    });
    router.push('/global-alerts');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка сохранения');
  } finally {
    loading.value = false;
  }
};
</script>
