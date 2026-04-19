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
                <option :value="1">Важное</option>
                <option :value="2">Информационное</option>
                <option :value="3">Предупреждение</option>
                <!-- уточните ID типов из API -->
              </select>
            </div>

            <div class="row">
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

            <FileUploader
              v-model="form.documents"
              label="Прикрепить документы"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.png"
            />

            <div v-if="existingDocuments.length && isEdit" class="mt-3">
              <h6>Уже прикреплённые документы:</h6>
              <DocumentList :documents="existingDocuments" />
            </div>

            <div class="mt-4 d-flex gap-2">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{
                  loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'
                }}
              </button>
              <router-link to="/alerts" class="btn btn-outline-secondary">
                Отмена
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  alertsApi,
  type CreateAlertDto,
  type Document,
  type UpdateAlertDto,
} from '@/api/alerts';
import type { Department, Faculty, Group } from '@/api/structure';
import DocumentList from '@/components/common/DocumentList.vue';
import FileUploader from '@/components/common/FileUploader.vue';
import DepartmentSelector from '@/components/structure/DepartmentSelector.vue';
import FacultySelector from '@/components/structure/FacultySelector.vue';
import GroupSelector from '@/components/structure/GroupSelector.vue';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const isEdit = !!route.params.id;

const loading = ref(false);
const existingDocuments = ref<Document[]>([]);

const selectedFaculty = ref<Faculty | null>(null);
const selectedDepartment = ref<Department | null>(null);
const selectedGroup = ref<Group | null>(null);

const form = reactive<CreateAlertDto>({
  title: '',
  description: '',
  documents: [],
  alertsTypeId: 1, // значение по умолчанию
  facultyId: 0,
  departmentId: 0,
  groupId: 0,
});

onMounted(async () => {
  if (isEdit) {
    try {
      const res = await alertsApi.getAlertById(route.params.id as string);
      const alert = res.data;
      form.title = alert.title;
      form.description = alert.description;
      form.alertsTypeId = alert.alertsTypeId;
      form.documents = alert.documents.map((d) => d.id);
      existingDocuments.value = alert.documents;
      // Если есть связанные объекты факультета и т.д., нужно их подгрузить
      // Это можно сделать через отдельные запросы или если API возвращает вложенные объекты
      if (alert.facultyId) {
        // загрузить факультет по ID
      }
    } catch (err) {
      alert('Ошибка загрузки уведомления');
      router.push('/alerts');
    }
  }
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    const payload: CreateAlertDto | UpdateAlertDto = {
      ...form,
      facultyId: selectedFaculty.value?.id || 0,
      departmentId: selectedDepartment.value?.id || 0,
      groupId: selectedGroup.value?.id || 0,
    };

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
