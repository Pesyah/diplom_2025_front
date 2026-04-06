<template>
  <div>
    <h2 class="mb-4">Управление заказами</h2>

    <!-- Фильтры -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input
              v-model="searchQuery"
              placeholder="Поиск по ID или email..."
              class="form-control"
            />
          </div>
          <div class="col-md-3">
            <select v-model="statusFilter" class="form-select">
              <option :value="null">Все статусы</option>
              <option v-for="s in allStatuses" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <button @click="resetFilters" class="btn btn-secondary w-100">
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </div>

    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>Пользователь</th>
          <th>Сумма</th>
          <th>Статус</th>
          <th>Дата</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in filteredOrders" :key="order.id">
          <td>{{ order.id.slice(0, 8) }}...</td>
          <td>{{ order.users?.email }}</td>
          <td>{{ getOrderTotal(order) }} ₽</td>
          <td>
            <span
              :class="'badge bg-' + getStatusColor(order.orderStatus?.id)"
              >{{ order.orderStatus?.name }}</span
            >
          </td>
          <td>{{ new Date(order.createdAt).toLocaleDateString() }}</td>
          <td>
            <router-link
              :to="`/admin/orders/${order.id}`"
              class="btn btn-sm btn-info me-2"
            >
              Детали
            </router-link>
            <select
              @change="changeStatus(order.id, $event)"
              class="form-select form-select-sm d-inline-block"
              style="width: auto"
            >
              <option
                v-for="s in allStatuses"
                :key="s.id"
                :value="s.id"
                :selected="s.id === order.orderStatus?.id"
              >
                {{ s.name }}
              </option>
            </select>
          </td>
        </tr>
        <tr v-if="filteredOrders.length === 0">
          <td colspan="6" class="text-center py-4">Заказы не найдены</td>
        </tr>
      </tbody>
    </table>

    <nav v-if="totalPages > 1">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: page === 1 }">
          <button class="page-link" @click="page--">«</button>
        </li>
        <li
          class="page-item"
          v-for="p in visiblePages"
          :key="p"
          :class="{ active: p === page }"
        >
          <button class="page-link" @click="page = p">{{ p }}</button>
        </li>
        <li class="page-item" :class="{ disabled: page === totalPages }">
          <button class="page-link" @click="page++">»</button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { computed, onMounted, ref, watch } from 'vue';

const orders = ref([]);
const allStatuses = ref([]);
const page = ref(1);
const totalPages = ref(1);
const searchQuery = ref('');
const statusFilter = ref<number | null>(null);

const fetch = async () => {
  const res = await client.get(`/orders/admin/all?page=${page.value}&limit=20`);
  orders.value = res.data.data;
  totalPages.value = res.data.totalPages;
};

const fetchStatuses = async () => {
  const res = await client.get('/orders/all-relations');
  allStatuses.value = res.data.orderStatus;
};

const getOrderTotal = (order: any) => {
  if (!order.ordersParts) return 0;
  return order.ordersParts.reduce(
    (sum: number, part: any) => sum + part.priceAtTime * part.count,
    0,
  );
};

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

const changeStatus = async (id: string, event: any) => {
  await client.patch(`/orders/admin/change-status/${id}`, {
    statusId: +event.target.value,
  });
  fetch();
};

const filteredOrders = computed(() => {
  let result = orders.value;
  if (statusFilter.value !== null)
    result = result.filter(
      (order: any) => order.orderStatus?.id === statusFilter.value,
    );
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (order: any) =>
        order.id.toLowerCase().includes(query) ||
        order.users?.email?.toLowerCase().includes(query),
    );
  }
  return result;
});

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = null;
};

const visiblePages = computed(() => {
  const delta = 2;
  const range = [];
  const start = Math.max(1, page.value - delta);
  const end = Math.min(totalPages.value, page.value + delta);
  for (let i = start; i <= end; i++) range.push(i);
  return range;
});

onMounted(() => {
  fetch();
  fetchStatuses();
});

watch(page, () => fetch());
</script>
