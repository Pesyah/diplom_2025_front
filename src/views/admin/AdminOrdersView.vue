<!-- src/views/admin/AdminOrdersView.vue -->
<template>
  <div class="container">
    <div class="orders-shell mx-auto">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Управление заказами</h2>
        <button class="btn btn-outline-secondary btn-sm" @click="loadOrders">
          Обновить
        </button>
      </div>

      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-warning"></div>
      </div>

      <div v-else-if="orders.length === 0" class="card shadow-sm">
        <div class="card-body text-center text-muted py-4">
          Заказы не найдены
        </div>
      </div>

      <div v-else class="d-flex flex-column gap-3">
        <article
          v-for="order in orders"
          :key="order.id"
          class="card shadow-sm order-card"
          role="button"
          tabindex="0"
          @click="goToOrder(order.id)"
          @keyup.enter="goToOrder(order.id)"
          @keyup.space.prevent="goToOrder(order.id)"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center gap-3">
              <div>
                <h5 class="mb-1">
                  Заказ #{{ order.orderNumber || order.id.substring(0, 8) }}
                </h5>
                <div class="text-muted small">
                  {{ formatDate(order.createdAt) }}
                </div>
              </div>

              <span
                class="badge rounded-pill px-3 py-2"
                :style="{ backgroundColor: order.status?.color || '#6c757d' }"
              >
                {{ order.status?.name || 'Неизвестно' }}
              </span>
            </div>

            <div class="d-flex justify-content-end mt-3">
              <button
                class="btn btn-outline-warning btn-sm"
                @click.stop="goToOrder(order.id)"
              >
                Подробнее
              </button>
            </div>
          </div>
        </article>
      </div>

      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface OrderStatus {
  id: number;
  name: string;
  color: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  createdAt: string;
  status?: OrderStatus | null;
}

const router = useRouter();
const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref('');

const goToOrder = (id: string) => {
  router.push(`/admin/orders/${id}`);
};

const loadOrders = async () => {
  loading.value = true;
  error.value = '';

  try {
    const res = await client.get('/orders');
    orders.value = res.data || [];
  } catch (err) {
    console.error(err);
    error.value = 'Ошибка загрузки заказов';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('ru-RU');
};

onMounted(loadOrders);
</script>

<style scoped>
.orders-shell {
  max-width: 920px;
}

.order-card {
  cursor: pointer;
  border-left: 4px solid #ffc107;
}

.order-card:focus-visible {
  outline: 3px solid rgba(255, 193, 7, 0.5);
  outline-offset: 2px;
}
</style>
