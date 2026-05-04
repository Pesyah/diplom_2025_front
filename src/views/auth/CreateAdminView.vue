<!-- src/views/auth/CreateAdminView.vue -->
<template>
  <div class="container">
    <div class="row justify-content-center mt-4">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="text-center mb-4">Создать администратора</h2>
            <p v-if="error" class="alert alert-danger">{{ error }}</p>
            <p v-if="success" class="alert alert-success">
              Администратор создан!
            </p>

            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Имя *</label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Фамилия</label>
                  <input
                    v-model="form.surname"
                    type="text"
                    class="form-control"
                  />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Телефон *</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Email *</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Пароль *</label>
                <input
                  v-model="form.password"
                  type="password"
                  class="form-control"
                  required
                  minlength="6"
                />
              </div>
              <button
                type="submit"
                class="btn btn-warning w-100"
                :disabled="loading"
              >
                {{ loading ? 'Создание...' : 'Создать администратора' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { ref } from 'vue';

const form = ref({
  name: '',
  surname: '',
  phone: '',
  email: '',
  password: '',
});
const loading = ref(false);
const error = ref('');
const success = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    await client.post('/auth/create-admin', form.value);
    success.value = true;
    form.value = { name: '', surname: '', phone: '', email: '', password: '' };
  } catch (err: any) {
    error.value =
      err.response?.data?.message || 'Ошибка создания администратора';
  } finally {
    loading.value = false;
  }
};
</script>
