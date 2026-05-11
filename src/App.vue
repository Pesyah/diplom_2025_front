<template>
  <div class="min-vh-100 d-flex flex-column" style="background-color: #f4f5f1">
    <!-- Навигация -->
    <nav
      class="navbar navbar-expand-lg sticky-top"
      style="background-color: #4c4993; box-shadow: 0 2px 12px rgba(76, 73, 147, 0.3)"
    >
      <div class="container">
        <router-link
          :to="isStaff ? '/admin' : '/rooms'"
          class="navbar-brand fw-bold"
          style="color: #f4f5f1; font-size: 1.4rem; letter-spacing: 0.5px"
        >
          RestInn
        </router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          style="border-color: #bfc9ed"
        >
          <span class="navbar-toggler-icon" style="filter: invert(0.8)"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <!-- Админ/Менеджер -->
            <template v-if="isAuthenticated && isStaff">
              <li class="nav-item">
                <router-link to="/admin/dashboard" class="nav-link px-3" style="color: #bfc9ed" active-class="active-link">
                  📊 Дашборд
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/admin/reservations" class="nav-link px-3" style="color: #bfc9ed" active-class="active-link">
                  📋 Брони
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/admin/rooms" class="nav-link px-3" style="color: #bfc9ed" active-class="active-link">
                  🏨 Номера
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/admin/users" class="nav-link px-3" style="color: #bfc9ed" active-class="active-link">
                  👥 Гости
                </router-link>
              </li>
              <li v-if="isAdmin" class="nav-item">
                <router-link to="/admin/amenities" class="nav-link px-3" style="color: #bfc9ed" active-class="active-link">
                  🛠 Удобства
                </router-link>
              </li>
            </template>

            <!-- Гость -->
            <template v-else-if="isAuthenticated && !isStaff">
              <li class="nav-item">
                <router-link to="/rooms" class="nav-link px-3" style="color: #bfc9ed" active-class="active-link">
                  🏨 Номера
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/my-reservations" class="nav-link px-3" style="color: #bfc9ed" active-class="active-link">
                  📋 Мои брони
                </router-link>
              </li>
            </template>

            <!-- Неавторизованный -->
            <template v-else>
              <li class="nav-item">
                <router-link to="/rooms" class="nav-link px-3" style="color: #bfc9ed" active-class="active-link">
                  🏨 Номера
                </router-link>
              </li>
            </template>
          </ul>

          <ul class="navbar-nav">
            <li v-if="isAuthenticated" class="nav-item dropdown-custom" @click.stop>
              <button
                class="nav-link d-flex align-items-center gap-1 btn btn-link"
                type="button"
                @click="showProfileMenu = !showProfileMenu"
                style="color: #f4f5f1; cursor: pointer; text-decoration: none; border: none; background: none"
              >
                👤 {{ user?.name || 'Профиль' }}
                <span class="ms-1" style="font-size: 0.7rem">{{ showProfileMenu ? '▲' : '▼' }}</span>
              </button>
              <ul
                v-show="showProfileMenu"
                class="dropdown-menu dropdown-menu-end show"
                style="background-color: #f4f5f1; border: 1px solid #bfc9ed; position: absolute; right: 0; top: 100%; z-index: 1000"
                @click="showProfileMenu = false"
              >
                <li>
                  <router-link to="/profile" class="dropdown-item" style="color: #4c4993">
                    👤 Мой профиль
                  </router-link>
                </li>
                <li v-if="isAdmin">
                  <router-link to="/admin/create-manager" class="dropdown-item" style="color: #4c4993">
                    👥 Создать менеджера
                  </router-link>
                </li>
                <li><hr class="dropdown-divider" style="border-color: #bfc9ed" /></li>
                <li>
                  <button @click="logout" class="dropdown-item" style="color: #c0392b">
                    🚪 Выйти
                  </button>
                </li>
              </ul>
            </li>
            <li v-else class="nav-item">
              <router-link
                to="/login"
                class="btn btn-sm ms-2"
                style="background-color: #a1cdc4; color: #1a3c34; border: none; font-weight: 500"
              >
                Войти
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Контент -->
    <main class="flex-grow-1">
      <RouterView />
    </main>

    <!-- Футер -->
    <footer class="py-3 text-center" style="background-color: #4c4993; color: #bfc9ed; font-size: 0.85rem">
      RestInn &copy; {{ new Date().getFullYear() }}
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterView, useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

const isAuthenticated = computed(() => userStore.isAuthenticated);
const user = computed(() => userStore.user);
const isAdmin = computed(() => user.value?.roleType?.name === 'admin');
const isManager = computed(() => user.value?.roleType?.name === 'manager');
const isStaff = computed(() => isAdmin.value || isManager.value);

const showProfileMenu = ref(false);

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.dropdown-custom')) {
    showProfileMenu.value = false;
  }
};

watch(
  () => router.currentRoute.value.path,
  () => {
    showProfileMenu.value = false;
  },
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const logout = () => {
  userStore.clear();
  router.push('/login');
};
</script>

<style>
:root {
  --primary: #4c4993;
  --secondary: #bfc9ed;
  --bg: #f4f5f1;
  --accent: #a1cdc4;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: #f4f5f1;
  color: #2d2640;
}

/* Навбар */
.navbar {
  padding: 0.5rem 0;
}

.navbar-brand:hover {
  color: #fff !important;
}

.nav-link:hover {
  color: #fff !important;
}

.active-link {
  color: #fff !important;
  font-weight: 600;
  border-bottom: 2px solid #a1cdc4;
}

/* Карточки */
.card {
  border: 1px solid #bfc9ed;
  background-color: #fff;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(76, 73, 147, 0.15);
}

/* Таблицы */
.table {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.table thead {
  background-color: #4c4993;
  color: #f4f5f1;
}

.table-hover tbody tr:hover {
  background-color: #bfc9ed33;
}

/* Дропдаун */
.dropdown-custom {
  position: relative;
}

.dropdown-menu {
  display: block;
  min-width: 200px;
  padding: 0.5rem 0;
  margin: 0.5rem 0 0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(76, 73, 147, 0.2);
}

.dropdown-item {
  padding: 0.5rem 1.5rem;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #bfc9ed;
}

.dropdown-divider {
  margin: 0.5rem 0;
  border-color: #bfc9ed;
}

/* Алерты */
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

/* Модалки */
.modal-content {
  border-radius: 16px;
  border: none;
  box-shadow: 0 16px 40px rgba(76, 73, 147, 0.25);
}

.modal-header {
  border-radius: 16px 16px 0 0;
}

/* Спиннер */
.spinner-border {
  color: #4c4993 !important;
}

/* Кнопки */
.btn-primary {
  background-color: #4c4993;
  border-color: #4c4993;
}

.btn-primary:hover {
  background-color: #3d3a7a;
  border-color: #3d3a7a;
}

/* Скроллбар */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f4f5f1;
}

::-webkit-scrollbar-thumb {
  background: #bfc9ed;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4c4993;
}
</style>