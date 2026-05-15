<template>
  <section class="page-band hero-band">
    <div class="container-xxl hero-layout">
      <div class="hero-copy">
        <span class="eyebrow">Библиотечный маркетплейс</span>
        <h1>Книги, которые можно купить, арендовать или выставить самому</h1>
        <p>
          Теплый каталог с личными полками, заявками на аренду и историей
          покупок. База приходит из NestJS API проекта.
        </p>
        <div class="hero-actions">
          <router-link v-if="isReader" class="btn btn-primary-soft" to="/my-books">
            Выставить книгу
          </router-link>
          <router-link class="btn btn-ghost" to="/authors">Смотреть авторов</router-link>
        </div>
      </div>

      <div class="hero-shelf" aria-hidden="true">
        <div class="shelf-book tall"></div>
        <div class="shelf-book"></div>
        <div class="shelf-book warm"></div>
        <div class="shelf-book slim"></div>
        <div class="shelf-line"></div>
      </div>
    </div>
  </section>

  <section class="page-band">
    <div class="container-xxl">
      <div class="toolbar-panel">
        <div>
          <span class="eyebrow">Каталог</span>
          <h2>Активные книги</h2>
        </div>
        <div class="filters-grid">
          <input
            v-model.trim="search"
            class="form-control"
            type="search"
            placeholder="Название, код объявления, автор, ISBN"
          />
          <select v-model.number="selectedGenre" class="form-select">
            <option :value="0">Все жанры</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">
              {{ genre.name }}
            </option>
          </select>
          <select v-model.number="selectedType" class="form-select">
            <option :value="0">Все форматы</option>
            <option v-for="type in bookTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="notice" class="alert alert-success">{{ notice }}</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-if="loading" class="state-panel">
        <div class="spinner-border"></div>
        <p>Загружаем каталог</p>
      </div>

      <div v-else-if="filteredBooks.length === 0" class="empty-panel">
        <h3>В каталоге пока нет подходящих книг</h3>
        <p>Попробуйте изменить фильтры или добавьте книгу в личной полке.</p>
      </div>

      <div v-else class="book-grid">
        <article v-for="book in filteredBooks" :key="book.id" class="book-card">
          <BookCover :path="book.avatar" :title="book.name" />
          <div class="book-card-body">
            <div class="book-card-head">
              <span class="pill">{{ bookAvailability(book) }}</span>
              <strong>{{ formatMoney(book.price) }}</strong>
            </div>
            <h3>{{ book.name }}</h3>
            <div class="listing-code-chip">{{ bookListingCode(book) }}</div>
            <p>{{ bookAuthors(book) }}</p>
            <div class="meta-row">
              <span>{{ book.booksType?.name || 'Формат не указан' }}</span>
              <span>{{ bookGenres(book) }}</span>
            </div>
            <div class="book-card-actions">
              <router-link class="btn btn-ghost btn-sm" :to="`/books/${book.id}`">
                Подробнее
              </router-link>
              <button
                v-if="isReader && canBuy(book)"
                class="btn btn-primary-soft btn-sm"
                type="button"
                :disabled="actionBookId === book.id"
                @click="buyBook(book)"
              >
                Купить
              </button>
              <button
                v-if="isReader && book.canBeRented"
                class="btn btn-secondary-soft btn-sm"
                type="button"
                @click="openRent(book)"
              >
                Аренда
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>

  <div v-if="rentBook" class="drawer-backdrop" @click.self="rentBook = null">
    <form class="side-drawer" @submit.prevent="createRent">
      <button class="drawer-close" type="button" @click="rentBook = null">
        Закрыть
      </button>
      <span class="eyebrow">Заявка на аренду</span>
      <h2>{{ rentBook.name }}</h2>
      <p>{{ bookAuthors(rentBook) }}</p>
      <label class="form-label">Дата начала</label>
      <input v-model="rentForm.rentStart" class="form-control" type="date" required />
      <label class="form-label">Дата окончания</label>
      <input v-model="rentForm.rentEnd" class="form-control" type="date" required />
      <button class="btn btn-primary-soft w-100" type="submit" :disabled="renting">
        {{ renting ? 'Отправляем...' : 'Отправить заявку' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { booksApi, rentApi, saleApi } from '@/api/library';
import BookCover from '@/components/BookCover.vue';
import { BOOK_TYPES, GENRES } from '@/constants/library';
import { useUserStore } from '@/stores/userStore';
import type { Book } from '@/types/library';
import { getApiErrorMessage, showSuccessMessage } from '@/utils/errors';
import {
  bookAuthors,
  bookAvailability,
  bookGenres,
  bookListingCode,
  formatMoney,
} from '@/utils/format';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

const books = ref<Book[]>([]);
const loading = ref(true);
const error = ref('');
const notice = ref('');
const search = ref('');
const selectedGenre = ref(0);
const selectedType = ref(0);
const actionBookId = ref('');
const rentBook = ref<Book | null>(null);
const renting = ref(false);
const rentForm = ref({
  rentStart: '',
  rentEnd: '',
});

const genres = GENRES;
const bookTypes = BOOK_TYPES;
const isReader = computed(() => !userStore.isAdmin);

const filteredBooks = computed(() => {
  const query = search.value.toLowerCase();

  return books.value.filter((book) => {
    const haystack = [
      book.name,
      book.listingCode ?? '',
      book.isbn ?? '',
      bookAuthors(book),
      bookGenres(book),
    ]
      .join(' ')
      .toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    const matchesGenre =
      selectedGenre.value === 0 ||
      book.genres?.some((genre) => genre.id === selectedGenre.value);
    const matchesType =
      selectedType.value === 0 || book.booksType?.id === selectedType.value;

    return matchesSearch && matchesGenre && matchesType;
  });
});

const loadBooks = async () => {
  loading.value = true;
  error.value = '';

  try {
    books.value = await booksApi.all();
  } catch (loadError) {
    error.value = getApiErrorMessage(loadError, 'Не удалось загрузить книги');
  } finally {
    loading.value = false;
  }
};

const requireAuth = () => {
  if (userStore.isAdmin) {
    router.push('/admin');
    return false;
  }

  if (userStore.isAuthenticated) return true;
  router.push('/login');
  return false;
};

const canBuy = (book: Book) =>
  !userStore.isAdmin && book.isActive && !book.onlyForRent;

const buyBook = async (book: Book) => {
  if (!requireAuth()) return;
  actionBookId.value = book.id;
  error.value = '';
  notice.value = '';

  try {
    await saleApi.create({ bookId: book.id });
    showSuccessMessage(
      'Заявка на покупку отправлена владельцу. Книга будет продана после подтверждения.',
    );
    notice.value = '';
    await loadBooks();
  } catch (buyError) {
    error.value = getApiErrorMessage(buyError, 'Не удалось купить книгу');
  } finally {
    actionBookId.value = '';
  }
};

const openRent = (book: Book) => {
  if (!requireAuth()) return;
  const today = new Date();
  const week = new Date(today);
  week.setDate(today.getDate() + 7);
  rentBook.value = book;
  rentForm.value = {
    rentStart: today.toISOString().slice(0, 10),
    rentEnd: week.toISOString().slice(0, 10),
  };
};

const createRent = async () => {
  if (!rentBook.value) return;
  renting.value = true;
  error.value = '';
  notice.value = '';

  try {
    await rentApi.create({
      bookId: rentBook.value.id,
      rentStart: rentForm.value.rentStart,
      rentEnd: rentForm.value.rentEnd,
    });
    showSuccessMessage('Заявка отправлена владельцу книги.');
    notice.value = '';
    rentBook.value = null;
  } catch (rentError) {
    error.value = getApiErrorMessage(rentError, 'Не удалось создать аренду');
  } finally {
    renting.value = false;
  }
};

onMounted(loadBooks);
</script>
