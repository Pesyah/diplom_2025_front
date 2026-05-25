<!-- src/views/admin/AdminOrderDetailView.vue -->
<template>
  <div class="container">
    <div class="order-detail mx-auto">
      <router-link to="/admin/orders" class="btn btn-link px-0 mb-3">
        ← К заказам
      </router-link>

      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-warning"></div>
      </div>

      <div v-else-if="!order" class="card shadow-sm">
        <div class="card-body text-center text-muted py-4">
          Заказ не найден
        </div>
      </div>

      <template v-else>
        <section class="card shadow-sm mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <h2 class="h4 mb-1">
                  Заказ #{{ order.orderNumber || order.id.substring(0, 8) }}
                </h2>
                <div class="text-muted">{{ formatDate(order.createdAt) }}</div>
              </div>
              <span
                class="badge rounded-pill px-3 py-2"
                :style="{ backgroundColor: order.status?.color || '#6c757d' }"
              >
                {{ order.status?.name || 'Неизвестно' }}
              </span>
            </div>

            <div class="row g-3 mt-3">
              <div class="col-md-5">
                <div class="small text-muted">Покупатель</div>
                <div class="fw-semibold">{{ getCustomerName(order.customer) }}</div>
                <div class="small">{{ order.customer?.email || '—' }}</div>
                <div class="small">{{ order.customer?.phone || '—' }}</div>
              </div>

              <div class="col-md-5">
                <label class="form-label small text-muted">Сменить статус</label>
                <div class="input-group input-group-sm">
                  <select v-model.number="selectedStatusId" class="form-select">
                    <option
                      v-for="status in statuses"
                      :key="status.id"
                      :value="status.id"
                    >
                      {{ status.name }}
                    </option>
                  </select>
                  <button
                    class="btn btn-outline-warning"
                    :disabled="savingStatus || selectedStatusId === order.status?.id"
                    @click="updateStatus"
                  >
                    OK
                  </button>
                </div>
              </div>

              <div class="col-md-2 text-md-end">
                <button class="btn btn-outline-danger btn-sm" @click="deleteOrder">
                  Удалить
                </button>
              </div>
            </div>

            <div v-if="order.notes" class="alert alert-light mt-3 mb-0">
              {{ order.notes }}
            </div>
          </div>
        </section>

        <section class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3 class="h5 mb-0">Состав заказа</h3>
              <div class="text-end">
                <div class="text-muted small">
                  {{ order.totalQuantity }} товаров
                </div>
                <div class="text-warning fw-bold fs-5">
                  {{ formatPrice(order.totalPrice) }} ₽
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead>
                  <tr>
                    <th style="width: 64px">Фото</th>
                    <th>Товар</th>
                    <th class="text-end">Цена</th>
                    <th class="text-end">Кол-во</th>
                    <th class="text-end">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in order.items" :key="item.id">
                    <td>
                      <img
                        v-if="item.product?.images?.[0]"
                        :src="getImageUrl(item.product.images[0])"
                        :alt="item.productName"
                        class="rounded order-item-image"
                      />
                      <div
                        v-else
                        class="rounded bg-light order-item-image d-flex align-items-center justify-content-center text-muted"
                      >
                        Нет
                      </div>
                    </td>
                    <td>{{ item.productName }}</td>
                    <td class="text-end">{{ formatPrice(item.unitPrice) }} ₽</td>
                    <td class="text-end">{{ item.quantity }}</td>
                    <td class="text-end">{{ formatPrice(item.total) }} ₽</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </template>

      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useImageUrl } from '@/composables/useImageUrl';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface OrderStatus {
  id: number;
  name: string;
  color: string;
}

interface Customer {
  id: string;
  email?: string;
  name?: string;
  surname?: string;
  phone?: string;
}

interface OrderProduct {
  id: string;
  name: string;
  images?: string[] | null;
}

interface OrderItem {
  id: string;
  productName: string;
  unitPrice: number | string;
  quantity: number;
  total: number | string;
  product: OrderProduct | null;
}

interface Order {
  id: string;
  orderNumber?: string;
  createdAt: string;
  customer?: Customer | null;
  notes?: string | null;
  status?: OrderStatus | null;
  totalPrice: number | string;
  totalQuantity: number;
  items: OrderItem[];
}

const route = useRoute();
const router = useRouter();
const { getImageUrl } = useImageUrl();
const order = ref<Order | null>(null);
const statuses = ref<OrderStatus[]>([]);
const selectedStatusId = ref<number | null>(null);
const loading = ref(true);
const savingStatus = ref(false);
const error = ref('');

const loadOrder = async () => {
  loading.value = true;
  error.value = '';

  try {
    const [orderRes, statusesRes] = await Promise.all([
      client.get(`/orders/admin/by-id/${route.params.id}`),
      client.get('/orders/statuses'),
    ]);

    order.value = {
      ...orderRes.data,
      items: orderRes.data.items || [],
      totalPrice: orderRes.data.totalPrice || 0,
      totalQuantity: orderRes.data.totalQuantity || 0,
    };
    statuses.value = statusesRes.data || [];
    selectedStatusId.value = order.value.status?.id || null;
  } catch (err) {
    console.error(err);
    error.value = 'Ошибка загрузки заказа';
  } finally {
    loading.value = false;
  }
};

const updateStatus = async () => {
  if (!order.value || !selectedStatusId.value) return;

  savingStatus.value = true;
  error.value = '';

  try {
    await client.patch(`/orders/by-id/${order.value.id}/status`, {
      statusId: selectedStatusId.value,
    });
    await loadOrder();
  } catch (err) {
    console.error(err);
    error.value = 'Ошибка обновления статуса';
  } finally {
    savingStatus.value = false;
  }
};

const deleteOrder = async () => {
  if (!order.value || !confirm('Удалить заказ?')) return;

  try {
    await client.delete(`/orders/by-id/${order.value.id}`);
    router.push('/admin/orders');
  } catch (err) {
    console.error(err);
    error.value = 'Ошибка удаления заказа';
  }
};

const getCustomerName = (customer?: Customer | null) => {
  if (!customer) return '—';
  return [customer.name, customer.surname].filter(Boolean).join(' ') || '—';
};

const formatPrice = (price: number | string) => {
  return new Intl.NumberFormat('ru-RU').format(Number(price) || 0);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('ru-RU');
};

onMounted(loadOrder);
</script>

<style scoped>
.order-detail {
  max-width: 980px;
}

.order-item-image {
  width: 52px;
  height: 52px;
  object-fit: contain;
  border: 1px solid #eef0f2;
  font-size: 0.75rem;
}
</style>
