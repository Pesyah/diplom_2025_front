<!-- views/alerts/GlobalAlertDetailPage.vue -->
<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border"></div>
      </div>

      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-else-if="alert" class="card shadow">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h1 class="h4 mb-0">🌍 Глобальное уведомление</h1>
          <div>
            <router-link
              v-if="isAdmin"
              to="/global-alerts"
              class="btn btn-sm btn-outline-secondary"
            >
              Назад
            </router-link>
          </div>
        </div>

        <div class="card-body">
          <h2 class="h5">{{ alert.title }}</h2>

          <p class="text-muted small mb-3">
            Создано: {{ formatDate(alert.createdAt) }}
            <span v-if="alert.updatedAt !== alert.createdAt">
              • Обновлено: {{ formatDate(alert.updatedAt) }}
            </span>
          </p>

          <div class="mb-4">
            <h3 class="h6">Описание:</h3>
            <div
              class="p-3 bg-light rounded"
              style="white-space: pre-wrap; word-break: break-word"
            >
              {{ alert.description || 'Описание отсутствует' }}
            </div>
          </div>

          <!-- Документы -->
          <div v-if="documentUrls.length > 0" class="mb-4">
            <h3 class="h6">Прикреплённые документы:</h3>
            <div class="list-group">
              <div
                v-for="(url, index) in documentUrls"
                :key="index"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <span class="text-truncate"
                  >📄 {{ getFileNameFromUrl(url) }}</span
                >
                <button
                  class="btn btn-sm btn-outline-primary"
                  @click="downloadDocument(url)"
                >
                  ⬇️ Скачать
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { alertsApi, type GlobalAlert } from '@/api/alerts';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userStore = useUserStore();
const isAdmin = computed(() => userStore.role === 'admin');

const alert = ref<GlobalAlert | null>(null);
const loading = ref(true);
const error = ref('');

const documentUrls = computed<string[]>(() => {
  if (!alert.value?.documents || !Array.isArray(alert.value.documents))
    return [];

  return alert.value.documents
    .filter((d): d is Document | string => d !== null && d !== undefined)
    .map((d) => (typeof d === 'string' ? d : d.path || ''));
});

const fetchAlert = async () => {
  const id = route.params.id as string;
  if (!id) {
    error.value = 'ID не указан';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    const res = await alertsApi.getGlobalAlertById(id);
    alert.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }
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

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchAlert();
});
</script>
