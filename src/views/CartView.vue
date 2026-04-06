<template>
  <div>
    <h2 class="mb-4">Корзина</h2>

    <div v-if="cartStore.items.length === 0" class="text-center py-5">
      <p>Корзина пуста</p>
      <router-link to="/" class="btn btn-primary">Перейти в меню</router-link>
    </div>

    <div v-else>
      <div class="row">
        <div class="col-md-8">
          <div v-for="item in cartStore.items" :key="item.id" class="card mb-3">
            <div class="card-body">
              <div class="row align-items-center">
                <!-- Фото и информация -->
                <div class="col-md-5">
                  <div class="d-flex align-items-center gap-3">
                    <img
                      v-if="item.photo"
                      :src="getImageUrl(item.photo)"
                      style="width: 60px; height: 60px; object-fit: cover"
                      class="rounded"
                    />
                    <div
                      v-else
                      class="bg-secondary rounded"
                      style="width: 60px; height: 60px"
                    ></div>
                    <div>
                      <h5 class="mb-0">{{ item.pizzaName }}</h5>
                      <p class="text-muted mb-0">{{ item.sizeName }}</p>
                      <small v-if="item.additives.length" class="text-muted">
                        + {{ item.additives.map((a) => a.name).join(', ') }}
                      </small>
                    </div>
                  </div>
                </div>

                <!-- Цена -->
                <div class="col-md-2 text-center">
                  <p class="mb-0 fw-bold">{{ item.price }} ₽</p>
                </div>

                <!-- Количество -->
                <div class="col-md-3">
                  <div class="input-group" style="width: 120px; margin: 0 auto">
                    <button
                      class="btn btn-outline-secondary"
                      @click="updateCount(item.id, item.count - 1)"
                    >
                      -
                    </button>
                    <span
                      value=""
                      @change="updateCount(item.id, item.count)"
                      class="form-control text-center"
                      style="width: 50px"
                      >{{ item.count }}</span
                    >
                    <button
                      class="btn btn-outline-secondary"
                      @click="updateCount(item.id, item.count + 1)"
                    >
                      +
                    </button>
                  </div>
                </div>

                <!-- Итого -->
                <div class="col-md-2 text-end">
                  <p class="fw-bold mb-0">{{ item.price * item.count }} ₽</p>
                  <button
                    @click="removeItem(item.id)"
                    class="btn btn-danger btn-sm mt-2"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5>Итого: {{ totalPrice() }} ₽</h5>
              <button @click="createOrder" class="btn btn-primary w-100 mt-3">
                Оформить заказ
              </button>
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
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const router = useRouter();

const updateCount = (id: string, count: number) =>
  cartStore.updateCount(id, count);
const removeItem = (id: string) => cartStore.removeItem(id);
const totalPrice = cartStore.totalPrice;

const createOrder = async () => {
  const orderItems = cartStore.items.map((item) => ({
    pizzaSizeRelationId: item.pizzaSizeRelationId,
    additiveIds: item.additives.map((a) => a.id),
    count: item.count,
  }));

  await client.post('/orders', { items: orderItems });
  cartStore.clearCart();
  router.push('/orders');
};

const { getImageUrl } = useImageUrl();
</script>
