<!-- src/views/client/MenuView.vue -->
<template>
  <div class="container py-4">
    <!-- Заголовок + быстрая корзина -->
    <div
      class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3"
    >
      <div>
        <h1 class="fw-bold mb-0" style="color: #4a3f6b">☕ Наше меню</h1>
        <p class="text-muted mb-0">Выберите напиток или вкусняшку</p>
      </div>
      <router-link
        to="/cart"
        class="btn cart-header-btn d-flex align-items-center gap-2"
      >
        🛒 Корзина
        <span
          v-if="cartItemsCount > 0"
          class="badge rounded-pill cart-badge animate-pulse"
        >
          {{ cartItemsCount }}
        </span>
      </router-link>
    </div>

    <!-- Табы -->
    <ul class="nav nav-pills justify-content-center gap-2 mb-4">
      <li class="nav-item">
        <button
          class="nav-link tab-btn"
          :class="{ active: activeTab === 'coffee' }"
          @click="activeTab = 'coffee'"
        >
          ☕ Кофе
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link tab-btn"
          :class="{ active: activeTab === 'products' }"
          @click="activeTab = 'products'"
        >
          🥐 Продукты
        </button>
      </li>
    </ul>

    <!-- Спиннер -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
      <p class="mt-2" style="color: #4a3f6b">Загружаем меню...</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="alert alert-danger text-center">
      {{ error }}
    </div>

    <!-- Кофе -->
    <div v-else-if="activeTab === 'coffee'">
      <div class="row g-4">
        <div
          v-for="coffee in coffeeList"
          :key="coffee.id"
          class="col-12 col-md-6 col-lg-4"
        >
          <div class="card h-100 coffee-card">
            <div
              class="position-relative overflow-hidden"
              style="height: 200px"
            >
              <img
                :src="getImageUrl(coffee.avatar)"
                :alt="coffee.name"
                class="w-100 h-100 coffee-img"
                @error="handleImageError"
              />
              <div class="position-absolute top-0 end-0 m-2">
                <span class="badge price-badge"
                  >от {{ getMinPrice(coffee) }} ₽</span
                >
              </div>
            </div>

            <div class="card-body d-flex flex-column">
              <h5 class="card-title fw-bold mb-1" style="color: #2d2640">
                {{ coffee.name }}
              </h5>
              <p class="card-text text-muted small mb-3">
                {{ coffee.description }}
              </p>

              <div class="mt-auto">
                <p
                  class="fw-semibold mb-2"
                  style="color: #4a3f6b; font-size: 0.9rem"
                >
                  📏 Выберите объем:
                </p>

                <div
                  v-for="vr in coffee.coffeeVolumeRelation"
                  :key="vr.id"
                  class="volume-block p-3 mb-2 rounded-3"
                  :class="{ selected: selectedVolume === vr.id }"
                  @click="selectVolume(coffee, vr)"
                >
                  <div
                    class="d-flex justify-content-between align-items-center mb-2"
                  >
                    <span
                      class="fw-bold"
                      style="color: #2d2640; font-size: 1rem"
                    >
                      {{ vr.coffeeVolume.name }}
                    </span>
                    <span
                      class="fw-bold"
                      style="color: #4a3f6b; font-size: 1rem"
                      >{{ vr.price }} ₽</span
                    >
                  </div>

                  <!-- Добавки (показываются только для выбранного объема) -->
                  <div
                    v-if="
                      selectedVolume === vr.id &&
                      vr.coffeeAdditiveRelation?.length
                    "
                    class="mt-2"
                  >
                    <p class="small mb-2" style="color: #4a3f6b">➕ Добавки:</p>
                    <div
                      v-for="ar in vr.coffeeAdditiveRelation"
                      :key="ar.id"
                      class="additive-row d-flex justify-content-between align-items-center py-2 px-3 rounded-3 mb-1"
                      :class="{
                        'additive-selected': selectedAdditives.has(ar.id),
                      }"
                      @click.stop="toggleAdditive(ar)"
                    >
                      <div class="d-flex align-items-center gap-2">
                        <img
                          v-if="ar.coffeeAdditive?.avatar"
                          :src="getImageUrl(ar.coffeeAdditive.avatar)"
                          class="rounded-circle"
                          style="width: 28px; height: 28px; object-fit: cover"
                          @error="(e: any) => { e.target.style.display = 'none' }"
                        />
                        <span style="color: #2d2640; font-size: 0.9rem">{{
                          ar.coffeeAdditive?.name
                        }}</span>
                      </div>
                      <div class="d-flex align-items-center gap-2">
                        <span
                          class="fw-semibold"
                          style="color: #4a3f6b; font-size: 0.85rem"
                          >+{{ ar.price }} ₽</span
                        >
                        <div
                          class="additive-check"
                          :class="{ checked: selectedAdditives.has(ar.id) }"
                        >
                          <span v-if="selectedAdditives.has(ar.id)">✓</span>
                        </div>
                      </div>
                    </div>

                    <!-- Кнопка "В корзину" -->
                    <button
                      class="btn btn-sm w-100 mt-3 add-to-cart-btn"
                      @click.stop="addCoffeeWithAdditivesToCart(coffee, vr)"
                    >
                      <span v-if="addedAnimation === vr.id" class="me-1"
                        >✓</span
                      >
                      {{
                        selectedAdditives.size > 0
                          ? `В корзину (${selectedAdditives.size} добав.)
                           ${getSelectedAdditivesPrice(vr)} ₽`
                          : 'В корзину без добавок'
                      }}
                    </button>

                    <div
                      v-if="getCoffeeCartCountForVolume(vr) > 0"
                      class="mt-2 text-center"
                    >
                      <span class="badge in-cart-badge"
                        >В корзине:
                        {{ getCoffeeCartCountForVolume(vr) }} шт.</span
                      >
                    </div>
                  </div>

                  <!-- Если нет добавок -->
                  <div
                    v-if="
                      selectedVolume === vr.id &&
                      !vr.coffeeAdditiveRelation?.length
                    "
                    class="mt-2"
                  >
                    <button
                      class="btn btn-sm w-100 add-to-cart-btn"
                      @click.stop="addCoffeeToCart(coffee, vr)"
                    >
                      <span v-if="addedAnimation === vr.id" class="me-1"
                        >✓</span
                      >
                      Добавить в корзину
                    </button>
                    <div
                      v-if="getCoffeeCartCountSimple(vr.id) > 0"
                      class="mt-2 text-center"
                    >
                      <span class="badge in-cart-badge"
                        >В корзине:
                        {{ getCoffeeCartCountSimple(vr.id) }} шт.</span
                      >
                    </div>
                  </div>

                  <!-- Не выбран -->
                  <div
                    v-if="selectedVolume !== vr.id"
                    class="text-center mt-2 volume-hint"
                  >
                    Нажмите для выбора
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Продукты -->
    <div v-else>
      <div class="row g-4">
        <div
          v-for="product in productList"
          :key="product.id"
          class="col-12 col-md-6 col-lg-4"
        >
          <div class="card h-100 product-card">
            <!-- Аватарка продукта -->
            <div
              class="position-relative overflow-hidden"
              style="height: 180px"
            >
              <img
                :src="getImageUrl(product.avatar)"
                :alt="product.name"
                class="w-100 h-100"
                style="
                  object-fit: cover;
                  transition: transform 0.4s;
                  border-radius: 16px 16px 0 0;
                "
                @error="handleProductImageError"
              />
            </div>
            <div class="card-body d-flex flex-column">
              <div
                class="d-flex justify-content-between align-items-start mb-2"
              >
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <h5 class="card-title fw-bold mb-0" style="color: #2d2640">
                      {{ product.name }}
                    </h5>
                    <span class="badge category-badge">{{
                      product.productsCategory?.name
                    }}</span>
                  </div>
                  <p class="card-text text-muted small mb-0">
                    {{ product.description }}
                  </p>
                </div>
              </div>
              <div
                class="mt-3 d-flex justify-content-between align-items-center"
              >
                <span class="fw-bold" style="color: #4a3f6b; font-size: 1.2rem"
                  >{{ product.price }} ₽</span
                >
                <button class="btn add-btn" @click="addProductToCart(product)">
                  <span v-if="addedAnimation === product.id" class="me-1"
                    >✓</span
                  >
                  + В корзину
                </button>
              </div>
              <div
                v-if="getProductCartCount(product.id) > 0"
                class="mt-2 text-center"
              >
                <span class="badge in-cart-badge"
                  >В корзине: {{ getProductCartCount(product.id) }} шт.</span
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
import type {
  CartCoffeeAdditive,
  CartCoffeeItem,
  CartProductItem,
} from '@/stores/cartStore';
import { useCartStore } from '@/stores/cartStore';
import { computed, onMounted, reactive, ref } from 'vue';

const { getImageUrl } = useImageUrl();
const cartStore = useCartStore();

const activeTab = ref<'coffee' | 'products'>('coffee');
const loading = ref(true);
const error = ref('');
const coffeeList = ref<any[]>([]);
const productList = ref<any[]>([]);
const addedAnimation = ref<string>('');
const selectedVolume = ref<number | null>(null);
const selectedAdditives = reactive(new Set<number>());

const cartItemsCount = computed(() => cartStore.itemsCount());

const triggerAnimation = (key: string) => {
  addedAnimation.value = key;
  setTimeout(() => {
    addedAnimation.value = '';
  }, 1200);
};

const loadData = async () => {
  loading.value = true;
  error.value = '';
  try {
    const [coffeeRes, productsRes] = await Promise.all([
      client.get('/coffee/all'),
      client.get('/products/all'),
    ]);
    coffeeList.value = coffeeRes.data;
    productList.value = productsRes.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки меню';
  } finally {
    loading.value = false;
  }
};

const getMinPrice = (coffee: any) => {
  const prices =
    coffee.coffeeVolumeRelation?.map((vr: any) => Number(vr.price)) || [];
  return prices.length
    ? Math.min(...prices).toFixed(0)
    : Number(coffee.price).toFixed(0);
};

const selectVolume = (coffee: any, vr: any) => {
  if (selectedVolume.value === vr.id) {
    selectedVolume.value = null;
    selectedAdditives.clear();
  } else {
    selectedVolume.value = vr.id;
    selectedAdditives.clear();
  }
};

const toggleAdditive = (ar: any) => {
  if (selectedAdditives.has(ar.id)) {
    selectedAdditives.delete(ar.id);
  } else {
    selectedAdditives.add(ar.id);
  }
};

const getSelectedAdditivesPrice = (vr: any) => {
  let price = Number(vr.price);
  selectedAdditives.forEach((additiveId) => {
    const ar = vr.coffeeAdditiveRelation.find((a: any) => a.id === additiveId);
    if (ar) price += Number(ar.price);
  });
  return price;
};

const addCoffeeWithAdditivesToCart = (coffee: any, vr: any) => {
  const additives: CartCoffeeAdditive[] = [];
  selectedAdditives.forEach((additiveId) => {
    const ar = vr.coffeeAdditiveRelation.find((a: any) => a.id === additiveId);
    if (ar) {
      additives.push({
        coffeeAdditiveRelationId: ar.id,
        coffeeAdditiveRelationPrice: Number(ar.price),
        additiveName: ar.coffeeAdditive.name,
      });
    }
  });

  const item: CartCoffeeItem = {
    type: 'coffee',
    coffeeId: coffee.id,
    coffeeName: coffee.name,
    coffeeVolumeRelationId: vr.id,
    coffeeVolumeRelationPrice: Number(vr.price),
    volumeName: vr.coffeeVolume.name,
    additives,
    quantity: 1,
  };

  cartStore.addItem(item);
  selectedAdditives.clear();
  triggerAnimation(vr.id);
};

const addCoffeeToCart = (coffee: any, vr: any) => {
  const item: CartCoffeeItem = {
    type: 'coffee',
    coffeeId: coffee.id,
    coffeeName: coffee.name,
    coffeeVolumeRelationId: vr.id,
    coffeeVolumeRelationPrice: Number(vr.price),
    volumeName: vr.coffeeVolume.name,
    additives: [],
    quantity: 1,
  };
  cartStore.addItem(item);
  triggerAnimation(vr.id);
};

const addProductToCart = (product: any) => {
  const item: CartProductItem = {
    type: 'product',
    productId: product.id,
    productName: product.name,
    price: Number(product.price),
    quantity: 1,
  };
  cartStore.addItem(item);
  triggerAnimation(product.id);
};

const getCoffeeCartCountForVolume = (vr: any) => {
  let count = 0;
  cartStore.items.forEach((item) => {
    if (item.type === 'coffee' && item.coffeeVolumeRelationId === vr.id) {
      count += item.quantity;
    }
  });
  return count;
};

const getCoffeeCartCountSimple = (volumeRelationId: number) => {
  let count = 0;
  cartStore.items.forEach((item) => {
    if (
      item.type === 'coffee' &&
      item.coffeeVolumeRelationId === volumeRelationId &&
      item.additives.length === 0
    ) {
      count += item.quantity;
    }
  });
  return count;
};

const getProductCartCount = (productId: string) => {
  const item = cartStore.items.find(
    (i) => i.type === 'product' && i.productId === productId,
  );
  return item?.quantity || 0;
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" fill="%23e8dff5"><rect width="300" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="40">☕</text></svg>',
    );
};
const handleProductImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" fill="%23e8dff5"><rect width="300" height="180"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="40">🥐</text></svg>',
    );
};

onMounted(loadData);
</script>

<style scoped>
.tab-btn {
  border-radius: 24px !important;
  padding: 0.6rem 2rem !important;
  color: #4a3f6b !important;
  border: 2px solid #c4b5e3 !important;
  font-weight: 500;
  transition: all 0.3s;
  background-color: transparent;
}
.tab-btn.active {
  background-color: #4a3f6b !important;
  color: #fff !important;
  border-color: #4a3f6b !important;
}
.tab-btn:hover:not(.active) {
  background-color: #e8dff5 !important;
}

.cart-header-btn {
  background-color: #4a3f6b;
  color: #fff;
  border-radius: 24px;
  padding: 0.6rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s;
  text-decoration: none;
  border: none;
}
.cart-header-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(74, 63, 107, 0.4);
  color: #fff;
}
.cart-badge {
  background-color: #ffc107;
  color: #2d2640;
  font-size: 0.85rem;
}
.animate-pulse {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

.coffee-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}
.coffee-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(74, 63, 107, 0.2);
  border-color: #c4b5e3;
}
.coffee-img {
  object-fit: cover;
  transition: transform 0.4s;
}
.coffee-card:hover .coffee-img {
  transform: scale(1.08);
}
.price-badge {
  background-color: rgba(74, 63, 107, 0.85);
  color: #fff;
  font-size: 0.8rem;
}

.product-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}
.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(74, 63, 107, 0.2);
  border-color: #b8a9d4;
}
.category-badge {
  background-color: #e8dff5;
  color: #4a3f6b;
  font-size: 0.7rem;
}

.volume-block {
  background-color: #f9f7fc;
  border: 2px solid #e8dff5;
  transition: all 0.3s;
  cursor: pointer;
}
.volume-block:hover {
  background-color: #f0ebf8;
  border-color: #c4b5e3;
}
.volume-block.selected {
  background-color: #fdfaf5;
  border-color: #4a3f6b;
  box-shadow: 0 4px 12px rgba(74, 63, 107, 0.15);
}

.additive-row {
  background-color: #fff;
  border: 1px solid #e8dff5;
  transition: all 0.2s;
  cursor: pointer;
}
.additive-row:hover {
  background-color: #f5f0eb;
  border-color: #c4b5e3;
}
.additive-selected {
  background-color: #f0ebf8;
  border-color: #b8a9d4;
}

.additive-check {
  width: 24px;
  height: 24px;
  border: 2px solid #c4b5e3;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #4a3f6b;
  transition: all 0.2s;
}
.additive-check.checked {
  background-color: #4a3f6b;
  border-color: #4a3f6b;
  color: #fff;
}

.add-to-cart-btn {
  background-color: #4a3f6b;
  color: #fff;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  transition: all 0.3s;
  border: 2px solid #4a3f6b;
}
.add-to-cart-btn:hover {
  background-color: #5c4f82;
  border-color: #5c4f82;
  transform: scale(1.03);
  box-shadow: 0 6px 16px rgba(74, 63, 107, 0.3);
}

.add-btn {
  background-color: #4a3f6b;
  color: #fff;
  border-radius: 20px;
  padding: 0.4rem 1.2rem;
  font-weight: 500;
  transition: all 0.3s;
  border: 2px solid #4a3f6b;
}
.add-btn:hover {
  background-color: #5c4f82;
  border-color: #5c4f82;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(74, 63, 107, 0.3);
}
.in-cart-badge {
  background-color: #e8dff5;
  color: #4a3f6b;
}
.volume-hint {
  color: #b8a9d4;
  font-size: 0.85rem;
}
</style>
ф
