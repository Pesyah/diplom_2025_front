<template>
  <section class="page-band">
    <div class="container-xxl">
      <router-link class="back-link" to="/authors">Назад к авторам</router-link>

      <div v-if="loading" class="state-panel">
        <div class="spinner-border"></div>
        <p>Загружаем автора</p>
      </div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <template v-else-if="author">
        <header class="author-hero">
          <span class="author-monogram large">{{ monogram }}</span>
          <div>
            <span class="eyebrow">Автор</span>
            <h1>{{ formatAuthorName(author) }}</h1>
            <p>
              {{ formatDate(author.dateOfBirth) }}
              <template v-if="author.dateOfDeath">
                - {{ formatDate(author.dateOfDeath) }}
              </template>
            </p>
          </div>
        </header>

        <div class="section-heading">
          <h2>Книги автора в каталоге</h2>
          <span class="pill">{{ authorBooks.length }} найдено</span>
        </div>

        <div v-if="authorBooks.length === 0" class="empty-panel">
          <h3>Пока нет активных книг автора</h3>
          <p>Когда пользователь выставит книгу и активирует ISBN, она появится здесь.</p>
        </div>

        <div v-else class="book-grid compact">
          <article v-for="book in authorBooks" :key="book.id" class="book-card">
            <BookCover :path="book.avatar" :title="book.name" />
            <div class="book-card-body">
              <div class="book-card-head">
                <span class="pill">{{ bookAvailability(book) }}</span>
                <strong>{{ formatMoney(book.price) }}</strong>
              </div>
              <h3>{{ book.name }}</h3>
              <div class="listing-code-chip">{{ bookListingCode(book) }}</div>
              <p>{{ bookGenres(book) }}</p>
              <router-link class="btn btn-ghost btn-sm" :to="`/books/${book.id}`">
                Подробнее
              </router-link>
            </div>
          </article>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { booksApi } from '@/api/library';
import BookCover from '@/components/BookCover.vue';
import type { Author, Book } from '@/types/library';
import { getApiErrorMessage } from '@/utils/errors';
import {
  bookAvailability,
  bookGenres,
  bookListingCode,
  formatAuthorName,
  formatDate,
  formatMoney,
} from '@/utils/format';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const author = ref<Author | null>(null);
const books = ref<Book[]>([]);
const loading = ref(true);
const error = ref('');
const authorId = computed(() => String(route.params.id));
const monogram = computed(() =>
  author.value
    ? `${author.value.name?.[0] ?? ''}${author.value.surname?.[0] ?? ''}`.toUpperCase()
    : '',
);
const authorBooks = computed(() =>
  books.value.filter((book) =>
    book.authors?.some((item) => item.id === authorId.value),
  ),
);

const load = async () => {
  loading.value = true;
  error.value = '';

  try {
    const [authorData, booksData] = await Promise.all([
      booksApi.authorById(authorId.value),
      booksApi.all(),
    ]);
    author.value = authorData;
    books.value = booksData;
  } catch (loadError) {
    error.value = getApiErrorMessage(loadError, 'Не удалось загрузить автора');
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>
