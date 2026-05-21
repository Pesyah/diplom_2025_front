<!-- src/views/admin/AdminOrderDetailView.vue -->
<template>
  <div class="container py-4">
    <router-link
      to="/admin/orders"
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
            <div class="d-flex align-items-center gap-2 mt-2">
              <span
                class="badge-status"
                :style="getStatusStyle(order.orderStatus?.id)"
                >{{ order.orderStatus?.name }}</span
              >
              <select
                class="form-select form-select-sm"
                style="width: 140px; border-color: #c4b5e3"
                :value="order.orderStatus?.id"
                @change="
                  changeStatus(
                    Number(($event.target as HTMLSelectElement).value),
                  )
                "
              >
                <option v-for="s in statuses" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>
            <p class="mt-2 mb-0" style="color: #4a3f6b">
              👤 {{ order.users?.name }} ({{ order.users?.email }},
              {{ order.users?.phone }})
            </p>
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
                      getItemAdditiveNames(item).length > 0
                    "
                    class="mt-1"
                  >
                    <span class="text-muted small">
                      Добавка:
                      {{ getItemAdditiveNames(item).join(', ') }}
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
const statuses = ref([
  { id: 1, name: 'Не начат' },
  { id: 2, name: 'В работе' },
  { id: 3, name: 'Готов' },
  { id: 4, name: 'Выдан' },
  { id: 5, name: 'Отменён' },
]);

interface OrderCoffeeAdditiveRelation {
  price?: string | number;
  coffeeAdditive?: {
    name?: string;
  };
}

interface OrderItemWithAdditives {
  coffeeAdditiveRelations?: OrderCoffeeAdditiveRelation[];
  coffeeAdditiveRelation?:
    | OrderCoffeeAdditiveRelation
    | OrderCoffeeAdditiveRelation[];
}

const getItemAvatar = (item: any) => {
  if (item.products) return item.products.avatar || '';
  if (item.coffeeVolumeRelation?.coffee)
    return item.coffeeVolumeRelation.coffee.avatar || '';
  return '';
};
const loadOrder = async () => {
  loading.value = true;
  try {
    const res = await client.get(`/orders/admin/by-id/${route.params.id}`);
    order.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }
};

const changeStatus = async (statusId: number) => {
  try {
    await client.patch('/orders/admin', {
      id: order.value.id,
      orderStatusId: statusId,
    });
    await loadOrder();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  }
};

const getItemName = (item: any) => {
  if (item.products) return item.products.name;
  if (item.coffeeVolumeRelation) {
    let name = `${item.coffeeVolumeRelation.coffee?.name || 'Кофе'} (${
      item.coffeeVolumeRelation.coffeeVolume?.name || ''
    })`;
    const additiveNames = getItemAdditiveNames(item);
    if (additiveNames.length > 0) name += ` + ${additiveNames.join(', ')}`;
    return name;
  }
  return 'Неизвестно';
};

const getItemAdditiveRelations = (
  item: OrderItemWithAdditives,
): OrderCoffeeAdditiveRelation[] => {
  if (Array.isArray(item.coffeeAdditiveRelations)) {
    return item.coffeeAdditiveRelations;
  }

  if (Array.isArray(item.coffeeAdditiveRelation)) {
    return item.coffeeAdditiveRelation;
  }

  if (item.coffeeAdditiveRelation) {
    return [item.coffeeAdditiveRelation];
  }

  return [];
};

const getItemAdditiveNames = (item: OrderItemWithAdditives) => {
  return getItemAdditiveRelations(item)
    .map((relation) => relation.coffeeAdditive?.name)
    .filter(
      (name: string | undefined): name is string =>
        typeof name === 'string' && name.length > 0,
    );
};

const getItemPrice = (item: any) => {
  const quantity = Number(item.quantity);
  const totalValue = Number(item.totalValue);
  if (quantity > 0 && Number.isFinite(totalValue)) {
    return totalValue / quantity;
  }

  if (item.products) return Number(item.products.price) || 0;
  let price = 0;
  if (item.coffeeVolumeRelation)
    price = Number(item.coffeeVolumeRelation.price) || 0;
  price += getItemAdditiveRelations(item).reduce(
    (sum, relation) => sum + (Number(relation.price) || 0),
    0,
  );
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
