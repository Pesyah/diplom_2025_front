<!-- src/views/client/OrderDetailView.vue -->
<template>
  <div class="container">
    <div class="order-detail mx-auto">
      <router-link to="/orders" class="btn btn-link px-0 mb-3">
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

            <div class="d-flex flex-column gap-2">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="order-item d-flex align-items-center gap-3"
              >
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
                  Нет фото
                </div>

                <div class="flex-grow-1">
                  <div class="fw-semibold">{{ item.productName }}</div>
                  <div class="text-muted small">
                    {{ item.quantity }} шт. × {{ formatPrice(item.unitPrice) }} ₽
                  </div>
                </div>

                <div class="fw-semibold text-end">
                  {{ formatPrice(item.total) }} ₽
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useImageUrl } from '@/composables/useImageUrl';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

interface OrderStatus {
  id: number;
  name: string;
  color: string;
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
  notes?: string | null;
  status?: OrderStatus | null;
  totalPrice: number | string;
  totalQuantity: number;
  items: OrderItem[];
}

const route = useRoute();
const { getImageUrl } = useImageUrl();
const order = ref<Order | null>(null);
const loading = ref(true);

const formatPrice = (price: number | string) => {
  return new Intl.NumberFormat('ru-RU').format(Number(price) || 0);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('ru-RU');
};

onMounted(async () => {
  try {
    const res = await client.get(`/orders/by-id/${route.params.id}`);
    order.value = {
      ...res.data,
      items: res.data.items || [],
      totalPrice: res.data.totalPrice || 0,
      totalQuantity: res.data.totalQuantity || 0,
    };
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.order-detail {
  max-width: 920px;
}

.order-item {
  border: 1px solid #eef0f2;
  border-radius: 8px;
  padding: 10px;
}

.order-item-image {
  width: 52px;
  height: 52px;
  object-fit: contain;
  border: 1px solid #eef0f2;
  font-size: 0.75rem;
}
</style>
