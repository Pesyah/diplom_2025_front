<template>
  <div v-if="documents.length" class="mt-2">
    <h6>Прикреплённые документы:</h6>
    <div class="list-group">
      <a
        v-for="doc in documents"
        :key="doc.id"
        href="#"
        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
        @click.prevent="downloadDocument(doc)"
      >
        <div>
          <i class="bi bi-file-earmark-pdf me-2"></i>
          {{ doc.originalName }}
        </div>
        <span class="badge bg-secondary">{{ formatSize(doc.size) }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '@/api/alerts';
import { config } from '@/config';

defineProps<{
  documents: Document[];
}>();

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const downloadDocument = (doc: Document) => {
  const url = `${config.apiUrl}/${doc.url.replace(/\\/g, '/')}`;
  window.open(url, '_blank');
};
</script>
