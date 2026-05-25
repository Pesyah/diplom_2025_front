<!-- src/views/admin/AdminDashboardView.vue -->
<template>
  <div class="container">
    <div class="dashboard-shell mx-auto">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1">Панель администратора</h2>
          <div class="text-muted">Короткая сводка по магазину</div>
        </div>
        <button class="btn btn-outline-secondary btn-sm" @click="loadDashboard">
          Обновить
        </button>
      </div>

      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-warning"></div>
      </div>

      <template v-else>
        <div class="row g-3 mb-4">
          <div class="col-md-3 col-6">
            <div class="metric-card">
              <div class="text-muted small">Заказов</div>
              <div class="metric-value">{{ stats.ordersTotal }}</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="metric-card">
              <div class="text-muted small">Оформлено</div>
              <div class="metric-value">{{ stats.newOrders }}</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="metric-card">
              <div class="text-muted small">Выручка</div>
              <div class="metric-value">{{ formatPrice(stats.revenue) }} ₽</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="metric-card">
              <div class="text-muted small">Мало на складе</div>
              <div class="metric-value">{{ lowStockProducts.length }}</div>
            </div>
          </div>
        </div>

        <div class="quick-actions mb-4">
          <router-link to="/admin/products/create" class="btn btn-warning">
            Создать товар
          </router-link>
          <router-link to="/admin/orders" class="btn btn-outline-dark">
            Заказы
          </router-link>
          <router-link to="/admin/brands/create" class="btn btn-outline-dark">
            Бренд
          </router-link>
          <router-link to="/admin/categories/create" class="btn btn-outline-dark">
            Категория
          </router-link>
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
            <section class="card shadow-sm">
              <div class="card-body">
                <h3 class="h5 mb-3">Последние заказы</h3>
                <div v-if="latestOrders.length === 0" class="text-muted">
                  Заказов пока нет
                </div>
                <div v-else class="d-flex flex-column gap-2">
                  <router-link
                    v-for="order in latestOrders"
                    :key="order.id"
                    :to="`/admin/orders/${order.id}`"
                    class="dashboard-order text-decoration-none"
                  >
                    <div>
                      <div class="fw-semibold">
                        Заказ #{{ order.orderNumber || order.id.substring(0, 8) }}
                      </div>
                      <div class="text-muted small">
                        {{ formatDate(order.createdAt) }}
                      </div>
                    </div>
                    <span
                      class="badge rounded-pill"
                      :style="{ backgroundColor: order.status?.color || '#6c757d' }"
                    >
                      {{ order.status?.name || 'Неизвестно' }}
                    </span>
                  </router-link>
                </div>
              </div>
            </section>
          </div>

          <div class="col-lg-5">
            <section class="card shadow-sm">
              <div class="card-body">
                <h3 class="h5 mb-3">Остатки требуют внимания</h3>
                <div v-if="lowStockProducts.length === 0" class="text-muted">
                  Критичных остатков нет
                </div>
                <div v-else class="d-flex flex-column gap-2">
                  <router-link
                    v-for="product in lowStockProducts"
                    :key="product.id"
                    :to="`/admin/products/${product.id}/edit`"
                    class="stock-row text-decoration-none"
                  >
                    <span class="stock-name">{{ product.name }}</span>
                    <span
                      class="badge"
                      :class="getStockBadgeClass(product.stockQuantity)"
                    >
                      {{ getStockLabel(product.stockQuantity) }}
                    </span>
                  </router-link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </template>

      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { computed, onMounted, ref } from 'vue';

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
  totalPrice: number | string;
}

interface Product {
  id: string;
  name: string;
  stockQuantity: number;
}

const orders = ref<Order[]>([]);
const products = ref<Product[]>([]);
const loading = ref(true);
const error = ref('');

const stats = computed(() => {
  return {
    ordersTotal: orders.value.length,
    newOrders: orders.value.filter((order) => order.status?.id === 1).length,
    revenue: orders.value
      .filter((order) => order.status?.id !== 5)
      .reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0),
  };
});

const latestOrders = computed(() => orders.value.slice(0, 5));
const lowStockProducts = computed(() =>
  products.value
    .filter((product) => product.stockQuantity <= 5)
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 6),
);

const loadDashboard = async () => {
  loading.value = true;
  error.value = '';

  try {
    const [ordersRes, productsRes] = await Promise.all([
      client.get('/orders'),
      client.get('/admin/products', { params: { page: 1, limit: 100 } }),
    ]);

    orders.value = ordersRes.data || [];
    products.value = productsRes.data.data || [];
  } catch (err) {
    console.error(err);
    error.value = 'Ошибка загрузки дашборда';
  } finally {
    loading.value = false;
  }
};

const formatPrice = (price: number | string) => {
  return new Intl.NumberFormat('ru-RU').format(Number(price) || 0);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('ru-RU');
};

const getStockBadgeClass = (quantity: number) => {
  if (quantity <= 0) return 'bg-danger';
  if (quantity <= 5) return 'bg-warning text-dark';
  return 'bg-success';
};

const getStockLabel = (quantity: number) => {
  if (quantity <= 0) return 'Нет';
  if (quantity <= 5) return `Мало: ${quantity}`;
  return `${quantity} шт.`;
};

onMounted(loadDashboard);
</script>

<style scoped>
.dashboard-shell {
  max-width: 1180px;
}

.metric-card {
  min-height: 112px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #eef0f2;
  padding: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.metric-value {
  margin-top: 8px;
  font-size: 1.7rem;
  font-weight: 700;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dashboard-order,
.stock-row {
  color: #212529;
  border: 1px solid #eef0f2;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.dashboard-order:hover,
.stock-row:hover {
  background: #fff9e6;
}

.stock-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
