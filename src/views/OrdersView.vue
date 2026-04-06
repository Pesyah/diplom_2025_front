<template>
  <div>
    <h2 class="mb-4">Мои заказы</h2>

    <!-- Фильтр по статусам -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span class="me-3">Показывать:</span>
            <div class="btn-group">
              <button
                @click="showArchived = false"
                class="btn btn-sm"
                :class="!showArchived ? 'btn-primary' : 'btn-outline-secondary'"
              >
                Активные
              </button>
              <button
                @click="showArchived = true"
                class="btn btn-sm"
                :class="showArchived ? 'btn-primary' : 'btn-outline-secondary'"
              >
                Все (включая завершенные)
              </button>
            </div>
          </div>
          <span class="text-muted"
            >Всего: {{ filteredOrders.length }} заказов</span
          >
        </div>
      </div>
    </div>

    <div v-if="filteredOrders.length === 0" class="text-center py-5">
      <p>У вас пока нет заказов</p>
      <router-link to="/" class="btn btn-primary">Сделать заказ</router-link>
    </div>

    <div v-else class="row">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="col-md-6 mb-3"
      >
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <h5>Заказ #{{ order.id.slice(0, 8) }}</h5>
              <span
                :class="'badge bg-' + getStatusColor(order.orderStatus?.id)"
              >
                {{ order.orderStatus?.name }}
              </span>
            </div>
            <p class="mb-1">
              Дата: {{ new Date(order.createdAt).toLocaleString() }}
            </p>
            <p class="mb-2">Сумма: {{ getOrderTotal(order) }} ₽</p>
            <router-link
              :to="`/orders/${order.id}`"
              class="btn btn-sm btn-primary"
              >Детали</router-link
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { computed, onMounted, ref } from 'vue';

const orders = ref([]);
const showArchived = ref(false);

// Активные статусы: 1-4 (Ожидает, Подтвержден, Готовится, Готов к выдаче)
// Архивные: 5 (Выдан), 6 (Отменен)
const activeStatusIds = [1, 2, 3, 4];
const archivedStatusIds = [5, 6];

const filteredOrders = computed(() => {
  if (showArchived.value) {
    return orders.value;
  }
  return orders.value.filter((order: any) =>
    activeStatusIds.includes(order.orderStatus?.id),
  );
});

const getStatusColor = (id: number) => {
  const colors: any = {
    1: 'secondary',
    2: 'info',
    3: 'primary',
    4: 'warning',
    5: 'success',
    6: 'danger',
  };
  return colors[id] || 'secondary';
};

const getOrderTotal = (order: any) => {
  if (!order.ordersParts) return 0;
  return order.ordersParts.reduce(
    (sum: number, part: any) => sum + part.priceAtTime * part.count,
    0,
  );
};

onMounted(async () => {
  const res = await client.get('/orders/my');
  orders.value = res.data.data;
});
</script>
