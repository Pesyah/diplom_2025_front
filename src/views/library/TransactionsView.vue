<template>
  <section class="page-band">
    <div class="container-xxl">
      <div class="toolbar-panel">
        <div>
          <span class="eyebrow">Сделки</span>
          <h1>Аренда и покупки</h1>
        </div>
        <div class="segmented">
          <button
            :class="{ active: mode === 'rent' }"
            type="button"
            @click="mode = 'rent'"
          >
            Аренда
          </button>
          <button
            :class="{ active: mode === 'sale' }"
            type="button"
            @click="mode = 'sale'"
          >
            Продажи
          </button>
        </div>
      </div>

      <div v-if="notice" class="alert alert-success">{{ notice }}</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-if="mode === 'rent'" class="content-panel">
        <div class="section-heading">
          <h2>Заявки на аренду</h2>
          <div class="segmented small">
            <button
              v-for="scope in rentScopes"
              :key="scope.value"
              :class="{ active: rentScope === scope.value }"
              type="button"
              @click="rentScope = scope.value"
            >
              {{ scope.label }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="state-panel">
          <div class="spinner-border"></div>
          <p>Загружаем аренду</p>
        </div>

        <div v-else-if="rents.length === 0" class="empty-panel">
          <h3>Заявок пока нет</h3>
          <p>Аренду можно оформить из карточки книги в каталоге.</p>
        </div>

        <div v-else class="transaction-list">
          <article v-for="rent in rents" :key="rent.id" class="transaction-item">
            <BookCover :path="rent.books.avatar" :title="rent.books.name" />
            <div class="transaction-body">
              <div class="book-card-head">
                <span class="pill" :class="{ muted: !rent.isAccepted }">
                  {{ rent.isAccepted ? 'Подтверждена' : 'Ожидает' }}
                </span>
                <strong>{{ formatDate(rent.rentStart) }} - {{ formatDate(rent.rentEnd) }}</strong>
              </div>
              <h2>{{ rent.books.name }}</h2>
              <div class="listing-code-chip">{{ bookListingCode(rent.books) }}</div>
              <p>{{ bookAuthors(rent.books) }}</p>
              <div class="meta-row">
                <span>Арендатор: {{ formatUserName(rent.buyer) }}</span>
                <span>Владелец: {{ formatUserName(rent.seller) }}</span>
                <span>Неустойка: {{ formatMoney(rent.penaltyPrice) }}</span>
              </div>

              <div v-if="dateDrafts[rent.id]" class="rent-edit-row">
                <input
                  v-model="dateDrafts[rent.id].rentStart"
                  class="form-control"
                  type="date"
                  :disabled="rent.isAccepted || !isBuyer(rent)"
                />
                <input
                  v-model="dateDrafts[rent.id].rentEnd"
                  class="form-control"
                  type="date"
                  :disabled="rent.isAccepted || !isBuyer(rent)"
                />
                <input
                  v-model.number="penaltyDrafts[rent.id]"
                  class="form-control"
                  min="0"
                  step="1"
                  type="number"
                  placeholder="Неустойка"
                  :disabled="!isSeller(rent)"
                />
              </div>

              <div class="action-row">
                <button
                  v-if="isSeller(rent) && !rent.isAccepted"
                  class="btn btn-primary-soft btn-sm"
                  type="button"
                  @click="acceptRent(rent)"
                >
                  Подтвердить
                </button>
                <button
                  v-if="isBuyer(rent) && !rent.isAccepted"
                  class="btn btn-secondary-soft btn-sm"
                  type="button"
                  @click="updateRentDates(rent)"
                >
                  Обновить даты
                </button>
                <button
                  v-if="isSeller(rent)"
                  class="btn btn-secondary-soft btn-sm"
                  type="button"
                  @click="updatePenalty(rent)"
                >
                  Сохранить неустойку
                </button>
                <button
                  class="btn btn-danger-soft btn-sm"
                  type="button"
                  @click="removeRent(rent)"
                >
                  Удалить заявку
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div v-else class="content-panel">
        <div class="section-heading">
          <h2>Продажи и покупки</h2>
          <div class="segmented small">
            <button
              v-for="scope in saleScopes"
              :key="scope.value"
              :class="{ active: saleScope === scope.value }"
              type="button"
              @click="saleScope = scope.value"
            >
              {{ scope.label }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="state-panel">
          <div class="spinner-border"></div>
          <p>Загружаем продажи</p>
        </div>

        <div v-else-if="sales.length === 0" class="empty-panel">
          <h3>Продаж пока нет</h3>
          <p>Книгу можно купить из каталога, если она не только для аренды.</p>
        </div>

        <div v-else class="transaction-list">
          <article v-for="sale in sales" :key="sale.id" class="transaction-item">
            <BookCover :path="sale.books.avatar" :title="sale.books.name" />
            <div class="transaction-body">
              <div class="book-card-head">
                <span class="pill" :class="{ muted: !sale.isAccepted }">
                  {{ sale.isAccepted ? 'Подтверждена' : 'Ожидает подтверждения' }}
                </span>
                <strong>{{ formatMoney(sale.price) }}</strong>
              </div>
              <h2>{{ sale.books.name }}</h2>
              <div class="listing-code-chip">{{ bookListingCode(sale.books) }}</div>
              <p>{{ bookAuthors(sale.books) }}</p>
              <div class="meta-row">
                <span>Дата: {{ formatDate(sale.created_at) }}</span>
                <span>Покупатель: {{ formatUserName(sale.buyer) }}</span>
                <span>Продавец: {{ formatUserName(sale.seller) }}</span>
                <span>
                  Статус:
                  {{ sale.isAccepted ? 'покупка подтверждена' : 'ждет решения продавца' }}
                </span>
              </div>
              <div class="action-row">
                <button
                  v-if="isSaleSeller(sale) && !sale.isAccepted"
                  class="btn btn-primary-soft btn-sm"
                  type="button"
                  @click="acceptSale(sale)"
                >
                  Подтвердить покупку
                </button>
                <router-link class="btn btn-ghost btn-sm" :to="`/books/${sale.books.id}`">
                  Открыть книгу
                </router-link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { rentApi, saleApi } from '@/api/library';
import BookCover from '@/components/BookCover.vue';
import { useUserStore } from '@/stores/userStore';
import type { Rent, Sale } from '@/types/library';
import { getApiErrorMessage, showSuccessMessage } from '@/utils/errors';
import {
  bookAuthors,
  bookListingCode,
  formatDate,
  formatMoney,
  formatUserName,
} from '@/utils/format';
import { onMounted, reactive, ref, watch } from 'vue';

type Mode = 'rent' | 'sale';
type Scope = 'all' | 'incoming' | 'outgoing';

const userStore = useUserStore();
const mode = ref<Mode>('rent');
const rentScope = ref<Scope>('all');
const saleScope = ref<Scope>('all');
const rents = ref<Rent[]>([]);
const sales = ref<Sale[]>([]);
const loading = ref(false);
const error = ref('');
const notice = ref('');
const penaltyDrafts = reactive<Record<string, number | undefined>>({});
const dateDrafts = reactive<Record<string, { rentStart: string; rentEnd: string }>>({});

const rentScopes: Array<{ value: Scope; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'incoming', label: 'Входящие' },
  { value: 'outgoing', label: 'Исходящие' },
];
const saleScopes = rentScopes;

const isBuyer = (rent: Rent) => rent.buyer.id === userStore.user?.id;
const isSeller = (rent: Rent) => rent.seller.id === userStore.user?.id;
const isSaleSeller = (sale: Sale) => sale.seller.id === userStore.user?.id;

const prepareRentDrafts = () => {
  rents.value.forEach((rent) => {
    penaltyDrafts[rent.id] = Number(rent.penaltyPrice ?? 0);
    dateDrafts[rent.id] = {
      rentStart: new Date(rent.rentStart).toISOString().slice(0, 10),
      rentEnd: new Date(rent.rentEnd).toISOString().slice(0, 10),
    };
  });
};

const loadRents = async () => {
  loading.value = true;
  error.value = '';

  try {
    if (rentScope.value === 'incoming') {
      rents.value = await rentApi.incoming();
    } else if (rentScope.value === 'outgoing') {
      rents.value = await rentApi.outgoing();
    } else {
      rents.value = await rentApi.all();
    }
    prepareRentDrafts();
  } catch (loadError) {
    error.value = getApiErrorMessage(loadError, 'Не удалось загрузить аренду');
  } finally {
    loading.value = false;
  }
};

const loadSales = async () => {
  loading.value = true;
  error.value = '';

  try {
    if (saleScope.value === 'incoming') {
      sales.value = await saleApi.incoming();
    } else if (saleScope.value === 'outgoing') {
      sales.value = await saleApi.outgoing();
    } else {
      sales.value = await saleApi.all();
    }
  } catch (loadError) {
    error.value = getApiErrorMessage(loadError, 'Не удалось загрузить продажи');
  } finally {
    loading.value = false;
  }
};

const reload = async () => {
  notice.value = '';
  if (mode.value === 'rent') {
    await loadRents();
  } else {
    await loadSales();
  }
};

const acceptRent = async (rent: Rent) => {
  try {
    await rentApi.accept(rent.id);
    showSuccessMessage('Аренда подтверждена.');
    notice.value = '';
    await loadRents();
  } catch (acceptError) {
    error.value = getApiErrorMessage(acceptError, 'Не удалось подтвердить аренду');
  }
};

const updateRentDates = async (rent: Rent) => {
  const draft = dateDrafts[rent.id];
  if (!draft) return;

  try {
    await rentApi.update(rent.id, {
      rentStart: draft.rentStart,
      rentEnd: draft.rentEnd,
    });
    showSuccessMessage('Даты аренды обновлены.');
    notice.value = '';
    await loadRents();
  } catch (updateError) {
    error.value = getApiErrorMessage(updateError, 'Не удалось обновить аренду');
  }
};

const updatePenalty = async (rent: Rent) => {
  try {
    await rentApi.update(rent.id, {
      penaltyPrice: Number(penaltyDrafts[rent.id] ?? 0),
    });
    showSuccessMessage('Неустойка сохранена.');
    notice.value = '';
    await loadRents();
  } catch (updateError) {
    error.value = getApiErrorMessage(updateError, 'Не удалось сохранить неустойку');
  }
};

const removeRent = async (rent: Rent) => {
  const approved = window.confirm(`Удалить заявку по книге "${rent.books.name}"?`);
  if (!approved) return;

  try {
    await rentApi.remove(rent.id);
    showSuccessMessage('Заявка удалена.');
    notice.value = '';
    await loadRents();
  } catch (removeError) {
    error.value = getApiErrorMessage(removeError, 'Не удалось удалить заявку');
  }
};

const acceptSale = async (sale: Sale) => {
  try {
    await saleApi.accept(sale.id);
    showSuccessMessage('Покупка подтверждена. Книга снята с продажи.');
    notice.value = '';
    await loadSales();
  } catch (acceptError) {
    error.value = getApiErrorMessage(acceptError, 'Не удалось подтвердить покупку');
  }
};

watch([mode, rentScope, saleScope], reload);
onMounted(reload);
</script>
