<template>
  <section class="page-band">
    <div class="container-xxl">
      <div class="toolbar-panel">
        <div>
          <span class="eyebrow">Личная полка</span>
          <h1>Мои книги</h1>
        </div>
        <button class="btn btn-primary-soft" type="button" @click="startCreate">
          {{ isFormOpen && !editingId ? 'Новая книга открыта' : 'Добавить книгу' }}
        </button>
      </div>

      <div v-if="notice" class="alert alert-success">{{ notice }}</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <section v-if="isFormOpen" class="form-panel book-form-panel">
        <div class="section-heading">
          <div>
            <span class="eyebrow">
              {{ editingId ? 'Редактирование' : 'Новая книга' }}
            </span>
            <h2>{{ editingId ? 'Обновить карточку' : 'Выставить книгу' }}</h2>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" @click="closeForm">
            Скрыть форму
          </button>
        </div>

        <form class="book-form-grid" @submit.prevent="saveBook">
          <div class="book-form-main">
            <label class="form-label">Название</label>
            <input v-model.trim="form.name" class="form-control" required />

            <div class="selection-grid">
              <div class="selection-panel">
                <label class="form-label">Авторы</label>
                <input
                  v-model.trim="authorSearch"
                  class="form-control"
                  type="search"
                  placeholder="Найти автора"
                />
                <div class="selected-tags">
                  <button
                    v-for="author in selectedAuthors"
                    :key="author.id"
                    type="button"
                    @click="toggleAuthor(author.id)"
                  >
                    {{ formatAuthorName(author) }}
                  </button>
                  <span v-if="selectedAuthors.length === 0">Авторов пока нет</span>
                </div>
                <div class="selection-list">
                  <label
                    v-for="author in visibleAuthors"
                    :key="author.id"
                    class="selection-option"
                  >
                    <input
                      type="checkbox"
                      :checked="form.authorsIds.includes(author.id)"
                      @change="toggleAuthor(author.id)"
                    />
                    <span>{{ formatAuthorName(author) }}</span>
                  </label>
                </div>
                <small>
                  Показано {{ visibleAuthors.length }} из {{ filteredAuthors.length }}.
                  Используйте поиск, если автора нет в первой десятке.
                </small>
              </div>

              <div class="selection-panel">
                <label class="form-label">Жанры</label>
                <input
                  v-model.trim="genreSearch"
                  class="form-control"
                  type="search"
                  placeholder="Найти жанр"
                />
                <div class="selected-tags">
                  <button
                    v-for="genre in selectedGenres"
                    :key="genre.id"
                    type="button"
                    @click="toggleGenre(genre.id)"
                  >
                    {{ genre.name }}
                  </button>
                  <span v-if="selectedGenres.length === 0">Жанры пока не выбраны</span>
                </div>
                <div class="selection-list">
                  <label
                    v-for="genre in visibleGenres"
                    :key="genre.id"
                    class="selection-option"
                  >
                    <input
                      type="checkbox"
                      :checked="form.genresIds.includes(genre.id)"
                      @change="toggleGenre(genre.id)"
                    />
                    <span>{{ genre.name }}</span>
                  </label>
                </div>
                <small>
                  Показано {{ visibleGenres.length }} из {{ filteredGenres.length }}.
                  Все жанры остаются на фронте, фильтруем локально.
                </small>
              </div>
            </div>

            <div class="split-fields">
              <div>
                <label class="form-label">Формат</label>
                <select v-model.number="form.booksTypeId" class="form-select" required>
                  <option v-for="type in bookTypes" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="form-label">Цена</label>
                <input
                  v-model.number="form.price"
                  class="form-control"
                  min="0"
                  step="1"
                  type="number"
                  required
                />
              </div>
            </div>

            <label class="form-label">Описание</label>
            <textarea
              v-model.trim="form.description"
              class="form-control"
              rows="5"
              required
            ></textarea>

            <div class="toggle-row">
              <label>
                <input v-model="form.canBeRented" type="checkbox" />
                Можно арендовать
              </label>
              <label>
                <input v-model="form.onlyForRent" type="checkbox" />
                Только аренда
              </label>
            </div>
          </div>

          <aside class="book-form-aside">
            <div v-if="editingBook" class="listing-code-panel">
              <span>Код объявления</span>
              <strong>{{ bookListingCode(editingBook) }}</strong>
            </div>
            <div v-else class="listing-code-panel muted">
              <span>Код объявления</span>
              <strong>Будет создан автоматически</strong>
            </div>

            <label class="form-label">ISBN</label>
            <input v-model.trim="form.isbn" class="form-control" placeholder="978-..." />

            <div class="upload-row">
              <div>
                <label class="form-label">Обложка</label>
                <input
                  class="form-control"
                  accept="image/*"
                  type="file"
                  @change="uploadAvatar"
                />
              </div>
              <BookCover :path="form.avatar" :title="form.name || 'Обложка'" />
            </div>

            <label class="form-label">Галерея</label>
            <input
              class="form-control"
              accept="image/*"
              type="file"
              multiple
              @change="uploadGallery"
            />
            <div v-if="form.photoGallery.length" class="gallery-strip editable">
              <div v-for="path in form.photoGallery" :key="path" class="gallery-thumb">
                <img :src="getImageUrl(path)" alt="Фото книги" />
                <button type="button" @click="removeGalleryImage(path)">Убрать</button>
              </div>
            </div>

            <div v-if="uploading" class="small-status">Загрузка файла...</div>
            <div v-if="uploadError" class="small-error">{{ uploadError }}</div>

            <button class="btn btn-primary-soft w-100" type="submit" :disabled="saving">
              {{ saving ? 'Сохраняем...' : editingId ? 'Сохранить' : 'Создать книгу' }}
            </button>
            <button
              v-if="editingId"
              class="btn btn-ghost w-100"
              type="button"
              @click="startCreate"
            >
              Создать другую книгу
            </button>
          </aside>
        </form>
      </section>

      <section class="workspace-main">
        <div v-if="loading" class="state-panel">
          <div class="spinner-border"></div>
          <p>Загружаем вашу полку</p>
        </div>

        <div v-else-if="books.length === 0" class="empty-panel">
          <h3>На полке пока пусто</h3>
          <p>Добавьте книгу, загрузите обложку и активируйте ISBN.</p>
        </div>

        <div v-else class="shelf-list">
          <article v-for="book in books" :key="book.id" class="shelf-item">
            <BookCover :path="book.avatar" :title="book.name" />
            <div>
              <div class="book-card-head">
                <span class="pill" :class="{ muted: !book.isActive }">
                  {{ bookAvailability(book) }}
                </span>
                <strong>{{ formatMoney(book.price) }}</strong>
              </div>
              <h2>{{ book.name }}</h2>
              <div class="listing-code-chip">{{ bookListingCode(book) }}</div>
              <p>{{ bookAuthors(book) }}</p>
              <div class="meta-row">
                <span>{{ bookGenres(book) }}</span>
                <span>ISBN: {{ book.isbn || 'не активирован' }}</span>
              </div>
              <div class="action-row">
                <button class="btn btn-ghost btn-sm" type="button" @click="editBook(book)">
                  Редактировать
                </button>
                <button
                  v-if="!book.isActive"
                  class="btn btn-secondary-soft btn-sm"
                  type="button"
                  @click="openActivation(book)"
                >
                  Активировать
                </button>
                <button
                  class="btn btn-danger-soft btn-sm"
                  type="button"
                  @click="removeBook(book)"
                >
                  Удалить
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>

  <div
    v-if="activationBook"
    class="drawer-backdrop"
    @click.self="activationBook = null"
  >
    <form class="side-drawer" @submit.prevent="activateBook">
      <button class="drawer-close" type="button" @click="activationBook = null">
        Закрыть
      </button>
      <span class="eyebrow">Активация</span>
      <h2>{{ activationBook.name }}</h2>
      <div class="listing-code-panel">
        <span>Код объявления</span>
        <strong>{{ bookListingCode(activationBook) }}</strong>
      </div>
      <label class="form-label">ISBN</label>
      <input v-model.trim="activationIsbn" class="form-control" required />
      <button class="btn btn-primary-soft w-100" type="submit" :disabled="saving">
        Активировать книгу
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { booksApi } from '@/api/library';
import BookCover from '@/components/BookCover.vue';
import { useImageUrl } from '@/composables/useImageUrl';
import { useUpload } from '@/composables/useUpload';
import { BOOK_TYPES, DEFAULT_BOOK_FORM, GENRES } from '@/constants/library';
import type { Author, Book, CreateBookPayload, UpdateBookPayload } from '@/types/library';
import {
  getApiErrorMessage,
  showErrorMessage,
  showSuccessMessage,
} from '@/utils/errors';
import {
  bookAuthors,
  bookAvailability,
  bookGenres,
  bookListingCode,
  formatAuthorName,
  formatMoney,
} from '@/utils/format';
import { computed, nextTick, onMounted, ref } from 'vue';

type BookForm = CreateBookPayload;

const { uploadFile, uploading, uploadError } = useUpload();
const { getImageUrl } = useImageUrl();

const books = ref<Book[]>([]);
const authors = ref<Author[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const notice = ref('');
const editingId = ref('');
const isFormOpen = ref(false);
const authorSearch = ref('');
const genreSearch = ref('');
const activationBook = ref<Book | null>(null);
const activationIsbn = ref('');
const genres = GENRES;
const bookTypes = BOOK_TYPES;
const form = ref<BookForm>(createEmptyForm());
const editingBook = computed(
  () => books.value.find((book) => book.id === editingId.value) ?? null,
);
const optionLimit = 10;
const filteredAuthors = computed(() => {
  const query = authorSearch.value.toLowerCase();
  if (!query) return authors.value;

  return authors.value.filter((author) =>
    formatAuthorName(author).toLowerCase().includes(query),
  );
});
const visibleAuthors = computed(() => filteredAuthors.value.slice(0, optionLimit));
const selectedAuthors = computed(() =>
  authors.value.filter((author) => form.value.authorsIds.includes(author.id)),
);
const filteredGenres = computed(() => {
  const query = genreSearch.value.toLowerCase();
  if (!query) return genres;

  return genres.filter((genre) => genre.name.toLowerCase().includes(query));
});
const visibleGenres = computed(() => filteredGenres.value.slice(0, optionLimit));
const selectedGenres = computed(() =>
  genres.filter((genre) => form.value.genresIds.includes(genre.id)),
);

function createEmptyForm(): BookForm {
  return {
    ...DEFAULT_BOOK_FORM,
    authorsIds: [],
    genresIds: [],
    photoGallery: [],
  };
}

const loadData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const [booksData, authorsData] = await Promise.all([
      booksApi.myBooks(),
      booksApi.authors(),
    ]);
    books.value = booksData;
    authors.value = authorsData;
  } catch (loadError) {
    error.value = getApiErrorMessage(loadError, 'Не удалось загрузить полку');
  } finally {
    loading.value = false;
  }
};

const scrollToForm = async () => {
  await nextTick();
  document.querySelector('.book-form-panel')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

const startCreate = async () => {
  editingId.value = '';
  form.value = createEmptyForm();
  isFormOpen.value = true;
  error.value = '';
  notice.value = '';
  await scrollToForm();
};

const closeForm = () => {
  isFormOpen.value = false;
  editingId.value = '';
  form.value = createEmptyForm();
  authorSearch.value = '';
  genreSearch.value = '';
};

const editBook = async (book: Book) => {
  editingId.value = book.id;
  isFormOpen.value = true;
  form.value = {
    name: book.name,
    authorsIds: book.authors?.map((author) => author.id) ?? [],
    genresIds: book.genres?.map((genre) => genre.id) ?? [],
    booksTypeId: book.booksType?.id ?? 2,
    canBeRented: book.canBeRented,
    onlyForRent: book.onlyForRent,
    price: Number(book.price),
    description: book.description,
    avatar: book.avatar ?? '',
    photoGallery: book.photoGallery ?? [],
    isbn: book.isbn ?? '',
  };
  notice.value = '';
  error.value = '';
  await scrollToForm();
};

const normalizedForm = () => {
  const payload: CreateBookPayload = {
    ...form.value,
    price: Number(form.value.price),
    canBeRented: form.value.onlyForRent ? true : form.value.canBeRented,
    avatar: form.value.avatar || undefined,
    photoGallery: form.value.photoGallery.filter(Boolean),
    isbn: form.value.isbn || undefined,
  };

  return payload;
};

const toggleAuthor = (authorId: string) => {
  if (form.value.authorsIds.includes(authorId)) {
    form.value.authorsIds = form.value.authorsIds.filter((id) => id !== authorId);
    return;
  }

  form.value.authorsIds.push(authorId);
};

const toggleGenre = (genreId: number) => {
  if (form.value.genresIds.includes(genreId)) {
    form.value.genresIds = form.value.genresIds.filter((id) => id !== genreId);
    return;
  }

  form.value.genresIds.push(genreId);
};

const saveBook = async () => {
  saving.value = true;
  error.value = '';
  notice.value = '';

  try {
    if (form.value.authorsIds.length === 0) {
      throw new Error('Выберите хотя бы одного автора');
    }

    if (form.value.genresIds.length === 0) {
      throw new Error('Выберите хотя бы один жанр');
    }

    const payload = normalizedForm();
    if (editingId.value) {
      const updatePayload: UpdateBookPayload = {
        id: editingId.value,
        ...payload,
      };
      await booksApi.update(updatePayload);
      showSuccessMessage('Книга обновлена.');
      notice.value = '';
    } else {
      await booksApi.create(payload);
      showSuccessMessage(
        'Книга создана. Код объявления присвоен автоматически, для публикации активируйте ISBN.',
      );
      notice.value = '';
    }
    closeForm();
    await loadData();
  } catch (saveError) {
    if (saveError instanceof Error) {
      error.value = saveError.message;
      showErrorMessage(saveError.message);
    } else {
      error.value = getApiErrorMessage(saveError, 'Не удалось сохранить книгу');
    }
  } finally {
    saving.value = false;
  }
};

const getFiles = (event: Event) => {
  const input = event.target as HTMLInputElement;
  return Array.from(input.files ?? []);
};

const uploadAvatar = async (event: Event) => {
  const [file] = getFiles(event);
  if (!file) return;
  const document = await uploadFile(file);
  form.value.avatar = document.url || document.path;
};

const uploadGallery = async (event: Event) => {
  const files = getFiles(event);
  for (const file of files) {
    const document = await uploadFile(file);
    form.value.photoGallery.push(document.url || document.path);
  }
};

const removeGalleryImage = (path: string) => {
  form.value.photoGallery = form.value.photoGallery.filter((item) => item !== path);
};

const openActivation = (book: Book) => {
  activationBook.value = book;
  activationIsbn.value = book.isbn ?? '';
};

const activateBook = async () => {
  if (!activationBook.value) return;
  saving.value = true;
  error.value = '';
  notice.value = '';

  try {
    await booksApi.activate({
      bookId: activationBook.value.id,
      isbn: activationIsbn.value,
    });
    activationBook.value = null;
    showSuccessMessage('Книга активирована и появилась в каталоге.');
    notice.value = '';
    await loadData();
  } catch (activateError) {
    error.value = getApiErrorMessage(activateError, 'Не удалось активировать книгу');
  } finally {
    saving.value = false;
  }
};

const removeBook = async (book: Book) => {
  const approved = window.confirm(
    `Удалить книгу "${book.name}" (${bookListingCode(book)})?`,
  );
  if (!approved) return;

  error.value = '';
  notice.value = '';

  try {
    await booksApi.remove(book.id);
    showSuccessMessage('Книга удалена.');
    notice.value = '';
    if (editingId.value === book.id) {
      closeForm();
    }
    await loadData();
  } catch (removeError) {
    error.value = getApiErrorMessage(removeError, 'Не удалось удалить книгу');
  }
};

onMounted(loadData);
</script>
