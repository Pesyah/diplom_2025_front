<template>
  <section class="page-band">
    <div class="container-xxl">
      <div class="toolbar-panel">
        <div>
          <span class="eyebrow">Авторы</span>
          <h1>Справочник авторов</h1>
        </div>
        <router-link class="btn btn-ghost" to="/admin">К панели</router-link>
      </div>

      <div v-if="notice" class="alert alert-success">{{ notice }}</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="admin-grid">
        <form class="form-panel" @submit.prevent="saveAuthor">
          <span class="eyebrow">Карточка</span>
          <h2>{{ authorForm.id ? 'Редактировать автора' : 'Создать автора' }}</h2>
          <div class="split-fields">
            <div>
              <label class="form-label">Имя</label>
              <input v-model.trim="authorForm.name" class="form-control" required />
            </div>
            <div>
              <label class="form-label">Фамилия</label>
              <input v-model.trim="authorForm.surname" class="form-control" required />
            </div>
          </div>
          <label class="form-label">Отчество</label>
          <input v-model.trim="authorForm.patronymic" class="form-control" />
          <div class="split-fields">
            <div>
              <label class="form-label">Дата рождения</label>
              <input
                v-model="authorForm.dateOfBirth"
                class="form-control"
                type="date"
                required
              />
            </div>
            <div>
              <label class="form-label">Дата смерти</label>
              <input v-model="authorForm.dateOfDeath" class="form-control" type="date" />
            </div>
          </div>
          <button class="btn btn-primary-soft w-100" type="submit" :disabled="saving">
            {{ authorForm.id ? 'Сохранить автора' : 'Добавить автора' }}
          </button>
          <button
            v-if="authorForm.id"
            class="btn btn-ghost w-100"
            type="button"
            @click="resetAuthorForm"
          >
            Отменить
          </button>
        </form>

        <section class="content-panel authors-admin-panel">
          <div class="section-heading">
            <div>
              <span class="eyebrow">Список</span>
              <h2>Авторы</h2>
            </div>
            <span class="pill">{{ filteredAuthors.length }} / {{ authors.length }}</span>
          </div>
          <input
            v-model.trim="authorQuery"
            class="form-control"
            placeholder="Поиск по имени или фамилии"
          />
          <div class="mini-list scrollable roomy-list">
            <div v-for="author in filteredAuthors" :key="author.id" class="mini-list-item">
              <strong>{{ formatAuthorName(author) }}</strong>
              <span>
                {{ formatDate(author.dateOfBirth) }}
                <template v-if="author.dateOfDeath">
                  - {{ formatDate(author.dateOfDeath) }}
                </template>
              </span>
              <small>{{ author.booksCount ?? 0 }} книг</small>
              <div class="action-row">
                <button class="btn btn-ghost btn-sm" type="button" @click="editAuthor(author)">
                  Изменить
                </button>
                <button
                  class="btn btn-danger-soft btn-sm"
                  type="button"
                  @click="deleteAuthor(author)"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { booksApi } from '@/api/library';
import type { Author, CreateAuthorPayload, UpdateAuthorPayload } from '@/types/library';
import { getApiErrorMessage, showSuccessMessage } from '@/utils/errors';
import { formatAuthorName, formatDate } from '@/utils/format';
import { computed, onMounted, ref } from 'vue';

const saving = ref(false);
const error = ref('');
const notice = ref('');
const authors = ref<Author[]>([]);
const authorQuery = ref('');
const authorForm = ref<CreateAuthorPayload & { id?: string }>({
  name: '',
  surname: '',
  patronymic: '',
  dateOfBirth: '',
  dateOfDeath: '',
});

const filteredAuthors = computed(() => {
  const query = authorQuery.value.toLowerCase();
  if (!query) return authors.value;

  return authors.value.filter((author) =>
    formatAuthorName(author).toLowerCase().includes(query),
  );
});

const loadAuthors = async () => {
  error.value = '';

  try {
    authors.value = await booksApi.authors();
  } catch (loadError) {
    error.value = getApiErrorMessage(loadError, 'Не удалось загрузить авторов');
  }
};

const resetAuthorForm = () => {
  authorForm.value = {
    name: '',
    surname: '',
    patronymic: '',
    dateOfBirth: '',
    dateOfDeath: '',
  };
};

const editAuthor = (author: Author) => {
  authorForm.value = {
    id: author.id,
    name: author.name,
    surname: author.surname,
    patronymic: author.patronymic ?? '',
    dateOfBirth: new Date(author.dateOfBirth).toISOString().slice(0, 10),
    dateOfDeath: author.dateOfDeath
      ? new Date(author.dateOfDeath).toISOString().slice(0, 10)
      : '',
  };
};

const saveAuthor = async () => {
  saving.value = true;
  error.value = '';
  notice.value = '';

  try {
    const payload = {
      name: authorForm.value.name,
      surname: authorForm.value.surname,
      patronymic: authorForm.value.patronymic || undefined,
      dateOfBirth: authorForm.value.dateOfBirth,
      dateOfDeath: authorForm.value.dateOfDeath || undefined,
    };

    if (authorForm.value.id) {
      const updatePayload: UpdateAuthorPayload = {
        id: authorForm.value.id,
        ...payload,
      };
      await booksApi.updateAuthor(updatePayload);
      showSuccessMessage('Автор обновлен.');
      notice.value = '';
    } else {
      await booksApi.createAuthor(payload);
      showSuccessMessage('Автор добавлен.');
      notice.value = '';
    }

    resetAuthorForm();
    await loadAuthors();
  } catch (saveError) {
    error.value = getApiErrorMessage(saveError, 'Не удалось сохранить автора');
  } finally {
    saving.value = false;
  }
};

const deleteAuthor = async (author: Author) => {
  const approved = window.confirm(`Удалить автора "${formatAuthorName(author)}"?`);
  if (!approved) return;

  try {
    await booksApi.removeAuthor(author.id);
    showSuccessMessage('Автор удален.');
    notice.value = '';
    await loadAuthors();
  } catch (deleteError) {
    error.value = getApiErrorMessage(deleteError, 'Не удалось удалить автора');
  }
};

onMounted(loadAuthors);
</script>
