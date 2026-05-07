<!-- src/App.vue -->
<template>
  <div class="min-vh-100" style="background-color: #f5f0eb">
    <!-- Навигация -->
    <nav
      class="navbar navbar-expand-lg sticky-top"
      style="
        background-color: #4a3f6b;
        box-shadow: 0 2px 10px rgba(74, 63, 107, 0.3);
      "
    >
      <div class="container">
        <router-link
          :to="isAdmin ? '/admin' : '/menu'"
          class="navbar-brand fw-bold d-flex align-items-center gap-2"
          style="color: #e8dff5"
        >
          <span class="fs-4">☕</span>
          <span>KAPUchino</span>
        </router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          style="border-color: #c4b5e3"
        >
          <span class="navbar-toggler-icon" style="filter: invert(0.8)"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <!-- Админ навигация -->
            <template v-if="isAuthenticated && isAdmin">
              <li class="nav-item">
                <router-link
                  to="/admin"
                  class="nav-link px-3"
                  style="color: #d4c9eb"
                  active-class="active-admin"
                >
                  📊 Дашборд
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/admin/coffee"
                  class="nav-link px-3"
                  style="color: #d4c9eb"
                  active-class="active-admin"
                >
                  ☕ Кофе
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/admin/products"
                  class="nav-link px-3"
                  style="color: #d4c9eb"
                  active-class="active-admin"
                >
                  🥐 Продукты
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/admin/orders"
                  class="nav-link px-3"
                  style="color: #d4c9eb"
                  active-class="active-admin"
                >
                  🛒 Заказы
                </router-link>
              </li>
            </template>

            <!-- Клиентское меню -->
            <template v-else-if="isAuthenticated && !isAdmin">
              <li class="nav-item">
                <router-link
                  to="/menu"
                  class="nav-link px-3"
                  style="color: #d4c9eb"
                  active-class="active-admin"
                >
                  🏠 Меню
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/cart"
                  class="nav-link px-3 d-flex align-items-center gap-1"
                  style="color: #d4c9eb"
                  active-class="active-admin"
                >
                  🛒 Корзина
                  <span
                    v-if="cartItemsCount > 0"
                    class="badge rounded-pill"
                    style="
                      background-color: #b8a9d4;
                      color: #2d2640;
                      font-size: 0.7rem;
                    "
                  >
                    {{ cartItemsCount }}
                  </span>
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/orders"
                  class="nav-link px-3"
                  style="color: #d4c9eb"
                  active-class="active-admin"
                >
                  📋 Заказы
                </router-link>
              </li>
            </template>

            <!-- Гостевое меню -->
            <template v-else>
              <li class="nav-item">
                <router-link
                  to="/menu"
                  class="nav-link px-3"
                  style="color: #d4c9eb"
                  active-class="active-admin"
                >
                  🏠 Меню
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/cart"
                  class="nav-link px-3 d-flex align-items-center gap-1"
                  style="color: #d4c9eb"
                  active-class="active-admin"
                >
                  🛒 Корзина
                  <span
                    v-if="cartItemsCount > 0"
                    class="badge rounded-pill"
                    style="
                      background-color: #b8a9d4;
                      color: #2d2640;
                      font-size: 0.7rem;
                    "
                  >
                    {{ cartItemsCount }}
                  </span>
                </router-link>
              </li>
            </template>
          </ul>

          <ul class="navbar-nav">
            <li v-if="isAuthenticated" class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center gap-1"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                style="color: #e8dff5"
              >
                👤 {{ user?.name || 'Профиль' }}
              </a>
              <ul
                class="dropdown-menu dropdown-menu-end"
                style="background-color: #f5f0eb; border: 1px solid #c4b5e3"
              >
                <li>
                  <router-link
                    to="/profile"
                    class="dropdown-item"
                    style="color: #4a3f6b"
                  >
                    Мой профиль
                  </router-link>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button
                    @click="logout"
                    class="dropdown-item"
                    style="color: #c0392b"
                  >
                    Выйти
                  </button>
                </li>
              </ul>
            </li>
            <li v-else class="nav-item">
              <router-link
                to="/login"
                class="btn btn-sm ms-2"
                style="
                  background-color: #b8a9d4;
                  color: #2d2640;
                  border: none;
                  font-weight: 500;
                "
              >
                Войти
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Контент -->
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';
import { RouterView, useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();

const isAuthenticated = computed(() => userStore.isAuthenticated);
const user = computed(() => userStore.user);
const isAdmin = computed(() => user.value?.roleType?.name === 'admin');
const cartItemsCount = computed(() => cartStore.itemsCount());

const logout = () => {
  userStore.clear();
  cartStore.clearCart();
  router.push('/login');
};
</script>

<style>
:root {
  --primary-purple: #4a3f6b;
  --light-purple: #c4b5e3;
  --lighter-purple: #e8dff5;
  --bg-lavender: #f5f0eb;
  --accent-warm: #b8a9d4;
  --text-dark: #2d2640;
  --text-light: #e8dff5;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, sans-serif;
  background-color: var(--bg-lavender);
  color: var(--text-dark);
}

.navbar {
  padding: 0.5rem 0;
}
.navbar-brand:hover {
  color: #fff !important;
}
.nav-link:hover {
  color: #fff !important;
}
.active-admin {
  color: #fff !important;
  font-weight: 600;
  border-bottom: 2px solid var(--accent-warm);
}

.card {
  border: 1px solid var(--light-purple);
  background-color: #fff;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(74, 63, 107, 0.15);
}

.table {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
}
.table thead {
  background-color: var(--primary-purple);
  color: var(--text-light);
}
.table-hover tbody tr:hover {
  background-color: var(--lighter-purple);
}

.badge-status {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.spinner-border {
  color: var(--primary-purple) !important;
}

.alert {
  border: none;
  border-radius: 12px;
}
.alert-danger {
  background-color: #fde8e8;
  color: #c0392b;
  border-left: 4px solid #e74c3c;
}
.alert-success {
  background-color: #e8f5e9;
  color: #27ae60;
  border-left: 4px solid #2ecc71;
}

.modal-content {
  border-radius: 16px;
  border: none;
  box-shadow: 0 16px 40px rgba(74, 63, 107, 0.25);
}
.modal-header {
  background-color: var(--primary-purple);
  color: var(--text-light);
  border-radius: 16px 16px 0 0;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: var(--bg-lavender);
}
::-webkit-scrollbar-thumb {
  background: var(--light-purple);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--primary-purple);
}
</style>
