<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border"></div>
      </div>

      <div v-else-if="alert" class="card shadow">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h2>{{ alert.title }}</h2>
            <div>
              <router-link
                v-if="isAdmin"
                :to="`/alerts/${alert.id}/edit`"
                class="btn btn-sm btn-outline-primary me-2"
              >
                Редактировать
              </router-link>
              <router-link
                to="/alerts"
                class="btn btn-sm btn-outline-secondary"
              >
                Назад
              </router-link>
            </div>
          </div>

          <p class="text-muted mb-4">
            Создано: {{ new Date(alert.createdAt).toLocaleString() }}
          </p>

          <div class="mb-4">
            <h5>Описание</h5>
            <p style="white-space: pre-wrap">{{ alert.description }}</p>
          </div>

          <DocumentList :documents="alert.documents" />

          <!-- Информация о целевой аудитории -->
          <div
            v-if="alert.facultyId || alert.departmentId || alert.groupId"
            class="mt-4"
          >
            <h6>Целевая аудитория:</h6>
            <ul>
              <li v-if="alert.facultyId">
                Факультет: {{ alert.faculty?.name || alert.facultyId }}
              </li>
              <li v-if="alert.departmentId">
                Кафедра: {{ alert.department?.name || alert.departmentId }}
              </li>
              <li v-if="alert.groupId">
                Группа: {{ alert.group?.name || alert.groupId }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { alertsApi, type Alert } from '@/api/alerts';
import DocumentList from '@/components/common/DocumentList.vue';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userStore = useUserStore();
const isAdmin = computed(() => userStore.role === 'admin');

const alert = ref<Alert | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await alertsApi.getAlertById(route.params.id as string);
    alert.value = res.data;
  } catch (err) {
    alert('Ошибка загрузки уведомления');
  } finally {
    loading.value = false;
  }
});
</script>
