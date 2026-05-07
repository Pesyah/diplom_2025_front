<!-- src/views/client/OrdersView.vue -->
<template>
  <div class="container py-4">
    <h1 class="fw-bold mb-4" style="color: #4a3f6b">📋 Мои заказы</h1>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="orders.length === 0" class="text-center py-5">
      <div style="font-size: 4rem">📋</div>
      <h3 style="color: #4a3f6b">Заказов пока нет</h3>
      <router-link
        to="/menu"
        class="btn mt-2"
        style="background-color: #4a3f6b; color: #fff; border-radius: 24px"
      >
        Сделать заказ
      </router-link>
    </div>

    <div v-else class="row g-4">
      <div v-for="order in orders" :key="order.id" class="col-12">
        <router-link :to="'/orders/' + order.id" class="text-decoration-none">
          <div class="card shadow-sm hover-card">
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-start flex-wrap gap-2"
              >
                <div>
                  <span class="text-muted small"
                    >Заказ #{{ order.id.slice(0, 8) }}</span
                  >
                  <h5 class="mt-1 fw-bold" style="color: #2d2640">
                    {{ order.ordersItems?.length || 0 }} позиций
                  </h5>
                </div>
                <div class="text-end">
                  <span
                    class="badge-status"
                    :style="getStatusStyle(order.orderStatus?.id)"
                  >
                    {{ order.orderStatus?.name || 'Неизвестно' }}
                  </span>
                  <div
                    class="fw-bold mt-1"
                    style="color: #4a3f6b; font-size: 1.2rem"
                  >
                    {{ Number(order.totalValue).toFixed(2) }} ₽
                  </div>
                </div>
              </div>

              <div v-if="order.orderStatus?.id === 1" class="mt-3">
                <button
                  class="btn btn-sm"
                  style="
                    background-color: #e74c3c;
                    color: #fff;
                    border-radius: 12px;
                  "
                  @click.prevent.stop="cancelOrder(order.id)"
                  :disabled="cancelling === order.id"
                >
                  <span
                    v-if="cancelling === order.id"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  Отменить заказ
                </button>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { onMounted, ref } from 'vue';

const loading = ref(true);
const error = ref('');
const orders = ref<any[]>([]);
const cancelling = ref<string | null>(null);

const loadOrders = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await client.get('/orders/by-user');
    orders.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки заказов';
  } finally {
    loading.value = false;
  }
};

const cancelOrder = async (orderId: string) => {
  cancelling.value = orderId;
  try {
    await client.patch(`/orders/cancel/${orderId}`);
    await loadOrders();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка отмены заказа';
  } finally {
    cancelling.value = null;
  }
};

const getStatusStyle = (statusId: number) => {
  const styles: Record<number, string> = {
    1: 'background-color: #fff3cd; color: #856404', // Не начат
    2: 'background-color: #cce5ff; color: #004085', // В работе
    3: 'background-color: #d4edda; color: #155724', // Готов
    4: 'background-color: #e8dff5; color: #4a3f6b', // Выдан
    5: 'background-color: #f8d7da; color: #721c24', // Отменён
  };
  return styles[statusId] || 'background-color: #e2e3e5; color: #383d41';
};

onMounted(loadOrders);
</script>

<style scoped>
.hover-card {
  transition: all 0.2s;
}
.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(74, 63, 107, 0.2) !important;
}
</style>
