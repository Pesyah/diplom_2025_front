<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-4">
      <div class="card shadow">
        <div class="card-body p-4">
          <h2 class="text-center mb-4">Вход</h2>
          <p v-if="error" class="alert alert-danger">{{ error }}</p>

          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input
                v-model="email"
                type="email"
                class="form-control"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Пароль</label>
              <input
                v-model="password"
                type="password"
                class="form-control"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary w-100">Войти</button>
            <div class="text-center mt-3">
              Нет аккаунта?
              <router-link to="/register">Зарегистрироваться</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useUserStore } from '@/stores/userStore';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const email = ref('');
const password = ref('');
const error = ref('');

const handleSubmit = async () => {
  try {
    const res = await client.post('/auth/login', {
      email: email.value,
      password: password.value,
    });
    localStorage.setItem('token', res.data.access_token);

    const userRes = await client.get('/auth/me');
    console.log('User data:', userRes.data); // Посмотри в консоли что приходит

    userStore.setUser(userRes.data);
    console.log('User role:', userRes.data.roleType?.name);
    console.log('Store role:', userStore.role);
    router.push('/');
  } catch (err) {
    error.value = 'Неверная почта или пароль';
  }
};
</script>
