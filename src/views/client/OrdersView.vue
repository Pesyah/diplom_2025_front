<!-- src/views/client/OrdersView.vue -->
<template>
  <div class="container">
    <h2 class="mb-4">📋 Мои заказы</h2>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-warning"></div>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-5">
      <p class="text-muted fs-4">У вас пока нет заказов</p>
      <router-link to="/catalog" class="btn btn-warning"
        >Перейти в каталог</router-link
      >
    </div>

    <div v-else>
      <div v-for="order in orders" :key="order.id" class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6>Заказ #{{ order.id?.substring(0, 8) }}</h6>
              <small class="text-muted">{{
                formatDate(order.createdAt)
              }}</small>
              <p class="mb-1">
                Статус:
                <span :class="getStatusClass(order.status?.name)">
                  {{ order.status?.name || 'Неизвестно' }}
                </span>
              </p>
            </div>
            <div class="text-end">
              <p class="text-warning fw-bold fs-5">
                {{ formatPrice(order.totalPrice || 0) }} ₽
              </p>
              <small>{{ order.items?.length || 0 }} товаров</small>
            </div>
          </div>

          <div v-if="order.items" class="mt-3">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="d-flex align-items-center py-2 border-top"
            >
              <img
                v-if="item.product?.images?.[0]"
                :src="getImageUrl(item.product.images[0])"
                class="rounded me-2"
                style="width: 50px; height: 50px; object-fit: cover"
              />
              <div>
                <small class="fw-bold">{{
                  item.product?.name || 'Товар'
                }}</small>
                <br />
                <small class="text-muted"
                  >{{ item.quantity }} шт. ×
                  {{ formatPrice(item.price) }} ₽</small
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useImageUrl } from '@/composables/useImageUrl';
import { onMounted, ref } from 'vue';

const { getImageUrl } = useImageUrl();

const orders = ref<any[]>([]);
const loading = ref(true);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('ru-RU');
};

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'новый':
      return 'badge bg-primary';
    case 'в обработке':
      return 'badge bg-warning text-dark';
    case 'доставлен':
      return 'badge bg-success';
    case 'отменен':
      return 'badge bg-danger';
    default:
      return 'badge bg-secondary';
  }
};

onMounted(async () => {
  try {
    const res = await client.get('/orders/my');
    orders.value = res.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
