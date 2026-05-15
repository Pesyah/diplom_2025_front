<template>
  <section class="auth-page">
    <div class="auth-card wide">
      <span class="eyebrow">Регистрация</span>
      <h1>Новая читательская полка</h1>
      <p>Обычный пользователь может покупать, арендовать и выставлять книги.</p>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <form @submit.prevent="submitRegister">
        <div class="split-fields">
          <div>
            <label class="form-label">Имя</label>
            <input v-model.trim="form.name" class="form-control" required />
          </div>
          <div>
            <label class="form-label">Фамилия</label>
            <input v-model.trim="form.surname" class="form-control" required />
          </div>
        </div>

        <label class="form-label">Телефон</label>
        <input v-model.trim="form.phone" class="form-control" type="tel" required />

        <label class="form-label">Email</label>
        <input v-model.trim="form.email" class="form-control" type="email" required />

        <label class="form-label">Пароль</label>
        <input
          v-model="form.password"
          class="form-control"
          minlength="6"
          type="password"
          required
        />

        <button class="btn btn-primary-soft w-100" type="submit" :disabled="loading">
          {{ loading ? 'Создаем...' : 'Зарегистрироваться' }}
        </button>
      </form>

      <div class="auth-links">
        <router-link to="/login">Уже есть аккаунт</router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { getApiErrorMessage } from '@/utils/errors';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const error = ref('');
const form = ref({
  name: '',
  surname: '',
  phone: '',
  email: '',
  password: '',
});

const submitRegister = async () => {
  loading.value = true;
  error.value = '';

  try {
    await userStore.register(form.value);
    await router.push(userStore.isAdmin ? '/admin' : '/catalog');
  } catch (registerError) {
    error.value = getApiErrorMessage(registerError, 'Не удалось зарегистрироваться');
  } finally {
    loading.value = false;
  }
};
</script>
