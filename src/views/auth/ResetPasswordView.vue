<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-4">
      <div class="card shadow">
        <div class="card-body p-4">
          <h2 class="text-center mb-4">Сброс пароля</h2>
          <p>Введите email для получения инструкции по сбросу пароля.</p>
          <form @submit.prevent="handleReset">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input
                v-model="email"
                type="email"
                class="form-control"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary w-100">
              Отправить
            </button>
            <div class="text-center mt-3">
              <router-link to="/login">Вернуться ко входу</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import client from '@/api/client';

const email = ref('');

const handleReset = async () => {
  // Реализовать после получения DTO
  alert('Функция сброса пароля будет доступна позже');
};
</script>
