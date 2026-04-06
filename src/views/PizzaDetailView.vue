<template>
  <div>
    <button @click="router.back()" class="btn btn-outline-secondary mb-4">
      ← Назад
    </button>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="pizza" class="row">
      <div class="col-md-5">
        <img
          v-if="pizza.photo"
          :src="getImageUrl(pizza.photo)"
          class="img-fluid rounded shadow w-100"
          style="object-fit: cover; height: 30vw"
        />
        <div
          v-else
          class="bg-secondary rounded d-flex align-items-center justify-content-center"
          style="height: 300px"
        >
          <span class="text-white">Нет фото</span>
        </div>
      </div>

      <div class="col-md-7">
        <h1>{{ pizza.name }}</h1>
        <span class="badge bg-secondary mb-3">{{ pizza.pizzaType?.name }}</span>

        <p class="mt-3">{{ pizza.description }}</p>
        <p><strong>Состав:</strong> {{ pizza.structure }}</p>

        <!-- БЖУ -->
        <div class="row mt-4">
          <div class="col-6 col-md-3">
            <div class="border rounded p-2 text-center">
              <small class="text-muted">Белки</small>
              <p class="mb-0 fw-bold">{{ pizza.proteins }}г</p>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="border rounded p-2 text-center">
              <small class="text-muted">Жиры</small>
              <p class="mb-0 fw-bold">{{ pizza.fats }}г</p>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="border rounded p-2 text-center">
              <small class="text-muted">Углеводы</small>
              <p class="mb-0 fw-bold">{{ pizza.carbohydrates }}г</p>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="border rounded p-2 text-center">
              <small class="text-muted">Ккал</small>
              <p class="mb-0 fw-bold">{{ pizza.kilocalories }}</p>
            </div>
          </div>
        </div>

        <!-- Размеры -->
        <div class="mt-4">
          <h5>Выберите размер:</h5>
          <div class="row g-2">
            <div
              v-for="size in pizza.pizzaSizeRelation"
              :key="size.id"
              class="col-6 col-md-3"
            >
              <div
                class="border rounded p-3 text-center"
                :class="{
                  'border-primary bg-light': selectedSizeId === size.id,
                }"
                style="cursor: pointer"
                @click="selectSize(size)"
              >
                <strong>{{ size.pizzaSize?.name }} см</strong>
                <p class="mb-0 text-primary fw-bold">{{ size.price }} ₽</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Добавки с фото -->
        <div v-if="selectedSize" class="mt-4">
          <h5>Добавки:</h5>
          <div v-if="availableAdditives.length === 0" class="text-muted">
            Нет доступных добавок
          </div>
          <div v-else class="row g-2">
            <div
              v-for="additive in availableAdditives"
              :key="additive.id"
              class="col-12"
            >
              <div
                class="border rounded p-2 d-flex justify-content-between align-items-center"
              >
                <div class="d-flex align-items-center gap-2">
                  <img
                    v-if="additive.pizzaAdditive?.avatar"
                    :src="getImageUrl(additive.pizzaAdditive?.avatar)"
                    style="width: 40px; height: 40px; object-fit: cover"
                    class="rounded"
                  />
                  <div>
                    <span>{{ additive.pizzaAdditive?.name }}</span>
                    <small v-if="!additive.isAdd" class="text-muted ms-2"
                      >(можно убрать)</small
                    >
                  </div>
                </div>
                <div v-if="additive.isAdd">
                  <span class="text-primary fw-bold me-2"
                    >+{{ additive.price }} ₽</span
                  >
                  <button
                    @click="toggleAdditive(additive)"
                    class="btn btn-sm"
                    :class="
                      selectedAdditiveIds.includes(additive.id)
                        ? 'btn-danger'
                        : 'btn-outline-primary'
                    "
                  >
                    {{
                      selectedAdditiveIds.includes(additive.id)
                        ? 'Убрать'
                        : 'Добавить'
                    }}
                  </button>
                </div>
                <div v-else>
                  <button
                    @click="toggleAdditive(additive)"
                    class="btn btn-sm"
                    :class="
                      selectedAdditiveIds.includes(additive.id)
                        ? 'btn-success'
                        : 'btn-outline-secondary'
                    "
                  >
                    {{
                      selectedAdditiveIds.includes(additive.id)
                        ? 'Оставить'
                        : 'Убрать'
                    }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопка добавления в корзину -->
        <div class="mt-4">
          <div class="d-flex align-items-center gap-3">
            <div class="input-group" style="width: 120px">
              <button class="btn btn-outline-secondary" @click="decrementCount">
                -
              </button>
              <input
                type="number"
                v-model.number="count"
                class="form-control text-center"
                min="1"
              />
              <button class="btn btn-outline-secondary" @click="incrementCount">
                +
              </button>
            </div>
            <button
              @click="addToCart"
              class="btn btn-primary btn-lg flex-grow-1"
            >
              Добавить в корзину за {{ totalPrice }} ₽
            </button>
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
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const pizza = ref<any>(null);
const loading = ref(true);
const selectedSize = ref<any>(null);
const selectedSizeId = ref('');
const selectedAdditiveIds = ref<string[]>([]);
const count = ref(1);

const availableAdditives = computed(() => {
  if (!selectedSize.value) return [];
  return selectedSize.value.pizzaAdditiveRelation || [];
});

const totalPrice = computed(() => {
  if (!selectedSize.value) return 0;
  let price = selectedSize.value.price;
  for (const addId of selectedAdditiveIds.value) {
    const add = availableAdditives.value.find((a: any) => a.id === addId);
    if (add && add.isAdd) price += add.price;
  }
  return price * count.value;
});

const selectSize = (size: any) => {
  selectedSize.value = size;
  selectedSizeId.value = size.id;
  selectedAdditiveIds.value = [];
};

const toggleAdditive = (additive: any) => {
  const index = selectedAdditiveIds.value.indexOf(additive.id);
  if (index === -1) {
    selectedAdditiveIds.value.push(additive.id);
  } else {
    selectedAdditiveIds.value.splice(index, 1);
  }
};

const incrementCount = () => count.value++;
const decrementCount = () => {
  if (count.value > 1) count.value--;
};

const addToCart = () => {
  if (!selectedSize.value) {
    alert('Выберите размер');
    return;
  }

  const additivesList = availableAdditives.value
    .filter((a: any) => selectedAdditiveIds.value.includes(a.id))
    .map((a: any) => ({
      id: a.id,
      name: a.pizzaAdditive?.name,
      price: a.isAdd ? a.price : 0,
    }));

  cartStore.addItem({
    id: `${selectedSize.value.id}_${selectedAdditiveIds.value.join('_')}`,
    pizzaSizeRelationId: selectedSize.value.id,
    pizzaName: pizza.value.name,
    sizeName: selectedSize.value.pizzaSize?.name,
    price: totalPrice.value / count.value,
    count: count.value,
    photo: pizza.value.photo, // добавить фото пиццы
    additives: additivesList.map((a) => ({
      ...a,
      avatar: a.avatar, // добавить фото добавки
    })),
  });

  router.push('/cart');
};

const { getImageUrl } = useImageUrl();
onMounted(async () => {
  try {
    const res = await client.get(`/pizza/by-id/${route.params.id}`);
    pizza.value = res.data;
    if (pizza.value.pizzaSizeRelation?.length) {
      selectSize(pizza.value.pizzaSizeRelation[0]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
