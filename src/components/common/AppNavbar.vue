<template>
  <nav class="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
    <div class="container">
      <router-link to="/" class="navbar-brand fw-bold">
        📢 Уведомление студентов
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center gap-3">
          <!-- Общие ссылки для авторизованных -->
          <template v-if="isAuthenticated">
            <!-- Админ -->
            <template v-if="isAdmin">
              <li class="nav-item">
                <router-link to="/" class="nav-link">📊 Дашборд</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/alerts" class="nav-link"
                  >📋 Уведомления</router-link
                >
              </li>
              <li class="nav-item">
                <router-link to="/global-alerts" class="nav-link"
                  >🌍 Глобальные</router-link
                >
              </li>
              <li class="nav-item">
                <router-link to="/structure" class="nav-link"
                  >🏛 Структура</router-link
                >
              </li>
              <li class="nav-item">
                <router-link to="/users" class="nav-link"
                  >👥 Пользователи</router-link
                >
              </li>
            </template>

            <!-- Обычный пользователь -->
            <template v-else>
              <li class="nav-item">
                <router-link to="/" class="nav-link"
                  >🔔 Мои уведомления</router-link
                >
              </li>
              <li class="nav-item">
                <router-link to="/global-alerts" class="nav-link"
                  >🌍 Объявления</router-link
                >
              </li>
              <li v-if="userStore.isElder" class="nav-item">
                <router-link to="/alerts/create" class="nav-link"
                  >➕ Создать</router-link
                >
              </li>
            </template>

            <!-- Общие для всех -->
            <li class="nav-item">
              <router-link to="/profile" class="nav-link"
                >👤 Профиль</router-link
              >
            </li>
            <li class="nav-item">
              <button @click="logout" class="btn btn-outline-danger btn-sm">
                Выйти
              </button>
            </li>
          </template>

          <!-- Не авторизован -->
          <template v-else>
            <li class="nav-item">
              <router-link to="/login" class="btn btn-outline-primary me-2">
                Войти
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/register" class="btn btn-primary">
                Регистрация
              </router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';

const userStore = useUserStore();
const { logout: performLogout } = useAuth();

const isAuthenticated = computed(() => userStore.isAuthenticated);
const isAdmin = computed(() => userStore.role === 'admin');

const logout = () => {
  performLogout();
};
</script>
