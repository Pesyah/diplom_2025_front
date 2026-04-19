<template>
  <div>
    <label class="form-label">{{ label }}</label>
    <input
      type="file"
      class="form-control"
      multiple
      @change="onFileChange"
      :accept="accept"
    />
    <div v-if="uploading" class="text-muted small mt-1">Загрузка...</div>
    <div v-if="uploadedDocs.length" class="mt-2">
      <div
        v-for="(doc, idx) in uploadedDocs"
        :key="doc.id"
        class="d-flex align-items-center justify-content-between border rounded p-2 mb-1"
      >
        <span>{{ doc.originalName }} ({{ formatSize(doc.size) }})</span>
        <button
          type="button"
          class="btn btn-sm btn-outline-danger"
          @click="removeDocument(idx)"
        >
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { documentsApi, type UploadedDocument } from '@/api/documents';
import { ref } from 'vue';

const props = defineProps<{
  label?: string;
  accept?: string;
  modelValue?: string[]; // массив ID загруженных документов
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const uploading = ref(false);
const uploadedDocs = ref<UploadedDocument[]>([]);

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files) return;

  uploading.value = true;
  const newDocIds: string[] = [...(props.modelValue || [])];

  for (const file of Array.from(files)) {
    try {
      const res = await documentsApi.upload(file);
      uploadedDocs.value.push(res.data);
      newDocIds.push(res.data.id);
    } catch (err) {
      console.error('Ошибка загрузки файла', err);
      alert(`Не удалось загрузить файл ${file.name}`);
    }
  }

  emit('update:modelValue', newDocIds);
  uploading.value = false;
  target.value = ''; // очищаем input
};

const removeDocument = (index: number) => {
  const removed = uploadedDocs.value.splice(index, 1)[0];
  const newIds = (props.modelValue || []).filter((id) => id !== removed.id);
  emit('update:modelValue', newIds);
};
</script>
