<template>
  <div class="container-fluid py-4">
    <h2 class="mb-4" style="color: #4c4993">👥 Гости</h2>

    <!-- Поиск -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="input-group">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Поиск по имени, фамилии, email или телефону..."
            @keyup.enter="search"
          />
          <button
            class="btn"
            style="background-color: #4c4993; color: #fff"
            @click="search"
          >
            🔍 Найти
          </button>
        </div>
      </div>
    </div>

    <!-- Таблица -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead style="background-color: #4c4993; color: #fff">
            <tr>
              <th class="ps-3">Гость</th>
              <th>Телефон</th>
              <th>Паспорт</th>
              <th>Адрес</th>
              <th class="text-end pe-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              style="vertical-align: middle"
            >
              <td class="ps-3">
                <div class="fw-bold">{{ user.surname }} {{ user.name }}</div>
                <small class="text-muted">{{ user.email }}</small>
              </td>
              <td>{{ user.phone }}</td>
              <td>
                <span v-if="user.passportSeries" class="text-success"
                  >Заполнен</span
                >
                <span v-else class="text-danger">Не указан</span>
              </td>
              <td>{{ user.registrationAddress || '—' }}</td>
              <td class="text-end pe-3">
                <button
                  class="btn btn-sm"
                  style="background-color: #bfc9ed; color: #2d2640"
                  @click="openEditModal(user)"
                >
                  ✏️ Заполнить данные
                </button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">
                Нет гостей
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модалка редактирования -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div
            class="modal-header"
            style="background-color: #4c4993; color: #fff"
          >
            <h5 class="modal-title">
              Редактирование: {{ editingUser?.surname }} {{ editingUser?.name }}
            </h5>
            <button
              class="btn-close btn-close-white"
              @click="showModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <p v-if="error" class="alert alert-danger">{{ error }}</p>
            <p v-if="successMsg" class="alert alert-success">
              {{ successMsg }}
            </p>
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Имя</label>
                  <input v-model="form.name" class="form-control" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Фамилия</label>
                  <input v-model="form.surname" class="form-control" />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Телефон</label>
                <input v-model="form.phone" class="form-control" />
              </div>
              <hr />
              <h6 style="color: #4c4993">Паспортные данные</h6>
              <div class="row">
                <div class="col-md-3 mb-3">
                  <label class="form-label">Серия</label>
                  <input
                    v-model="form.passportSeries"
                    class="form-control"
                    placeholder="1234"
                  />
                </div>
                <div class="col-md-3 mb-3">
                  <label class="form-label">Номер</label>
                  <input
                    v-model="form.passportNumber"
                    class="form-control"
                    placeholder="567890"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Кем выдан</label>
                  <input v-model="form.passportIssuedBy" class="form-control" />
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Дата выдачи</label>
                  <input
                    v-model="form.passportIssueDate"
                    type="date"
                    class="form-control"
                  />
                </div>
                <div class="col-md-8 mb-3">
                  <label class="form-label">Адрес регистрации</label>
                  <input
                    v-model="form.registrationAddress"
                    class="form-control"
                  />
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="showModal = false"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  class="btn"
                  style="background-color: #4c4993; color: #fff"
                  :disabled="loading"
                >
                  {{ loading ? '...' : 'Сохранить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { onMounted, ref } from 'vue';

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  passportSeries: string | null;
  passportNumber: string | null;
  passportIssuedBy: string | null;
  passportIssueDate: string | null;
  registrationAddress: string | null;
}

const users = ref<User[]>([]);
const searchQuery = ref('');
const loading = ref(false);
const error = ref('');
const successMsg = ref('');

const showModal = ref(false);
const editingUser = ref<User | null>(null);
const form = ref({
  name: '',
  surname: '',
  phone: '',
  passportSeries: '',
  passportNumber: '',
  passportIssuedBy: '',
  passportIssueDate: '',
  registrationAddress: '',
});

const search = async () => {
  try {
    const res = await client.get(
      `/auth/user-by-query/?query=${searchQuery.value}`,
    );
    users.value = res.data;
  } catch (err) {
    console.error('Ошибка поиска:', err);
  }
};

const openEditModal = (user: User) => {
  editingUser.value = user;
  form.value = {
    name: user.name,
    surname: user.surname,
    phone: user.phone,
    passportSeries: user.passportSeries || '',
    passportNumber: user.passportNumber || '',
    passportIssuedBy: user.passportIssuedBy || '',
    passportIssueDate: user.passportIssueDate || '',
    registrationAddress: user.registrationAddress || '',
  };
  error.value = '';
  successMsg.value = '';
  showModal.value = true;
};

const handleSubmit = async () => {
  if (!editingUser.value) return;
  loading.value = true;
  error.value = '';
  successMsg.value = '';

  try {
    await client.patch(
      `/auth/update-user-by-admin/${editingUser.value.id}`,
      form.value,
    );
    successMsg.value = 'Данные сохранены';
    await search();
    setTimeout(() => {
      showModal.value = false;
    }, 1000);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка сохранения';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  search();
});
</script>
