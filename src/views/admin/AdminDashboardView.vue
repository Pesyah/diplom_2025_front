<!-- src/views/admin/AdminDashboardView.vue -->
<template>
  <div class="container py-5">
    <h1 class="text-center fw-bold mb-2" style="color: #4a3f6b">
      📊 Панель управления
    </h1>
    <p class="text-center text-muted mb-5">Выберите раздел для управления</p>

    <div class="row g-4 justify-content-center">
      <div class="col-12 col-md-6 col-lg-4">
        <router-link to="/admin/coffee" class="text-decoration-none">
          <div class="plate-card">
            <div class="plate-icon">☕</div>
            <h3 class="fw-bold mt-3" style="color: #2d2640">Кофе</h3>
            <p class="text-muted">
              Управление кофе, объемами, добавками и связями
            </p>
            <div class="plate-sub-links">
              <span class="badge me-1">Кофе</span>
              <span class="badge me-1">Объемы</span>
              <span class="badge me-1">Добавки</span>
              <span class="badge">Связи</span>
            </div>
          </div>
        </router-link>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <router-link to="/admin/products" class="text-decoration-none">
          <div class="plate-card">
            <div class="plate-icon">🥐</div>
            <h3 class="fw-bold mt-3" style="color: #2d2640">Продукты</h3>
            <p class="text-muted">Управление продуктами и категориями</p>
            <div class="plate-sub-links">
              <span class="badge me-1">Продукты</span>
              <span class="badge">Категории</span>
            </div>
          </div>
        </router-link>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <router-link to="/admin/orders" class="text-decoration-none">
          <div class="plate-card">
            <div class="plate-icon">🛒</div>
            <h3 class="fw-bold mt-3" style="color: #2d2640">Заказы</h3>
            <p class="text-muted">Просмотр и управление заказами</p>
            <div class="plate-sub-links">
              <span class="badge me-1">Все заказы</span>
              <span class="badge">Статусы</span>
            </div>
          </div>
        </router-link>
      </div>

      <div v-if="isAdmin" class="col-12 col-md-6 col-lg-4">
        <router-link to="/admin/create-admin" class="text-decoration-none">
          <div class="plate-card">
            <div class="plate-icon">👤</div>
            <h3 class="fw-bold mt-3" style="color: #2d2640">Админы</h3>
            <p class="text-muted">Создание новых администраторов</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.user?.roleType?.name === 'admin');
</script>

<style scoped>
.plate-card {
  background-color: #fff;
  border: 2px solid #c4b5e3;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  height: 100%;
}
.plate-card:hover {
  background-color: #f5f0eb;
  border-color: #4a3f6b;
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(74, 63, 107, 0.2);
}
.plate-icon {
  font-size: 3.5rem;
  transition: transform 0.3s;
}
.plate-card:hover .plate-icon {
  transform: scale(1.2);
}
.plate-sub-links .badge {
  background-color: #e8dff5;
  color: #4a3f6b;
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
}
</style>
