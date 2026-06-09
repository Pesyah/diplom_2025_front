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

    <OrderFilters
      v-model:modelValue="filters"
      :statuses="statuses"
      :priceMin="priceRange.min"
      :priceMax="priceRange.max"
      :dateMin="dateRange.min"
      :dateMax="dateRange.max"
      class="mb-4"
    />

    <div
      v-if="!filteredOrders.length && orders.length"
      class="text-center py-5"
    >
      <div style="font-size: 4rem">🛒</div>
      <h3 style="color: #4a3f6b">Заказов не найдено</h3>
      <p class="text-muted">Попробуйте изменить фильтры.</p>
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
          <tr v-for="order in filteredOrders" :key="order.id">
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
import OrderFilters from '@/components/OrderFilters.vue';
import { computed, onMounted, ref } from 'vue';

const loading = ref(true);
const error = ref('');
const orders = ref<any[]>([]);
const statuses = ref([
  { id: 1, name: 'Создан' },
  { id: 2, name: 'В работе' },
  { id: 3, name: 'Готов' },
  { id: 4, name: 'Выдан' },
  { id: 5, name: 'Отменён' },
]);

const filters = ref({
  priceFrom: '',
  priceTo: '',
  dateFrom: '',
  dateTo: '',
  statuses: [] as number[],
});

const getOrderDate = (order: any) => {
  const fields = [
    'createdAt',
    'created_at',
    'date',
    'orderDate',
    'updatedAt',
    'updated_at',
  ];
  for (const field of fields) {
    if (order?.[field]) {
      const date = new Date(order[field]);
      if (!Number.isNaN(date.valueOf())) {
        return date;
      }
    }
  }
  return null;
};

const priceRange = computed(() => {
  const prices = orders.value
    .map((order) => Number(order.totalValue ?? order.sum ?? 0))
    .filter((value) => Number.isFinite(value));
  if (!prices.length) {
    return { min: 0, max: 0 };
  }
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
});

const dateRange = computed(() => {
  const dates = orders.value
    .map((order) => getOrderDate(order))
    .filter(
      (date) => date instanceof Date && !Number.isNaN(date.valueOf()),
    ) as Date[];
  if (!dates.length) {
    return { min: '', max: '' };
  }
  const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
  const pad = (value: number) => String(value).padStart(2, '0');
  const format = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return {
    min: format(sorted[0]),
    max: format(sorted[sorted.length - 1]),
  };
});

const filterByValue = (value: string) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const totalPrice = Number(order.totalValue ?? order.sum ?? 0);
    const date = getOrderDate(order);

    if (filters.value.priceFrom) {
      const from = filterByValue(filters.value.priceFrom);
      if (from !== null && totalPrice < from) {
        return false;
      }
    }
    if (filters.value.priceTo) {
      const to = filterByValue(filters.value.priceTo);
      if (to !== null && totalPrice > to) {
        return false;
      }
    }

    if (filters.value.dateFrom) {
      if (!date) {
        return false;
      }
      const fromDate = new Date(filters.value.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (date < fromDate) {
        return false;
      }
    }
    if (filters.value.dateTo) {
      if (!date) {
        return false;
      }
      const toDate = new Date(filters.value.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (date > toDate) {
        return false;
      }
    }

    if (filters.value.statuses.length) {
      return filters.value.statuses.includes(order.orderStatus?.id);
    }

    return true;
  });
});

const loadOrders = async () => {
  loading.value = true;
  try {
    const res = await client.get('/orders/admin/all');
    orders.value = res.data;
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
