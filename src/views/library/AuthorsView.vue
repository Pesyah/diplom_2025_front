<template>
  <section class="page-band">
    <div class="container-xxl">
      <div class="toolbar-panel">
        <div>
          <span class="eyebrow">Справочник</span>
          <h1>Авторы</h1>
        </div>
        <input
          v-model.trim="search"
          class="form-control compact-search"
          type="search"
          placeholder="Найти автора"
        />
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="loading" class="state-panel">
        <div class="spinner-border"></div>
        <p>Загружаем авторов</p>
      </div>

      <div v-else class="authors-grid">
        <router-link
          v-for="author in filteredAuthors"
          :key="author.id"
          class="author-card"
          :to="`/authors/${author.id}`"
        >
          <span class="author-monogram">{{ monogram(author) }}</span>
          <strong>{{ formatAuthorName(author) }}</strong>
          <small>
            {{ formatDate(author.dateOfBirth) }}
            <template v-if="author.dateOfDeath">
              - {{ formatDate(author.dateOfDeath) }}
            </template>
          </small>
          <span class="pill">{{ author.booksCount ?? 0 }} книг</span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { booksApi } from '@/api/library';
import type { Author } from '@/types/library';
import { getApiErrorMessage } from '@/utils/errors';
import { formatAuthorName, formatDate } from '@/utils/format';
import { computed, onMounted, ref } from 'vue';

const authors = ref<Author[]>([]);
const loading = ref(true);
const error = ref('');
const search = ref('');

const filteredAuthors = computed(() => {
  const query = search.value.toLowerCase();
  return authors.value.filter((author) =>
    formatAuthorName(author).toLowerCase().includes(query),
  );
});

const monogram = (author: Author) =>
  `${author.name?.[0] ?? ''}${author.surname?.[0] ?? ''}`.toUpperCase();

const loadAuthors = async () => {
  loading.value = true;
  error.value = '';

  try {
    authors.value = await booksApi.authors();
  } catch (loadError) {
    error.value = getApiErrorMessage(loadError, 'Не удалось загрузить авторов');
  } finally {
    loading.value = false;
  }
};

onMounted(loadAuthors);
</script>
