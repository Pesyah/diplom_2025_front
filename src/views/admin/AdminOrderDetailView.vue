<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Детали заказа #{{ order?.id?.slice(0, 8) }}</h2>
      <button @click="router.back()" class="btn btn-outline-secondary">
        ← Назад
      </button>
    </div>

    <div v-if="!order">Загрузка...</div>

    <div v-else>
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <p><strong>ID заказа:</strong> {{ order.id }}</p>
              <p><strong>Пользователь:</strong> {{ order.users?.email }}</p>
              <p><strong>Телефон:</strong> {{ order.users?.phone || '—' }}</p>
            </div>
            <div class="col-md-4">
              <p>
                <strong>Статус:</strong>
                <select
                  @change="changeStatus"
                  v-model="selectedStatusId"
                  class="form-select form-select-sm d-inline-block w-auto ms-2"
                >
                  <option v-for="s in allStatuses" :key="s.id" :value="s.id">
                    {{ s.name }}
                  </option>
                </select>
              </p>
              <p>
                <strong>Дата:</strong>
                {{ new Date(order.createdAt).toLocaleString() }}
              </p>
            </div>
            <div class="col-md-4">
              <p>
                <strong>Общая сумма:</strong>
                <span class="fw-bold fs-5">{{ getOrderTotal() }} ₽</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <h4>Состав заказа</h4>
      <div v-for="part in order.ordersParts" :key="part.id" class="card mb-3">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-2">
              <img
                v-if="part.pizzaSizeRelation?.pizza?.photo"
                :src="getImageUrl(part.pizzaSizeRelation.pizza.photo)"
                style="width: 80px; height: 80px; object-fit: cover"
                class="rounded"
              />
              <div
                v-else
                class="bg-secondary rounded"
                style="width: 80px; height: 80px"
              ></div>
            </div>
            <div class="col-md-4">
              <h5>{{ part.pizzaSizeRelation?.pizza?.name }}</h5>
              <p class="text-muted mb-0">
                Размер: {{ part.pizzaSizeRelation?.pizzaSize?.name }}
              </p>
            </div>
            <div class="col-md-2">
              <p class="mb-0">Цена: {{ part.priceAtTime }} ₽</p>
            </div>
            <div class="col-md-2">
              <p class="mb-0">Кол-во: {{ part.count }}</p>
            </div>
            <div class="col-md-2">
              <p class="mb-0 fw-bold">
                Итого: {{ part.priceAtTime * part.count }} ₽
              </p>
            </div>
          </div>

          <div
            v-if="part.pizzaAdditiveRelations?.length"
            class="mt-3 pt-2 border-top"
          >
            <div class="d-flex flex-wrap gap-2">
              <div
                v-for="add in part.pizzaAdditiveRelations"
                :key="add.id"
                class="d-flex align-items-center gap-2 bg-light rounded p-1 pe-2"
              >
                <img
                  v-if="add.pizzaAdditive?.avatar"
                  :src="getImageUrl(add.pizzaAdditive.avatar)"
                  style="width: 30px; height: 30px; object-fit: cover"
                  class="rounded"
                />
                <small>{{ add.pizzaAdditive?.name }}</small>
                <small class="text-muted" v-if="add.isAdd"
                  >+{{ add.price }}₽</small
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
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const order = ref<any>(null);
const allStatuses = ref([]);
const selectedStatusId = ref(0);
const { getImageUrl } = useImageUrl();

const fetchOrder = async () => {
  const res = await client.get(`/orders/by-id/${route.params.id}`);
  order.value = res.data;
  selectedStatusId.value = order.value.orderStatus?.id;
};

const fetchStatuses = async () => {
  const res = await client.get('/orders/all-relations');
  allStatuses.value = res.data.orderStatus;
};

const getOrderTotal = () => {
  if (!order.value?.ordersParts) return 0;
  return order.value.ordersParts.reduce(
    (sum: number, part: any) => sum + part.priceAtTime * part.count,
    0,
  );
};

const changeStatus = async () => {
  await client.patch(`/orders/admin/change-status/${order.value.id}`, {
    statusId: selectedStatusId.value,
  });
  await fetchOrder();
};

onMounted(async () => {
  await fetchStatuses();
  await fetchOrder();
});
</script>
