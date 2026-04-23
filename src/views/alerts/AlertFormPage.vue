<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card shadow">
        <div class="card-body p-4">
          <h2 class="mb-4">
            {{ isEdit ? 'Редактирование уведомления' : 'Создание уведомления' }}
          </h2>

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

            <div class="mb-3">
              <label class="form-label">Тип уведомления *</label>
              <select v-model="form.alertsTypeId" class="form-select" required>
                <option :value="1">Обычное</option>
                <option :value="2">Срочное</option>
                <option :value="3">Экстренное</option>
              </select>
            </div>

            <!-- Админ: выбор факультета, кафедры, группы -->
            <div v-if="isAdmin" class="row mb-3">
              <div class="col-md-4">
                <FacultySelector
                  v-model="selectedFaculty"
                  label="Факультет (необязательно)"
                  placeholder="Оставьте пустым для всех"
                />
              </div>
              <div class="col-md-4">
                <DepartmentSelector
                  v-model="selectedDepartment"
                  label="Кафедра (необязательно)"
                  placeholder="Оставьте пустым для всех"
                />
              </div>
              <div class="col-md-4">
                <GroupSelector
                  v-model="selectedGroup"
                  label="Группа (необязательно)"
                  placeholder="Оставьте пустым для всех"
                />
              </div>
            </div>

            <!-- Староста: только группа (заблокирована) -->
            <div v-else class="mb-3">
              <label class="form-label">Группа</label>
              <input
                type="text"
                class="form-control"
                :value="userGroup?.name || 'Не указана'"
                disabled
              />
              <small class="text-muted"
                >Уведомление будет отправлено вашей группе</small
              >
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
                  <span class="text-truncate">
                    📄 {{ getFileNameFromUrl(url) }}
                  </span>
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
                {{
                  loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'
                }}
              </button>
              <router-link to="/alerts" class="btn btn-outline-secondary"
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
import { alertsApi, type CreateAlertDto } from '@/api/alerts';
import type { Department, Faculty, Group } from '@/api/structure';
import DepartmentSelector from '@/components/structure/DepartmentSelector.vue';
import FacultySelector from '@/components/structure/FacultySelector.vue';
import GroupSelector from '@/components/structure/GroupSelector.vue';
import { useUpload } from '@/composables/useUpload';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const isEdit = !!route.params.id;
const userStore = useUserStore();

const loading = ref(false);
const selectedFaculty = ref<Faculty | null>(null);
const selectedDepartment = ref<Department | null>(null);
const selectedGroup = ref<Group | null>(null);

const isAdmin = computed(() => userStore.isAdmin);
const userGroup = computed(() => userStore.userGroup);

// Массив URL загруженных файлов
const documentUrls = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const { uploadFile, uploading } = useUpload();

const form = reactive<CreateAlertDto>({
  title: '',
  description: '',
  documents: [],
  alertsTypeId: 1,
  facultyId: 0,
  departmentId: 0,
  groupId: 0,
});

onMounted(async () => {
  // Для старосты сразу устанавливаем его группу
  if (!isAdmin.value && userGroup.value) {
    form.groupId = userGroup.value.id;
  }

  if (isEdit) {
    try {
      const res = await alertsApi.getAlertById(route.params.id as string);
      const alert = res.data;
      form.title = alert.title;
      form.description = alert.description;
      form.alertsTypeId = alert.alertsType.id;

      if (alert.documents && Array.isArray(alert.documents)) {
        documentUrls.value = alert.documents.filter(
          (d): d is string => typeof d === 'string',
        );
      }

      if (isAdmin.value) {
        if (alert.faculty) selectedFaculty.value = alert.faculty;
        if (alert.department) selectedDepartment.value = alert.department;
        if (alert.groups) selectedGroup.value = alert.groups;
      }
    } catch (err) {
      alert('Ошибка загрузки уведомления');
      router.push('/alerts');
    }
  }
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
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || url;
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
    const payload: any = {
      title: form.title,
      description: form.description,
      documents: documentUrls.value.filter((url) => url.trim() !== ''),
      alertsTypeId: form.alertsTypeId,
    };

    if (isAdmin.value) {
      // Админ может указать любые параметры
      payload.facultyId = selectedFaculty.value?.id || undefined;
      payload.departmentId = selectedDepartment.value?.id || undefined;
      payload.groupId = selectedGroup.value?.id || undefined;
    } else {
      // Староста может только для своей группы
      payload.groupId = userGroup.value?.id || undefined;
    }

    if (isEdit) {
      await alertsApi.updateAlert(route.params.id as string, payload);
    } else {
      await alertsApi.createAlert(payload as CreateAlertDto);
    }
    router.push('/alerts');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка сохранения');
  } finally {
    loading.value = false;
  }
};
</script>
