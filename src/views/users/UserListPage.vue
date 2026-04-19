<template>
  <div>
    <h1>Пользователи</h1>
    <div class="mb-3">
      <input
        type="text"
        class="form-control"
        placeholder="Поиск по имени, email, телефону"
        v-model="query"
        @input="onSearchInput"
      />
      <div v-if="loading" class="text-muted small mt-1">Загрузка...</div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Роль</th>
            <th>Факультет</th>
            <th>Кафедра</th>
            <th>Группа</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }} {{ user.surname }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.roleType.name }}</td>
            <td>{{ user.faculty?.name || '-' }}</td>
            <td>{{ user.department?.name || '-' }}</td>
            <td>{{ user.group?.name || '-' }}</td>
            <td>
              <button
                class="btn btn-sm btn-outline-primary"
                @click="openAssignment(user)"
              >
                Назначить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно для назначения (можно вынести в отдельный компонент) -->
    <div v-if="assigningUser" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Назначение структуры для {{ assigningUser.name }}
              {{ assigningUser.surname }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-4">
                <FacultySelector v-model="selectedFaculty" />
              </div>
              <div class="col-md-4">
                <DepartmentSelector v-model="selectedDepartment" />
              </div>
              <div class="col-md-4">
                <GroupSelector v-model="selectedGroup" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Отмена
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveAssignment"
              :disabled="saving"
            >
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="assigningUser" class="modal-backdrop show"></div>
  </div>
</template>

<script setup lang="ts">
import {
  structureApi,
  type Department,
  type Faculty,
  type Group,
  type UserStructureInfo,
} from '@/api/structure';
import DepartmentSelector from '@/components/structure/DepartmentSelector.vue';
import FacultySelector from '@/components/structure/FacultySelector.vue';
import GroupSelector from '@/components/structure/GroupSelector.vue';
import { debounce } from 'lodash-es';
import { ref } from 'vue';

const query = ref('');
const users = ref<UserStructureInfo[]>([]);
const loading = ref(false);

const assigningUser = ref<UserStructureInfo | null>(null);
const selectedFaculty = ref<Faculty | null>(null);
const selectedDepartment = ref<Department | null>(null);
const selectedGroup = ref<Group | null>(null);
const saving = ref(false);

const fetchUsers = async (searchQuery: string) => {
  loading.value = true;
  try {
    const res = await structureApi.getUsers(searchQuery || undefined);
    users.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(fetchUsers, 300);

const onSearchInput = () => {
  debouncedFetch(query.value);
};

// Инициализация: загрузить первых 10 пользователей (query пустой)
fetchUsers('');

const openAssignment = (user: UserStructureInfo) => {
  assigningUser.value = user;
  selectedFaculty.value = user.faculty || null;
  selectedDepartment.value = user.department || null;
  selectedGroup.value = user.group || null;
};

const closeModal = () => {
  assigningUser.value = null;
};

const saveAssignment = async () => {
  if (!assigningUser.value) return;
  saving.value = true;
  try {
    await structureApi.assignStructure({
      userId: assigningUser.value.id,
      facultyId: selectedFaculty.value?.id || 0,
      departmentId: selectedDepartment.value?.id || 0,
      groupId: selectedGroup.value?.id || 0,
    });
    // Обновить список пользователей
    await fetchUsers(query.value);
    closeModal();
  } catch (err) {
    alert('Ошибка при сохранении');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
