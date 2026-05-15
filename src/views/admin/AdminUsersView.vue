<template>
  <section class="page-band">
    <div class="container-xxl">
      <div class="toolbar-panel">
        <div>
          <span class="eyebrow">Пользователи</span>
          <h1>Читатели и доступы</h1>
        </div>
        <router-link class="btn btn-ghost" to="/admin">К панели</router-link>
      </div>

      <div v-if="notice" class="alert alert-success">{{ notice }}</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="admin-grid">
        <form class="form-panel" @submit.prevent="createAdmin">
          <span class="eyebrow">Доступ</span>
          <h2>Новый администратор</h2>
          <div class="split-fields">
            <div>
              <label class="form-label">Имя</label>
              <input v-model.trim="adminForm.name" class="form-control" required />
            </div>
            <div>
              <label class="form-label">Фамилия</label>
              <input v-model.trim="adminForm.surname" class="form-control" required />
            </div>
          </div>
          <label class="form-label">Телефон</label>
          <input v-model.trim="adminForm.phone" class="form-control" required />
          <label class="form-label">Email</label>
          <input v-model.trim="adminForm.email" class="form-control" type="email" required />
          <label class="form-label">Пароль</label>
          <input v-model="adminForm.password" class="form-control" type="password" required />
          <button class="btn btn-primary-soft w-100" type="submit" :disabled="saving">
            Создать администратора
          </button>
        </form>

        <section class="content-panel">
          <div class="section-heading">
            <div>
              <span class="eyebrow">Поиск</span>
              <h2>Пользователи</h2>
            </div>
            <span class="pill">{{ users.length }}</span>
          </div>
          <form class="inline-search" @submit.prevent="searchUsers">
            <input
              v-model.trim="userQuery"
              class="form-control"
              placeholder="Email, телефон, имя"
            />
            <button class="btn btn-secondary-soft" type="submit">Найти</button>
          </form>
          <div class="mini-list roomy-list">
            <div v-for="user in users" :key="user.id" class="mini-list-item">
              <strong>{{ formatUserName(user) }}</strong>
              <span>{{ user.email }}</span>
              <small>{{ user.phone }} · {{ user.roleType?.name }}</small>
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { authApi } from '@/api/library';
import type { RegisterPayload, User } from '@/types/library';
import { getApiErrorMessage, showSuccessMessage } from '@/utils/errors';
import { formatUserName } from '@/utils/format';
import { onMounted, ref } from 'vue';

const saving = ref(false);
const error = ref('');
const notice = ref('');
const users = ref<User[]>([]);
const userQuery = ref('');
const adminForm = ref<RegisterPayload>({
  name: '',
  surname: '',
  phone: '',
  email: '',
  password: '',
});

const searchUsers = async () => {
  error.value = '';

  try {
    users.value = await authApi.usersByQuery(userQuery.value);
  } catch (searchError) {
    error.value = getApiErrorMessage(searchError, 'Не удалось найти пользователей');
  }
};

const createAdmin = async () => {
  saving.value = true;
  error.value = '';
  notice.value = '';

  try {
    await authApi.createAdmin(adminForm.value);
    showSuccessMessage('Администратор создан.');
    notice.value = '';
    adminForm.value = {
      name: '',
      surname: '',
      phone: '',
      email: '',
      password: '',
    };
    await searchUsers();
  } catch (createError) {
    error.value = getApiErrorMessage(createError, 'Не удалось создать администратора');
  } finally {
    saving.value = false;
  }
};

onMounted(searchUsers);
</script>
