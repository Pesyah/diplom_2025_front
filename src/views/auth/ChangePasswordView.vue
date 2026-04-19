<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-4">
      <div class="card shadow">
        <div class="card-body p-4">
          <h2 class="text-center mb-4">Смена пароля</h2>
          <form @submit.prevent="handleChange">
            <div class="mb-3">
              <label class="form-label">Текущий пароль</label>
              <input
                v-model="oldPassword"
                type="password"
                class="form-control"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Новый пароль</label>
              <input
                v-model="newPassword"
                type="password"
                class="form-control"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary w-100">
              Сменить пароль
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import client from '@/api/client';

const oldPassword = ref('');
const newPassword = ref('');

const handleChange = async () => {
  alert('Функция смены пароля будет доступна позже');
};
</script>
