<!-- src/views/admin/AdminCategoryFormView.vue -->
<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="mb-4">
              {{ isEdit ? 'Редактировать категорию' : 'Создать категорию' }}
            </h2>

            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Название *</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  required
                  placeholder="Например: Смартфоны и планшеты"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea
                  v-model="form.description"
                  class="form-control"
                  rows="4"
                  placeholder="Описание категории..."
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Иконка (URL или загрузите файл)</label
                >
                <input
                  v-model="form.avatar"
                  type="text"
                  class="form-control mb-2"
                  placeholder="https://example.com/icon.png"
                />
                <div class="input-group">
                  <input
                    type="file"
                    class="form-control"
                    accept="image/*"
                    @change="handleFileUpload"
                  />
                </div>
                <div v-if="form.avatar" class="mt-2">
                  <img
                    :src="getImageUrl(form.avatar)"
                    class="rounded"
                    style="max-width: 200px; max-height: 200px"
                  />
                </div>
              </div>

              <div v-if="error" class="alert alert-danger">{{ error }}</div>

              <div class="d-flex gap-2">
                <button
                  type="submit"
                  class="btn btn-warning"
                  :disabled="saving || loading"
                >
                  {{
                    saving ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'
                  }}
                </button>
                <router-link
                  to="/admin/categories"
                  class="btn btn-outline-secondary"
                >
                  Отмена
                </router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useImageUrl } from '@/composables/useImageUrl';
import { useUpload } from '@/composables/useUpload';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { getImageUrl } = useImageUrl();
const { uploadFile } = useUpload();

const isEdit = ref(false);
const saving = ref(false);
const loading = ref(false);
const error = ref('');

const form = ref({
  name: '',
  description: '',
  avatar: '',
});

const editId = ref<number | null>(null);

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    isEdit.value = true;
    editId.value = Number(id);
    await loadCategory(Number(id));
  }
});

const loadCategory = async (id: number) => {
  loading.value = true;
  error.value = '';

  try {
    const res = await client.get(`/admin/categories/${id}`);
    console.log('Category detail response:', res.data);

    // Может быть прямым объектом или вложенным
    const category = res.data.category || res.data;

    form.value = {
      name: category.name || '',
      description: category.description || '',
      avatar: category.avatar || '',
    };

    console.log('Form data loaded:', form.value);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки категории';
    console.error('Error loading category:', err);
  } finally {
    loading.value = false;
  }
};

const handleFileUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    const res = await uploadFile(file);
    form.value.avatar =
      res.path || res.url || res.filePath || res.filename || '';
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки файла';
    console.error('Upload error:', err);
  }
};

const handleSubmit = async () => {
  saving.value = true;
  error.value = '';

  try {
    if (isEdit.value && editId.value) {
      await client.patch('/admin/categories', {
        id: editId.value,
        name: form.value.name,
        description: form.value.description,
        avatar: form.value.avatar,
      });
    } else {
      await client.post('/admin/categories', {
        name: form.value.name,
        description: form.value.description,
        avatar: form.value.avatar,
      });
    }
    router.push('/admin/categories');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка сохранения';
    console.error('Save error:', err.response?.data);
  } finally {
    saving.value = false;
  }
};
</script>
