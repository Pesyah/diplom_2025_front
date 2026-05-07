<!-- src/views/admin/AdminOrdersView.vue -->
<template>
  <div class="container py-4">
    <h1 class="fw-bold mb-4" style="color: #4a3f6b">🛒 Все заказы</h1>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="orders.length === 0" class="text-center py-5">
      <div style="font-size: 4rem">🛒</div>
      <h3 style="color: #4a3f6b">Заказов пока нет</h3>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Пользователь</th>
            <th>Позиций</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td class="text-muted small">{{ order.id.slice(0, 8) }}</td>
            <td>{{ order.users?.name || '—' }}</td>
            <td>{{ order.ordersItems?.length || 0 }}</td>
            <td class="fw-bold" style="color: #4a3f6b">
              {{ Number(order.totalValue).toFixed(2) }} ₽
            </td>
            <td>
              <select
                class="form-select form-select-sm"
                style="width: 140px; border-color: #c4b5e3"
                :value="order.orderStatus?.id"
                @change="
                  changeStatus(
                    order.id,
                    Number(($event.target as HTMLSelectElement).value),
                  )
                "
              >
                <option v-for="s in statuses" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </td>
            <td>
              <router-link
                :to="'/admin/orders/' + order.id"
                class="btn btn-sm"
                style="
                  background-color: #e8dff5;
                  color: #4a3f6b;
                  border-radius: 8px;
                "
              >
                👁
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { onMounted, ref } from 'vue';

const loading = ref(true);
const error = ref('');
const orders = ref<any[]>([]);
const statuses = ref<any[]>([]);

const loadOrders = async () => {
  loading.value = true;
  try {
    const res = await client.get('/orders/admin/all');
    orders.value = res.data;
    // Статусы берем из первого заказа или задаем статично
    // Скорее всего сиды: 1-Не начат, 2-В работе, 3-Готов, 4-Выдан, 5-Отменён
    statuses.value = [
      { id: 1, name: 'Не начат' },
      { id: 2, name: 'В работе' },
      { id: 3, name: 'Готов' },
      { id: 4, name: 'Выдан' },
      { id: 5, name: 'Отменён' },
    ];
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }
};

const changeStatus = async (orderId: string, statusId: number) => {
  try {
    await client.patch('/orders/admin', {
      id: orderId,
      orderStatusId: statusId,
    });
    await loadOrders();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка смены статуса';
  }
};

onMounted(loadOrders);
</script>
