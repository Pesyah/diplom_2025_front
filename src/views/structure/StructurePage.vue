<template>
  <div>
    <h1>Управление структурой</h1>
    <p class="text-muted">
      Поиск пользователей и назначение факультета, кафедры, группы, а также
      назначение старостой группы.
    </p>

    <!-- Поиск пользователя -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Найти пользователя</h5>
        <div class="mb-3">
          <input
            type="text"
            class="form-control"
            placeholder="Введите имя, email или телефон"
            v-model="userQuery"
            @input="onUserSearchInput"
          />
          <div v-if="userSearchLoading" class="text-muted small mt-1">
            Поиск...
          </div>
        </div>
        <div v-if="foundUsers.length" class="list-group">
          <button
            v-for="user in foundUsers"
            :key="user.id"
            type="button"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            @click="selectUser(user)"
            :class="{ active: selectedUser?.id === user.id }"
          >
            <div>
              <strong>{{ user.name }} {{ user.surname }}</strong> ({{
                user.email
              }})<br />
              <small class="text-secondary">{{ user.phone }}</small>
              <span
                v-if="user.group"
                class="badge bg-info ms-1"
                :title="`Группа: ${user.group.name}`"
              >
                {{ user.group.groupCode || user.group.name }}
              </span>
            </div>
            <span class="badge bg-primary rounded-pill">{{
              user.roleType.name
            }}</span>
          </button>
        </div>
        <div v-else-if="userQuery && !userSearchLoading" class="text-muted">
          Пользователи не найдены
        </div>
      </div>
    </div>

    <!-- Назначение структуры для выбранного пользователя -->
    <div v-if="selectedUser" class="card">
      <div class="card-body">
        <h5 class="card-title">
          Назначение для {{ selectedUser.name }} {{ selectedUser.surname }}
        </h5>

        <!-- Информация о текущих назначениях -->
        <div
          v-if="
            selectedUser.faculty ||
            selectedUser.department ||
            selectedUser.group
          "
          class="alert alert-info py-2"
        >
          <strong>Текущее:</strong>
          <span v-if="selectedUser.faculty">
            Факультет:
            {{ selectedUser.faculty.shortName || selectedUser.faculty.name }}
          </span>
          <span v-if="selectedUser.department" class="ms-3">
            Кафедра: {{ selectedUser.department.name }}
          </span>
          <span v-if="selectedUser.group" class="ms-3">
            Группа: {{ selectedUser.group.name }}
          </span>
        </div>

        <div class="row">
          <div class="col-md-4">
            <FacultySelector
              v-model="selectedFaculty"
              label="Факультет"
              placeholder="Поиск факультета"
            />
          </div>
          <div class="col-md-4">
            <DepartmentSelector
              v-model="selectedDepartment"
              label="Кафедра"
              placeholder="Поиск кафедры"
            />
          </div>
          <div class="col-md-4">
            <GroupSelector
              v-model="selectedGroup"
              label="Группа"
              placeholder="Поиск группы"
            />
          </div>
        </div>

        <!-- Назначение старостой -->
        <div class="mt-3">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              id="isElderCheck"
              v-model="isElder"
            />
            <label class="form-check-label" for="isElderCheck">
              Назначить старостой выбранной группы
            </label>
          </div>
          <small class="text-muted">
            Если галочка активна, пользователь будет назначен старостой
            указанной группы. При снятии галочки — права старосты будут
            отозваны.
          </small>
        </div>

        <div class="mt-3">
          <button
            class="btn btn-primary"
            @click="assignStructure"
            :disabled="assigning"
          >
            {{ assigning ? 'Сохранение...' : 'Назначить' }}
          </button>
          <button
            class="btn btn-outline-secondary ms-2"
            @click="clearAssignment"
          >
            Очистить все
          </button>
        </div>
        <div v-if="assignSuccess" class="alert alert-success mt-3">
          Структура успешно назначена
        </div>
        <div v-if="assignError" class="alert alert-danger mt-3">
          {{ assignError }}
        </div>
      </div>
    </div>
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
import { ref, watch } from 'vue';

const userQuery = ref('');
const foundUsers = ref<UserStructureInfo[]>([]);
const userSearchLoading = ref(false);
const selectedUser = ref<UserStructureInfo | null>(null);

const selectedFaculty = ref<Faculty | null>(null);
const selectedDepartment = ref<Department | null>(null);
const selectedGroup = ref<Group | null>(null);
const isElder = ref(false);

const assigning = ref(false);
const assignSuccess = ref(false);
const assignError = ref('');

// При выборе пользователя сбрасываем выбранные элементы
// и подгружаем его текущие структурные назначения
watch(selectedUser, (user) => {
  if (user) {
    selectedFaculty.value = user.faculty || null;
    selectedDepartment.value = user.department || null;
    selectedGroup.value = user.group || null;
    isElder.value = false; // С бэка нужно будет подгружать, если пользователь уже является старостой
  } else {
    selectedFaculty.value = null;
    selectedDepartment.value = null;
    selectedGroup.value = null;
    isElder.value = false;
  }
  assignSuccess.value = false;
  assignError.value = '';
});

const fetchUsers = async (query: string) => {
  if (!query.trim()) {
    foundUsers.value = [];
    return;
  }
  userSearchLoading.value = true;
  try {
    const res = await structureApi.getUsers(query);
    foundUsers.value = res.data;
  } catch (err) {
    console.error(err);
    foundUsers.value = [];
  } finally {
    userSearchLoading.value = false;
  }
};

const debouncedFetchUsers = debounce(fetchUsers, 300);

const onUserSearchInput = () => {
  debouncedFetchUsers(userQuery.value);
};

const selectUser = (user: UserStructureInfo) => {
  selectedUser.value = user;
};

const assignStructure = async () => {
  if (!selectedUser.value) return;
  assigning.value = true;
  assignSuccess.value = false;
  assignError.value = '';

  try {
    await structureApi.assignStructure({
      userId: selectedUser.value.id,
      facultyId: selectedFaculty.value?.id || 0,
      departmentId: selectedDepartment.value?.id || 0,
      groupId: selectedGroup.value?.id || 0,
      isElder: isElder.value,
    });
    assignSuccess.value = true;

    // Обновляем локальные данные пользователя
    if (selectedUser.value) {
      selectedUser.value.faculty = selectedFaculty.value || undefined;
      selectedUser.value.department = selectedDepartment.value || undefined;
      selectedUser.value.group = selectedGroup.value || undefined;
    }
  } catch (err: any) {
    assignError.value = err.response?.data?.message || 'Ошибка при назначении';
  } finally {
    assigning.value = false;
  }
};

const clearAssignment = () => {
  selectedFaculty.value = null;
  selectedDepartment.value = null;
  selectedGroup.value = null;
  isElder.value = false;
};
</script>
