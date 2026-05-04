<!-- src/App.vue -->
<template>
  <div class="min-vh-100 bg-light">
    <!-- Навигация -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div class="container">
        <router-link
          to="/"
          class="navbar-brand fw-bold d-flex align-items-center gap-2"
        >
          <span class="text-warning fs-4">⚡</span>
          <span>TechStore</span>
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
          <ul class="navbar-nav me-auto">
            <!-- Админ меню -->
            <template v-if="isAuthenticated && isAdmin">
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  📦 Продукты
                </a>
                <ul class="dropdown-menu">
                  <li>
                    <router-link to="/admin/products" class="dropdown-item">
                      Список продуктов
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      to="/admin/products/create"
                      class="dropdown-item"
                    >
                      Создать продукт
                    </router-link>
                  </li>
                </ul>
              </li>
              <li class="nav-item">
                <router-link to="/admin/orders" class="nav-link"
                  >📋 Заказы</router-link
                >
              </li>
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  🏷️ Бренды
                </a>
                <ul class="dropdown-menu">
                  <li>
                    <router-link to="/admin/brands" class="dropdown-item">
                      Список брендов
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      to="/admin/brands/create"
                      class="dropdown-item"
                    >
                      Создать бренд
                    </router-link>
                  </li>
                </ul>
              </li>
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  📁 Категории
                </a>
                <ul class="dropdown-menu">
                  <li>
                    <router-link to="/admin/categories" class="dropdown-item">
                      Список категорий
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      to="/admin/categories/create"
                      class="dropdown-item"
                    >
                      Создать категорию
                    </router-link>
                  </li>
                </ul>
              </li>
              <li class="nav-item">
                <router-link to="/admin/create-admin" class="nav-link">
                  👤 Создать админа
                </router-link>
              </li>
            </template>

            <!-- Клиентское меню -->
            <template v-else-if="isAuthenticated && !isAdmin">
              <li class="nav-item">
                <router-link to="/catalog" class="nav-link"
                  >Каталог</router-link
                >
              </li>
              <li class="nav-item">
                <router-link to="/cart" class="nav-link">
                  🛒 Корзина
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/orders" class="nav-link">Заказы</router-link>
              </li>
            </template>

            <!-- Гостевое меню -->
            <template v-else>
              <li class="nav-item">
                <router-link to="/catalog" class="nav-link"
                  >Каталог</router-link
                >
              </li>
            </template>
          </ul>

          <ul class="navbar-nav">
            <li v-if="isAuthenticated" class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                👤 {{ user?.name || 'Профиль' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link to="/profile" class="dropdown-item">
                    Мой профиль
                  </router-link>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button @click="logout" class="dropdown-item text-danger">
                    Выйти
                  </button>
                </li>
              </ul>
            </li>
            <li v-else class="nav-item">
              <router-link to="/login" class="btn btn-warning btn-sm ms-2">
                Войти
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Контент -->
    <main class="py-4">
      <RouterView />
    </main>

    <!-- Футер -->
    <footer class="bg-dark text-light py-4 mt-auto">
      <div class="container text-center">
        <p class="mb-0">© 2026 TechStore. Все права защищены.</p>
      </div>
    </footer>
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

<style>
:root {
  --bs-warning: #ffc107;
  --bs-warning-rgb: 255, 193, 7;
}

.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
}

.btn-warning:hover {
  background-color: #ffb300;
  border-color: #ffb300;
  color: #000;
}

.navbar-brand {
  font-size: 1.5rem;
}

.card {
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.text-warning {
  color: #ffc107 !important;
}

.bg-warning {
  background-color: #ffc107 !important;
}
</style>
