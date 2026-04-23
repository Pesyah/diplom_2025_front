<template>
  <div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="alert">
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/alerts">Уведомления</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            {{ alert.title }}
          </li>
        </ol>
      </nav>

      <div class="card">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h1 class="h4 mb-0">Детали уведомления</h1>
          <div v-if="isAdmin">
            <router-link
              :to="`/alerts/${alert.id}/edit`"
              class="btn btn-sm btn-outline-primary me-2"
            >
              Редактировать
            </router-link>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="confirmDelete"
            >
              Удалить
            </button>
          </div>
        </div>

        <div class="card-body">
          <h2 class="card-title h5">{{ alert.title || 'Без названия' }}</h2>

          <div class="mb-3">
            <span
              v-if="alert.alertsType"
              class="badge"
              :style="{ backgroundColor: '#' + alert.alertsType.color }"
            >
              {{ alert.alertsType.name }}
            </span>
            <span class="text-muted ms-2 small">
              Создано: {{ formatDate(alert.created_at) }}
            </span>
          </div>

          <!-- Структурная принадлежность -->
          <div
            v-if="alert.faculty || alert.department || alert.groups"
            class="mb-3"
          >
            <h3 class="h6">Назначено для:</h3>
            <ul class="list-inline">
              <li v-if="alert.faculty" class="list-inline-item">
                <span class="badge bg-secondary">
                  Факультет: {{ alert.faculty.shortName || alert.faculty.name }}
                </span>
              </li>
              <li v-if="alert.department" class="list-inline-item">
                <span class="badge bg-secondary">
                  Кафедра: {{ alert.department.name }}
                </span>
              </li>
              <li v-if="alert.groups" class="list-inline-item">
                <span class="badge bg-secondary">
                  Группа: {{ alert.groups.name }}
                </span>
              </li>
            </ul>
          </div>

          <!-- Описание -->
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
                <span class="text-truncate me-2">
                  📄 {{ getFileNameFromUrl(url) }}
                </span>
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  @click="downloadDocument(url)"
                >
                  Скачать
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
import { alertsApi, type Alert } from '@/api/alerts';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const alert = ref<Alert | null>(null);
const loading = ref(true);
const error = ref('');
const getDocumentDownloadUrl = (url: string): string => {
  if (!url) return '#';

  // Извлекаем имя файла из URL
  const fileName = url.split('/').pop();
  if (!fileName) return url;

  // Формируем URL к эндпоинту скачивания
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
  return `${baseUrl}/documents/download/${fileName}`;
};

const downloadDocument = (url: string) => {
  const downloadUrl = getDocumentDownloadUrl(url);

  // Создаём временную ссылку
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = ''; // Пустая строка заставит браузер использовать имя файла из заголовка
  link.style.display = 'none';

  // Добавляем в DOM, кликаем и удаляем
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Получаем массив URL из поля documents (которое массив строк)
const documentUrls = computed<string[]>(() => {
  if (!alert.value?.documents || !Array.isArray(alert.value.documents))
    return [];

  return alert.value.documents.filter((d): d is string => {
    return typeof d === 'string' && d.trim() !== '';
  });
});

const fetchAlert = async () => {
  const id = route.params.id as string;
  if (!id) {
    error.value = 'ID уведомления не указан';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    const res = await alertsApi.getAlertById(id);
    alert.value = res.data;
  } catch (err: any) {
    error.value =
      err.response?.data?.message || 'Не удалось загрузить уведомление';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const confirmDelete = async () => {
  if (!alert.value) return;

  const confirmed = window.confirm(
    'Вы уверены, что хотите удалить это уведомление? Это действие необратимо.',
  );

  if (confirmed) {
    try {
      await alertsApi.deleteAlert(alert.value.id);
      router.push('/alerts');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при удалении уведомления');
    }
  }
};
const userStore = useUserStore();

const isAdmin = computed(() => userStore.role === 'admin');

const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || url;
    return decodeURIComponent(fileName);
  } catch {
    return url.split('/').pop() || url;
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
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
