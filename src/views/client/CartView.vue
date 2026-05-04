<!-- src/views/client/CartView.vue -->
<template>
  <div class="container">
    <h2 class="mb-4">🛒 Корзина</h2>

    <div v-if="cartStore.items.length === 0" class="text-center py-5">
      <p class="text-muted fs-4">Корзина пуста</p>
      <router-link to="/catalog" class="btn btn-warning"
        >Перейти в каталог</router-link
      >
    </div>

    <div v-else class="row">
      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <div
              v-for="item in cartStore.items"
              :key="item.productId"
              class="d-flex align-items-center border-bottom py-3"
            >
              <img
                v-if="item.photo"
                :src="getImageUrl(item.photo)"
                class="rounded me-3"
                style="width: 80px; height: 80px; object-fit: cover"
              />
              <div class="flex-grow-1">
                <h6 class="mb-1">{{ item.name }}</h6>
                <small class="text-muted">{{ item.brand }}</small>
                <p class="text-warning fw-bold mb-0">
                  {{ formatPrice(item.price) }} ₽
                </p>
              </div>
              <div class="d-flex align-items-center">
                <button
                  @click="decreaseCount(item)"
                  class="btn btn-outline-secondary btn-sm"
                >
                  −
                </button>
                <span class="mx-2">{{ item.count }}</span>
                <button
                  @click="increaseCount(item)"
                  class="btn btn-outline-secondary btn-sm"
                >
                  +
                </button>
              </div>
              <button
                @click="removeItem(item.productId)"
                class="btn btn-outline-danger btn-sm ms-3"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5>Итого:</h5>
            <p class="fs-3 text-warning fw-bold">
              {{ formatPrice(cartStore.totalPrice()) }} ₽
            </p>
            <p>Товаров: {{ cartStore.itemsCount() }} шт.</p>

            <div class="mb-3">
              <label class="form-label">Примечание к заказу</label>
              <textarea
                v-model="notes"
                class="form-control"
                rows="3"
              ></textarea>
            </div>

            <button
              @click="createOrder"
              class="btn btn-warning w-100"
              :disabled="ordering"
            >
              {{ ordering ? 'Оформление...' : 'Оформить заказ' }}
            </button>
            <p v-if="orderError" class="text-danger mt-2">{{ orderError }}</p>
            <p v-if="orderSuccess" class="text-success mt-2">Заказ создан!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useImageUrl } from '@/composables/useImageUrl';
import { useCartStore } from '@/stores/cartStore';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const { getImageUrl } = useImageUrl();
const cartStore = useCartStore();
const router = useRouter();

const notes = ref('');
const ordering = ref(false);
const orderError = ref('');
const orderSuccess = ref(false);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

const increaseCount = (item: any) => {
  cartStore.updateCount(item.productId, item.count + 1);
};

const decreaseCount = (item: any) => {
  cartStore.updateCount(item.productId, item.count - 1);
};

const removeItem = (productId: string) => {
  cartStore.removeItem(productId);
};

const createOrder = async () => {
  if (cartStore.items.length === 0) return;

  ordering.value = true;
  orderError.value = '';
  orderSuccess.value = false;

  try {
    await client.post('/orders', {
      items: cartStore.items.map((item) => ({
        productId: item.productId,
        quantity: item.count,
      })),
      notes: notes.value,
    });

    orderSuccess.value = true;
    cartStore.clearCart();

    setTimeout(() => {
      router.push('/orders');
    }, 1500);
  } catch (err: any) {
    orderError.value = err.response?.data?.message || 'Ошибка создания заказа';
  } finally {
    ordering.value = false;
  }
};
</script>
