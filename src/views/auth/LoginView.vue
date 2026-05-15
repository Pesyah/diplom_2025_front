<template>
  <section class="auth-page">
    <div class="auth-card">
      <span class="eyebrow">Вход</span>
      <h1>Вернуться к своей полке</h1>
      <p>После входа доступны сделки, аренда, загрузка книг и профиль.</p>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="notice" class="alert alert-success">{{ notice }}</div>

      <form @submit.prevent="submitLogin">
        <label class="form-label">Email</label>
        <input v-model.trim="form.email" class="form-control" type="email" required />

        <label class="form-label">Пароль</label>
        <input
          v-model="form.password"
          class="form-control"
          type="password"
          required
        />

        <button class="btn btn-primary-soft w-100" type="submit" :disabled="loading">
          {{ loading ? 'Входим...' : 'Войти' }}
        </button>
      </form>

      <div class="auth-links">
        <router-link to="/register">Создать аккаунт</router-link>
        <button class="link-button" type="button" @click="showReset = !showReset">
          Сбросить пароль
        </button>
      </div>

      <form v-if="showReset" class="reset-panel" @submit.prevent="resetPassword">
        <label class="form-label">Email для сброса</label>
        <input v-model.trim="resetEmail" class="form-control" type="email" required />
        <button class="btn btn-ghost w-100" type="submit" :disabled="loading">
          Отправить запрос
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { authApi } from '@/api/library';
import { useUserStore } from '@/stores/userStore';
import { getApiErrorMessage, showSuccessMessage } from '@/utils/errors';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const form = ref({
  email: '',
  password: '',
});
const resetEmail = ref('');
const showReset = ref(false);
const loading = ref(false);
const error = ref('');
const notice = ref('');

const submitLogin = async () => {
  loading.value = true;
  error.value = '';
  notice.value = '';

  try {
    await userStore.login(form.value);
    await router.push(userStore.isAdmin ? '/admin' : '/catalog');
  } catch (loginError) {
    error.value = getApiErrorMessage(loginError, 'Неверная почта или пароль');
  } finally {
    loading.value = false;
  }
};

const resetPassword = async () => {
  loading.value = true;
  error.value = '';
  notice.value = '';

  try {
    await authApi.resetPassword(resetEmail.value);
    showSuccessMessage('Запрос обработан. Бэк сбрасывает пароль и возвращает статус ok.');
    notice.value = '';
    showReset.value = false;
  } catch (resetError) {
    error.value = getApiErrorMessage(resetError, 'Не удалось сбросить пароль');
  } finally {
    loading.value = false;
  }
};
</script>
