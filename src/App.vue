<template>
  <div class="min-vh-100 bg-light">
    <nav class="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
      <div class="container">
        <router-link to="/" class="navbar-brand fw-bold"
          >🍕 Pizza Shop</router-link
        >

        <div class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto align-items-center gap-3">
            <!-- Админ -->
            <template v-if="isAuthenticated && isAdmin">
              <li class="nav-item">
                <router-link to="/" class="nav-link">📊 Дашборд</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/profile" class="nav-link"
                  >Профиль</router-link
                >
              </li>
            </template>

            <!-- Юзер -->
            <template v-else-if="isAuthenticated && !isAdmin">
              <li class="nav-item">
                <router-link to="/" class="nav-link">Меню</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/cart" class="nav-link">Корзина</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/orders" class="nav-link">Заказы</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/profile" class="nav-link"
                  >Профиль</router-link
                >
              </li>
            </template>

            <li v-if="isAuthenticated">
              <button @click="logout" class="btn btn-outline-danger btn-sm">
                Выйти
              </button>
            </li>
            <li v-else>
              <router-link to="/login" class="btn btn-primary"
                >Войти</router-link
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="container py-4">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';
import { RouterView, useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

const isAuthenticated = computed(() => userStore.isAuthenticated);
const user = computed(() => userStore.user);
const isAdmin = computed(() => user.value?.roleType?.name === 'admin');

const logout = () => {
  userStore.clear();
  router.push('/login');
};
</script>
