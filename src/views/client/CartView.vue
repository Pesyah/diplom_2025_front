<!-- src/views/client/CartView.vue -->
<template>
  <div class="container py-4">
    <h1 class="fw-bold mb-4" style="color: #4a3f6b">🛒 Корзина</h1>

    <!-- Пустая корзина -->
    <div v-if="cartStore.items.length === 0" class="text-center py-5">
      <div style="font-size: 4rem">🛒</div>
      <h3 class="mt-3" style="color: #4a3f6b">Корзина пуста</h3>
      <p class="text-muted">Добавьте кофе или вкусняшки из меню</p>
      <router-link
        to="/menu"
        class="btn btn-lg mt-2"
        style="background-color: #4a3f6b; color: #fff; border-radius: 24px"
      >
        В меню
      </router-link>
    </div>

    <!-- Корзина с товарами -->
    <div v-else class="row g-4">
      <div class="col-lg-8">
        <div
          v-for="(item, index) in cartStore.items"
          :key="index"
          class="card shadow-sm mb-3"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <span
                    class="badge"
                    :style="
                      item.type === 'coffee'
                        ? 'background-color: #c4b5e3; color: #2d2640'
                        : 'background-color: #b8a9d4; color: #2d2640'
                    "
                  >
                    {{ item.type === 'coffee' ? '☕ Кофе' : '🥐 Продукт' }}
                  </span>
                </div>
                <h5 class="fw-bold" style="color: #2d2640">
                  {{ cartStore.getFormattedItemName(item) }}
                </h5>
                <p class="text-muted mb-0">
                  {{ cartStore.getItemPrice(item) }} ₽ × {{ item.quantity }} =
                  {{
                    (cartStore.getItemPrice(item) * item.quantity).toFixed(2)
                  }}
                  ₽
                </p>
              </div>

              <div class="d-flex align-items-center gap-2">
                <div class="input-group input-group-sm" style="width: 110px">
                  <button
                    class="btn btn-sm"
                    style="
                      background-color: #e8dff5;
                      color: #4a3f6b;
                      border: none;
                    "
                    @click="cartStore.updateQuantity(index, item.quantity - 1)"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    class="form-control form-control-sm text-center"
                    style="
                      background-color: #fff;
                      border-color: #c4b5e3;
                      color: #2d2640;
                    "
                    :value="item.quantity"
                    min="1"
                    @change="
                      cartStore.updateQuantity(
                        index,
                        parseInt(($event.target as HTMLInputElement).value) ||
                          1,
                      )
                    "
                  />
                  <button
                    class="btn btn-sm"
                    style="
                      background-color: #e8dff5;
                      color: #4a3f6b;
                      border: none;
                    "
                    @click="cartStore.updateQuantity(index, item.quantity + 1)"
                  >
                    +
                  </button>
                </div>
                <button
                  class="btn btn-sm"
                  style="color: #e74c3c; border: none"
                  @click="cartStore.removeItem(index)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Итого -->
      <div class="col-lg-4">
        <div class="card shadow-sm sticky-top" style="top: 80px">
          <div class="card-body">
            <h5 class="fw-bold mb-3" style="color: #2d2640">Итого</h5>
            <div class="d-flex justify-content-between mb-2">
              <span style="color: #4a3f6b">Товаров:</span>
              <span class="fw-semibold">{{ cartStore.itemsCount() }}</span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span style="color: #4a3f6b">Сумма:</span>
              <span class="fw-bold" style="color: #2d2640; font-size: 1.2rem">
                {{ cartStore.totalPrice().toFixed(2) }} ₽
              </span>
            </div>

            <!-- Комментарий -->
            <div class="mb-3">
              <label class="form-label small" style="color: #4a3f6b"
                >Комментарий к заказу</label
              >
              <textarea
                v-model="comment"
                class="form-control form-control-sm"
                rows="2"
                placeholder="Без сахара, пожалуйста..."
                style="
                  border-color: #c4b5e3;
                  background-color: #fff;
                  color: #2d2640;
                "
              ></textarea>
            </div>

            <button
              class="btn w-100"
              style="
                background-color: #4a3f6b;
                color: #fff;
                border-radius: 24px;
                font-weight: 600;
              "
              @click="createOrder"
              :disabled="creating"
            >
              <span
                v-if="creating"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              {{ isAuthenticated ? 'Оформить заказ' : 'Войти и заказать' }}
            </button>

            <div v-if="orderError" class="alert alert-danger mt-3 py-2 small">
              {{ orderError }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();

const isAuthenticated = computed(() => userStore.isAuthenticated);
const comment = ref('');
const creating = ref(false);
const orderError = ref('');

const createOrder = async () => {
  if (!isAuthenticated.value) {
    router.push('/login');
    return;
  }

  if (cartStore.items.length === 0) {
    orderError.value = 'Корзина пуста';
    return;
  }

  creating.value = true;
  orderError.value = '';

  try {
    const items = cartStore.items.map((item) => {
      if (item.type === 'product') {
        return {
          productsId: item.productId,
          quantity: item.quantity,
        };
      } else {
        const coffeeItem: any = {
          coffeeVolumeRelationId: item.coffeeVolumeRelationId,
          quantity: item.quantity,
        };
        if (item.coffeeAdditiveRelationId) {
          coffeeItem.coffeeAdditiveRelationId = item.coffeeAdditiveRelationId;
        }
        return coffeeItem;
      }
    });

    await client.post('/orders', {
      comment: comment.value || '',
      items,
    });

    cartStore.clearCart();
    comment.value = '';
    router.push('/orders');
  } catch (err: any) {
    orderError.value = err.response?.data?.message || 'Ошибка создания заказа';
  } finally {
    creating.value = false;
  }
};
</script>
