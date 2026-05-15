<template>
  <section class="page-band">
    <div class="container-xxl">
      <router-link class="back-link" to="/catalog">Назад в каталог</router-link>

      <div v-if="loading" class="state-panel">
        <div class="spinner-border"></div>
        <p>Загружаем книгу</p>
      </div>

      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <article v-else-if="book" class="detail-layout">
        <div class="detail-media">
          <div class="book-gallery-viewer">
            <button
              v-if="imageUrls.length > 1"
              class="gallery-nav gallery-prev"
              type="button"
              aria-label="Предыдущее изображение"
              @click="prevImage"
            >
              &lsaquo;
            </button>
            <img
              v-if="activeImage"
              :src="activeImage"
              :alt="book.name"
              loading="eager"
            />
            <BookCover v-else :path="book.avatar" :title="book.name" />
            <button
              v-if="imageUrls.length > 1"
              class="gallery-nav gallery-next"
              type="button"
              aria-label="Следующее изображение"
              @click="nextImage"
            >
              &rsaquo;
            </button>
          </div>
          <div v-if="imageUrls.length > 1" class="gallery-strip gallery-thumbs">
            <button
              v-for="(item, index) in imageUrls"
              :key="item"
              :class="{ active: activeImageIndex === index }"
              type="button"
              @click="activeImageIndex = index"
            >
              <img :src="item" :alt="book.name" loading="lazy" />
            </button>
          </div>
        </div>

        <div class="detail-content">
          <div class="book-card-head">
            <span class="pill">{{ bookAvailability(book) }}</span>
            <strong>{{ formatMoney(book.price) }}</strong>
          </div>
          <h1>{{ book.name }}</h1>
          <div class="listing-code-banner">
            <span>Код объявления</span>
            <strong>{{ bookListingCode(book) }}</strong>
          </div>
          <p class="lead-text">{{ book.description }}</p>

          <dl class="info-list">
            <div>
              <dt>Авторы</dt>
              <dd>{{ bookAuthors(book) }}</dd>
            </div>
            <div>
              <dt>Жанры</dt>
              <dd>{{ bookGenres(book) }}</dd>
            </div>
            <div>
              <dt>Формат</dt>
              <dd>{{ book.booksType?.name || 'не указан' }}</dd>
            </div>
            <div>
              <dt>ISBN</dt>
              <dd>{{ book.isbn || 'ожидает активации' }}</dd>
            </div>
            <div>
              <dt>Код объявления</dt>
              <dd>{{ bookListingCode(book) }}</dd>
            </div>
          </dl>

          <section v-if="priceHistory.length" class="price-history-panel">
            <div class="section-heading">
              <h2>История цены</h2>
              <span class="pill">{{ priceHistory.length }}</span>
            </div>
            <div class="price-chart-summary">
              <div>
                <span>Старт</span>
                <strong>{{ formatMoney(priceHistory[0]?.price) }}</strong>
              </div>
              <div>
                <span>Текущая</span>
                <strong>{{ formatMoney(priceHistory[priceHistory.length - 1]?.price) }}</strong>
              </div>
              <div>
                <span>Минимум</span>
                <strong>{{ formatMoney(priceChart.minPrice) }}</strong>
              </div>
              <div>
                <span>Максимум</span>
                <strong>{{ formatMoney(priceChart.maxPrice) }}</strong>
              </div>
            </div>
            <div class="price-chart-frame">
              <svg
                class="price-chart"
                viewBox="0 0 640 240"
                role="img"
                aria-label="График изменения цены книги"
              >
                <defs>
                  <linearGradient id="priceHistoryFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#8e4f2f" stop-opacity="0.24" />
                    <stop offset="100%" stop-color="#8e4f2f" stop-opacity="0.02" />
                  </linearGradient>
                </defs>
                <line
                  v-for="line in priceChart.gridLines"
                  :key="line"
                  :x1="priceChart.left"
                  :x2="priceChart.rightEdge"
                  :y1="line"
                  :y2="line"
                  class="price-chart-grid"
                />
                <text
                  :x="priceChart.left - 12"
                  :y="priceChart.top + 5"
                  class="price-chart-label"
                  text-anchor="end"
                >
                  {{ formatMoney(priceChart.maxPrice) }}
                </text>
                <text
                  :x="priceChart.left - 12"
                  :y="priceChart.bottomY + 5"
                  class="price-chart-label"
                  text-anchor="end"
                >
                  {{ formatMoney(priceChart.minPrice) }}
                </text>
                <text
                  v-if="priceChart.lastPoint"
                  :x="priceChart.rightEdge + 12"
                  :y="priceChart.lastPoint.y + 5"
                  class="price-chart-label current"
                >
                  {{ formatMoney(priceChart.lastPoint.price) }}
                </text>
                <path
                  v-if="priceChart.points.length > 1"
                  :d="priceChart.areaPath"
                  class="price-chart-area"
                />
                <path
                  v-if="priceChart.points.length > 1"
                  :d="priceChart.linePath"
                  class="price-chart-line"
                />
                <g
                  v-for="point in priceChart.points"
                  :key="point.id"
                  class="price-chart-point"
                >
                  <circle
                    :cx="point.x"
                    :cy="point.y"
                    r="7"
                    tabindex="0"
                    @click="hoveredPricePoint = point"
                    @focus="hoveredPricePoint = point"
                    @mouseenter="hoveredPricePoint = point"
                    @blur="hoveredPricePoint = null"
                    @mouseleave="hoveredPricePoint = null"
                  />
                  <title>{{ point.label }}</title>
                </g>
              </svg>
              <div
                v-if="hoveredPricePoint"
                class="price-chart-tooltip"
                :style="{
                  left: `${hoveredPricePoint.tooltipX}%`,
                  top: `${hoveredPricePoint.tooltipY}%`,
                }"
              >
                <strong>{{ formatMoney(hoveredPricePoint.price) }}</strong>
                <span>{{ formatDate(hoveredPricePoint.createdAt) }}</span>
              </div>
              <div class="price-chart-axis">
                <span>{{ formatDate(priceHistory[0]?.created_at) }}</span>
                <span>{{ formatDate(priceHistory[priceHistory.length - 1]?.created_at) }}</span>
              </div>
            </div>
          </section>

          <div v-if="notice" class="alert alert-success">{{ notice }}</div>
          <div v-if="actionError" class="alert alert-danger">{{ actionError }}</div>

          <div class="action-row">
            <router-link v-if="isOwner" class="btn btn-primary-soft" to="/my-books">
              Управлять в моей полке
            </router-link>
            <button
              v-if="isReader && !isOwner && canBuy"
              class="btn btn-primary-soft"
              type="button"
              :disabled="submitting"
              @click="buyBook"
            >
              {{ submitting ? 'Оформляем...' : 'Купить книгу' }}
            </button>
            <button
              v-if="isReader && !isOwner && book.canBeRented"
              class="btn btn-secondary-soft"
              type="button"
              @click="rentOpen = true"
            >
              Арендовать
            </button>
            <router-link v-if="isReader && !userStore.isAuthenticated" class="btn btn-ghost" to="/login">
              Войти для сделки
            </router-link>
          </div>
        </div>
      </article>
    </div>
  </section>

  <div v-if="book && rentOpen" class="drawer-backdrop" @click.self="rentOpen = false">
    <form class="side-drawer" @submit.prevent="createRent">
      <button class="drawer-close" type="button" @click="rentOpen = false">
        Закрыть
      </button>
      <span class="eyebrow">Аренда</span>
      <h2>{{ book.name }}</h2>
      <label class="form-label">Дата начала</label>
      <input v-model="rentForm.rentStart" class="form-control" type="date" required />
      <label class="form-label">Дата окончания</label>
      <input v-model="rentForm.rentEnd" class="form-control" type="date" required />
      <button class="btn btn-primary-soft w-100" type="submit" :disabled="submitting">
        {{ submitting ? 'Отправляем...' : 'Отправить заявку' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { booksApi, rentApi, saleApi } from '@/api/library';
import BookCover from '@/components/BookCover.vue';
import { useImageUrl } from '@/composables/useImageUrl';
import { useUserStore } from '@/stores/userStore';
import type { Book } from '@/types/library';
import { getApiErrorMessage, showSuccessMessage } from '@/utils/errors';
import {
  bookAuthors,
  bookAvailability,
  bookGenres,
  bookListingCode,
  formatDate,
  formatMoney,
} from '@/utils/format';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

type PriceChartPoint = {
  id: number;
  x: number;
  y: number;
  price: number;
  createdAt: string;
  label: string;
  tooltipX: number;
  tooltipY: number;
};

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { getImageUrl } = useImageUrl();

const book = ref<Book | null>(null);
const myBooks = ref<Book[]>([]);
const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const actionError = ref('');
const notice = ref('');
const rentOpen = ref(false);
const activeImageIndex = ref(0);
const hoveredPricePoint = ref<PriceChartPoint | null>(null);
const rentForm = ref({
  rentStart: '',
  rentEnd: '',
});

const bookId = computed(() => String(route.params.id));
const hasImagePath = (value?: string | null): value is string =>
  Boolean(value?.trim());
const imageUrls = computed(() => {
  const paths = [
    book.value?.avatar,
    ...(book.value?.photoGallery ?? []),
  ].filter(hasImagePath);

  return Array.from(new Set(paths)).map(getImageUrl).filter(hasImagePath);
});
const activeImage = computed(
  () => imageUrls.value[activeImageIndex.value] ?? '',
);
const priceHistory = computed(() => {
  const history =
    book.value?.priceHistory ?? book.value?.booksPriceHistory ?? [];

  return [...history].sort(
    (left, right) =>
      new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
  );
});
const priceChart = computed(() => {
  const width = 640;
  const height = 240;
  const left = 112;
  const right = 96;
  const top = 24;
  const bottom = 38;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const rightEdge = width - right;
  const bottomY = height - bottom;
  const prices = priceHistory.value.map((entry) => Number(entry.price));
  const finitePrices = prices.filter(Number.isFinite);
  const minPrice = finitePrices.length ? Math.min(...finitePrices) : 0;
  const maxPrice = finitePrices.length ? Math.max(...finitePrices) : 0;
  const range = maxPrice - minPrice;
  const lastIndex = Math.max(priceHistory.value.length - 1, 1);
  const points = priceHistory.value.map((entry, index) => {
    const price = Number(entry.price);
    const safePrice = Number.isFinite(price) ? price : 0;
    const ratio = range === 0 ? 0.5 : (safePrice - minPrice) / range;
    const x =
      priceHistory.value.length === 1
        ? left + plotWidth / 2
        : left + (plotWidth * index) / lastIndex;
    const y = top + plotHeight - plotHeight * ratio;

    return {
      id: entry.id,
      x,
      y,
      price: safePrice,
      createdAt: entry.created_at,
      label: `${formatMoney(entry.price)} · ${formatDate(entry.created_at)}`,
      tooltipX: (x / width) * 100,
      tooltipY: (y / height) * 100,
    };
  });
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const areaPath = points.length
    ? [
      linePath,
      `L ${points[points.length - 1].x} ${bottomY}`,
      `L ${points[0].x} ${bottomY}`,
      'Z',
    ].join(' ')
    : '';

  return {
    left,
    rightEdge,
    top,
    bottomY,
    minPrice,
    maxPrice,
    linePath,
    areaPath,
    points,
    lastPoint: points[points.length - 1] ?? null,
    gridLines: [
      top,
      top + plotHeight * 0.25,
      top + plotHeight * 0.5,
      top + plotHeight * 0.75,
      bottomY,
    ],
  };
});
const isReader = computed(() => !userStore.isAdmin);
const isOwner = computed(() =>
  myBooks.value.some((item) => item.id === book.value?.id),
);
const canBuy = computed(() =>
  Boolean(!userStore.isAdmin && book.value?.isActive && !book.value.onlyForRent),
);

const loadBook = async () => {
  loading.value = true;
  error.value = '';

  try {
    book.value = await booksApi.byId(bookId.value);
    activeImageIndex.value = 0;
    if (userStore.isAuthenticated) {
      myBooks.value = await booksApi.myBooks();
    }
    setDefaultDates();
  } catch (loadError) {
    error.value = getApiErrorMessage(loadError, 'Книга не найдена');
  } finally {
    loading.value = false;
  }
};

const setDefaultDates = () => {
  const start = new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  rentForm.value = {
    rentStart: start.toISOString().slice(0, 10),
    rentEnd: end.toISOString().slice(0, 10),
  };
};

const ensureAuth = async () => {
  if (userStore.isAdmin) {
    await router.push('/admin');
    return false;
  }

  if (userStore.isAuthenticated) return true;
  await router.push('/login');
  return false;
};

const buyBook = async () => {
  if (!book.value || !(await ensureAuth())) return;
  submitting.value = true;
  actionError.value = '';
  notice.value = '';

  try {
    await saleApi.create({ bookId: book.value.id });
    showSuccessMessage(
      'Заявка на покупку отправлена владельцу. Книга будет продана после подтверждения.',
    );
    notice.value = '';
    await loadBook();
  } catch (buyError) {
    actionError.value = getApiErrorMessage(buyError, 'Не удалось купить книгу');
  } finally {
    submitting.value = false;
  }
};

const createRent = async () => {
  if (!book.value || !(await ensureAuth())) return;
  submitting.value = true;
  actionError.value = '';
  notice.value = '';

  try {
    await rentApi.create({
      bookId: book.value.id,
      rentStart: rentForm.value.rentStart,
      rentEnd: rentForm.value.rentEnd,
    });
    showSuccessMessage('Заявка на аренду отправлена владельцу.');
    notice.value = '';
    rentOpen.value = false;
  } catch (rentError) {
    actionError.value = getApiErrorMessage(rentError, 'Не удалось создать аренду');
  } finally {
    submitting.value = false;
  }
};

const prevImage = () => {
  const count = imageUrls.value.length;
  if (count < 2) return;
  activeImageIndex.value = (activeImageIndex.value - 1 + count) % count;
};

const nextImage = () => {
  const count = imageUrls.value.length;
  if (count < 2) return;
  activeImageIndex.value = (activeImageIndex.value + 1) % count;
};

watch(imageUrls, (images) => {
  if (activeImageIndex.value >= images.length) {
    activeImageIndex.value = 0;
  }
});

onMounted(loadBook);
</script>
