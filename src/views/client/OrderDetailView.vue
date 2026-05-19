<!-- src/views/client/OrderDetailView.vue -->
<template>
  <div class="container py-4">
    <router-link
      to="/orders"
      class="btn btn-sm mb-3"
      style="background-color: #e8dff5; color: #4a3f6b; border-radius: 12px"
    >
      ← Назад к заказам
    </router-link>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="order" class="card shadow-sm">
      <div class="card-body">
        <div
          class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4 pb-3"
          style="border-bottom: 2px solid #e8dff5"
        >
          <div>
            <h4 class="fw-bold" style="color: #2d2640">
              Заказ #{{ order.id.slice(0, 8) }}
            </h4>
            <span
              class="badge-status mt-1"
              :style="getStatusStyle(order.orderStatus?.id)"
            >
              {{ order.orderStatus?.name }}
            </span>
          </div>
          <div class="text-end">
            <div class="text-muted small">Сумма заказа</div>
            <div class="fw-bold" style="color: #4a3f6b; font-size: 1.5rem">
              {{ Number(order.totalValue).toFixed(2) }} ₽
            </div>
          </div>
        </div>

        <div
          v-if="order.comment"
          class="mb-4 p-3 rounded-3"
          style="background-color: #f5f0eb"
        >
          <span class="fw-semibold" style="color: #4a3f6b"
            >💬 Комментарий:</span
          >
          <span style="color: #2d2640">{{ order.comment }}</span>
        </div>

        <h5 class="fw-bold mb-3" style="color: #2d2640">📦 Позиции заказа</h5>

        <div v-if="order.ordersItems?.length">
          <div
            v-for="item in order.ordersItems"
            :key="item.id"
            class="p-3 mb-2 rounded-3"
            style="background-color: #f5f0eb"
          >
            <div
              class="d-flex justify-content-between align-items-start flex-wrap gap-2"
            >
              <div class="d-flex align-items-start gap-2 flex-grow-1">
                <img
                  :src="getImageUrl(getItemAvatar(item))"
                  :alt="getItemName(item)"
                  class="rounded-3"
                  style="width: 48px; height: 48px; object-fit: cover"
                  @error="(e: any) => { e.target.style.display = 'none' }"
                />
                <div class="flex-grow-1">
                  <span
                    class="badge mb-1"
                    :style="
                      item.products
                        ? 'background-color: #b8a9d4; color: #2d2640'
                        : 'background-color: #c4b5e3; color: #2d2640'
                    "
                  >
                    {{ item.products ? '🥐 Продукт' : '☕ Кофе' }}
                  </span>
                  <h6 class="fw-bold mt-1" style="color: #2d2640">
                    {{ getItemName(item) }}
                  </h6>
                  <div
                    v-if="
                      !item.products &&
                      item.coffeeAdditiveRelation?.coffeeAdditive?.name
                    "
                    class="mt-1"
                  >
                    <span class="text-muted small">
                      Добавка:
                      {{ item.coffeeAdditiveRelation.coffeeAdditive.name }}
                    </span>
                  </div>
                  <p class="small text-muted mb-0 mt-1">
                    {{ getItemPrice(item).toFixed(2) }} ₽ ×
                    {{ item.quantity }} =
                    {{ Number(item.totalValue).toFixed(2) }} ₽
                  </p>
                </div>
              </div>
              <div class="text-end">
                <span class="fw-bold" style="color: #4a3f6b"
                  >{{ Number(item.totalValue).toFixed(2) }} ₽</span
                >
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-muted py-3">
          Нет позиций в заказе
        </div>

        <div
          v-if="order.orderStatus?.id === 1"
          class="mt-4 pt-3"
          style="border-top: 2px solid #e8dff5"
        >
          <button
            class="btn"
            style="background-color: #e74c3c; color: #fff; border-radius: 12px"
            @click="cancelOrder"
            :disabled="cancelling"
          >
            <span
              v-if="cancelling"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            Отменить заказ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useImageUrl } from '@/composables/useImageUrl';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { getImageUrl } = useImageUrl();
const loading = ref(true);
const error = ref('');
const order = ref<any>(null);
const cancelling = ref(false);

const getItemAvatar = (item: any) => {
  if (item.products) return item.products.avatar || '';
  if (item.coffeeVolumeRelation?.coffee)
    return item.coffeeVolumeRelation.coffee.avatar || '';
  return '';
};

const loadOrder = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await client.get(`/orders/by-id/${route.params.id}`);
    order.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки заказа';
  } finally {
    loading.value = false;
  }
};

const cancelOrder = async () => {
  cancelling.value = true;
  try {
    await client.patch(`/orders/cancel/${route.params.id}`);
    await loadOrder();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка отмены заказа';
  } finally {
    cancelling.value = false;
  }
};

const getItemName = (item: any) => {
  if (item.products) return item.products.name;
  if (item.coffeeVolumeRelation) {
    let name = `${item.coffeeVolumeRelation.coffee?.name || 'Кофе'} (${
      item.coffeeVolumeRelation.coffeeVolume?.name || ''
    })`;
    if (item.coffeeAdditiveRelation?.coffeeAdditive?.name) {
      name += ` + ${item.coffeeAdditiveRelation.coffeeAdditive.name}`;
    }
    return name;
  }
  return 'Неизвестно';
};

const getItemPrice = (item: any) => {
  const quantity = Number(item.quantity);
  const totalValue = Number(item.totalValue);
  if (quantity > 0 && Number.isFinite(totalValue)) {
    return totalValue / quantity;
  }

  if (item.products) return Number(item.products.price) || 0;
  let price = 0;
  if (item.coffeeVolumeRelation) {
    price = Number(item.coffeeVolumeRelation.price) || 0;
  }
  if (item.coffeeAdditiveRelation) {
    price += Number(item.coffeeAdditiveRelation.price) || 0;
  }
  return price;
};

const getStatusStyle = (statusId: number) => {
  const styles: Record<number, string> = {
    1: 'background-color: #fff3cd; color: #856404',
    2: 'background-color: #cce5ff; color: #004085',
    3: 'background-color: #d4edda; color: #155724',
    4: 'background-color: #e8dff5; color: #4a3f6b',
    5: 'background-color: #f8d7da; color: #721c24',
  };
  return styles[statusId] || 'background-color: #e2e3e5; color: #383d41';
};

onMounted(loadOrder);
</script>
